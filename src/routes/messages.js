const express = require('express');
const router = express.Router();
const Joi = require('joi');
const messageController = require('../controllers/messageController');
const validate = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');

// Schémas de validation
const createMessageSchema = Joi.object({
  content: Joi.string().trim().min(1).required()
});

const updateMessageSchema = Joi.object({
  content: Joi.string().trim().min(1).required()
});

// Routes
router.get('/tickets/:ticketId/messages', verifyToken, messageController.getMessagesByTicket);
router.post('/tickets/:ticketId/messages', verifyToken, validate(createMessageSchema), messageController.createMessage);
router.put('/:id', verifyToken, validate(updateMessageSchema), messageController.updateMessage);
router.delete('/:id', verifyToken, messageController.deleteMessage);

module.exports = router;

