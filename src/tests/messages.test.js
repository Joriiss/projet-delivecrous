const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../app');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const { generateAccessToken } = require('../utils/jwt');

describe('Messages API', () => {
  let authToken;
  let userId;
  let ticketId;

  beforeAll(async () => {
    const testDbUri = process.env.MONGODB_URI?.replace(/\/[^/]+$/, '/service-client-test') || 'mongodb://127.0.0.1:27017/service-client-test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testDbUri);
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Ticket.deleteMany({});
    await Message.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  beforeEach(async () => {
    // Nettoyer dans le bon ordre (dépendances d'abord)
    await Message.deleteMany({});
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

    // Créer un ticket de test
    const ticket = await Ticket.create({
      title: 'Test Ticket',
      description: 'Test Description',
      createdBy: userId
    });
    ticketId = ticket._id;
  });

  describe('POST /messages/tickets/:ticketId/messages', () => {
    it('should create a new message', async () => {
      const response = await request(app)
        .post(`/messages/tickets/${ticketId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'This is a test message'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.content).toBe('This is a test message');
      expect(response.body.authorId._id).toBe(userId.toString());
    });

    it('should not create message without content', async () => {
      const response = await request(app)
        .post(`/messages/tickets/${ticketId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: ''
        });

      expect(response.status).toBe(400);
    });

    it('should not create message for non-existent ticket', async () => {
      // S'assurer que l'utilisateur existe toujours
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found in database');
      }
      
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/messages/tickets/${fakeId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Test message'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /messages/tickets/:ticketId/messages', () => {
    beforeEach(async () => {
      await Message.create([
        {
          content: 'Message 1',
          ticketId,
          authorId: userId
        },
        {
          content: 'Message 2',
          ticketId,
          authorId: userId
        }
      ]);
    });

    it('should get all messages for a ticket', async () => {
      const response = await request(app)
        .get(`/messages/tickets/${ticketId}/messages`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.length).toBe(2);
    });
  });

  describe('PUT /messages/:id', () => {
    let messageId;

    beforeEach(async () => {
      const message = await Message.create({
        content: 'Original message',
        ticketId,
        authorId: userId
      });
      messageId = message._id;
    });

    it('should update a message', async () => {
      const response = await request(app)
        .put(`/messages/${messageId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Updated message'
        });

      expect(response.status).toBe(200);
      expect(response.body.content).toBe('Updated message');
    });

    it('should not update message from another user', async () => {
      const otherUser = await User.create({
        email: 'other@example.com',
        password: 'password123'
      });
      const otherToken = generateAccessToken({ userId: otherUser._id, email: otherUser.email });

      const response = await request(app)
        .put(`/messages/${messageId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          content: 'Updated message'
        });

      expect(response.status).toBe(403);
    });
  });
});

