const Message = require('../models/Message');
const Ticket = require('../models/Ticket');
const { paginateQuery, formatPaginationResponse } = require('../utils/pagination');

const getMessagesByTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Vérifier que le ticket existe
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Récupérer les messages avec pagination
    const query = Message.find({ ticketId }).sort({ createdAt: -1 });
    const total = await Message.countDocuments({ ticketId });
    const paginatedQuery = paginateQuery(query, page, limit);

    const messages = await paginatedQuery
      .populate('authorId', 'email role')
      .populate('ticketId', 'title status');

    res.json(formatPaginationResponse(messages, total, page, limit));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createMessage = async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Vérifier que le ticket existe
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Créer le message
    const messageData = {
      ...req.body,
      ticketId,
      authorId: req.user._id
    };

    const message = new Message(messageData);
    await message.save();

    await message.populate('authorId', 'email role');
    await message.populate('ticketId', 'title status');

    // Émettre événement WebSocket
    req.io.emit('message:created', message);
    req.io.to(`ticket:${ticketId}`).emit('message:created', message);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Vérifier que l'utilisateur est l'auteur
    if (message.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only edit your own messages' });
    }

    // Mettre à jour
    Object.assign(message, req.body);
    await message.save();

    await message.populate('authorId', 'email role');
    await message.populate('ticketId', 'title status');

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Vérifier que l'utilisateur est l'auteur
    if (message.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only delete your own messages' });
    }

    await message.deleteOne();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMessagesByTicket,
  createMessage,
  updateMessage,
  deleteMessage
};

