const express = require('express');
const router = express.Router();
const Joi = require('joi');
const ticketController = require('../controllers/ticketController');
const validate = require('../middleware/validation');
const { verifyToken, authorize } = require('../middleware/auth');

// Schémas de validation
const createTicketSchema = Joi.object({
  title: Joi.string().max(200).required(),
  description: Joi.string().required(),
  status: Joi.string().valid('open', 'in-progress', 'closed').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  assignedTo: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

const updateTicketSchema = Joi.object({
  title: Joi.string().max(200).optional(),
  description: Joi.string().optional(),
  status: Joi.string().valid('open', 'in-progress', 'closed').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  assignedTo: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Get all tickets with pagination
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in-progress, closed]
 *     responses:
 *       200:
 *         description: List of tickets
 */
router.get('/', verifyToken, ticketController.getAllTickets);

/**
 * @swagger
 * /tickets/search:
 *   get:
 *     summary: Search tickets with full-text search
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', verifyToken, ticketController.searchTicketsFullText);

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Get ticket by ID
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket details
 */
router.get('/:id', verifyToken, ticketController.getTicketById);

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Create a new ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [open, in-progress, closed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *     responses:
 *       201:
 *         description: Ticket created
 */
router.post('/', verifyToken, validate(createTicketSchema), ticketController.createTicket);

/**
 * @swagger
 * /tickets/{id}:
 *   put:
 *     summary: Update a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket updated
 */
router.put('/:id', verifyToken, validate(updateTicketSchema), ticketController.updateTicket);

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     summary: Delete a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket deleted
 */
router.delete('/:id', verifyToken, ticketController.deleteTicket);

module.exports = router;

