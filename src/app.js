require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require('./config/database');
const { generalLimiter } = require('./middleware/rateLimiter');
const routes = require('./routes');

// Connexion à la base de données (sauf en mode test)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Créer l'application Express
const app = express();
const server = http.createServer(app);

// Configuration Socket.io
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware pour rendre io accessible dans les routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting général
app.use(generalLimiter);

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Service Client API - DeliveCROUS',
    version: '1.0.0',
    docs: '/api-docs'
  });
});

// Routes
app.use('/auth', routes.auth);
app.use('/tickets', routes.tickets);
app.use('/messages', routes.messages);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Configuration Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Rejoindre une room pour un ticket spécifique
  socket.on('join:ticket', (ticketId) => {
    socket.join(`ticket:${ticketId}`);
    console.log(`Client ${socket.id} joined ticket:${ticketId}`);
  });

  // Quitter une room
  socket.on('leave:ticket', (ticketId) => {
    socket.leave(`ticket:${ticketId}`);
    console.log(`Client ${socket.id} left ticket:${ticketId}`);
  });
});


const PORT = process.env.PORT || 3000;

// Ne pas démarrer le serveur en mode test
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  });
}

module.exports = { app, server, io };

