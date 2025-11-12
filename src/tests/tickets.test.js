const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../app');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const { generateAccessToken } = require('../utils/jwt');

describe('Tickets API', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    const testDbUri = process.env.MONGODB_URI?.replace(/\/[^/]+$/, '/service-client-test') || 'mongodb://127.0.0.1:27017/service-client-test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testDbUri);
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Ticket.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  beforeEach(async () => {
    // Nettoyer complètement avant chaque test
    await Ticket.deleteMany({});
    await User.deleteMany({});
    
    // Attendre un peu pour s'assurer que le nettoyage est terminé
    await new Promise(resolve => setTimeout(resolve, 10));

    // Créer un utilisateur de test
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123'
    });
    userId = user._id;
    authToken = generateAccessToken({ userId: user._id.toString(), email: user.email });
  });

  describe('POST /tickets', () => {
    it('should create a new ticket', async () => {
      const response = await request(app)
        .post('/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Ticket',
          description: 'This is a test ticket'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe('Test Ticket');
      expect(response.body.createdBy).toHaveProperty('_id');
      expect(response.body.createdBy._id).toBe(userId.toString());
    });

    it('should not create ticket without authentication', async () => {
      const response = await request(app)
        .post('/tickets')
        .send({
          title: 'Test Ticket',
          description: 'This is a test ticket'
        });

      expect(response.status).toBe(401);
    });

    it('should not create ticket without title', async () => {
      const response = await request(app)
        .post('/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'This is a test ticket'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /tickets', () => {
    beforeEach(async () => {
      await Ticket.create([
        {
          title: 'Ticket 1',
          description: 'Description 1',
          createdBy: userId
        },
        {
          title: 'Ticket 2',
          description: 'Description 2',
          createdBy: userId
        }
      ]);
    });

    it('should get all tickets', async () => {
      const response = await request(app)
        .get('/tickets')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body.data.length).toBe(2);
    });

    it('should paginate tickets', async () => {
      const response = await request(app)
        .get('/tickets?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.total).toBe(2);
    });
  });

  describe('GET /tickets/:id', () => {
    let ticketId;

    beforeEach(async () => {
      const ticket = await Ticket.create({
        title: 'Test Ticket',
        description: 'Test Description',
        createdBy: userId
      });
      ticketId = ticket._id;
    });

    it('should get a ticket by id', async () => {
      const response = await request(app)
        .get(`/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(ticketId.toString());
    });

    it('should return 404 for non-existent ticket', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/tickets/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});

