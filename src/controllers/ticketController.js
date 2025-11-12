const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const { searchTickets } = require('../utils/search');
const { paginateQuery, formatPaginationResponse } = require('../utils/pagination');

const getAllTickets = async (req, res) => {
  try {
    const { page = 1, limit = 10, q, status, priority, assignedTo, tags } = req.query;

    // Construire les filtres
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (assignedTo) filters.assignedTo = assignedTo;
    if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];

    // Recherche avec full-text ou filtres
    let query = searchTickets(q, filters);
    
    // Compter le total
    const total = await Ticket.countDocuments(query.getQuery());

    // Pagination
    const paginatedQuery = paginateQuery(query, page, limit);
    
    // Populate les relations
    const tickets = await paginatedQuery
      .populate('createdBy', 'email role')
      .populate('assignedTo', 'email role');

    res.json(formatPaginationResponse(tickets, total, page, limit));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'email role')
      .populate('assignedTo', 'email role');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTicket = async (req, res) => {
  try {
    const ticketData = {
      ...req.body,
      createdBy: req.user._id
    };

    const ticket = new Ticket(ticketData);
    await ticket.save();

    await ticket.populate('createdBy', 'email role');
    if (ticket.assignedTo) {
      await ticket.populate('assignedTo', 'email role');
    }

    // Émettre événement WebSocket
    req.io.emit('ticket:created', ticket);
    req.io.to(`ticket:${ticket._id}`).emit('ticket:created', ticket);

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Vérifier les permissions (owner ou admin)
    if (ticket.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Mettre à jour
    Object.assign(ticket, req.body);
    await ticket.save();

    await ticket.populate('createdBy', 'email role');
    if (ticket.assignedTo) {
      await ticket.populate('assignedTo', 'email role');
    }

    // Émettre événement WebSocket
    req.io.emit('ticket:updated', ticket);
    req.io.to(`ticket:${ticket._id}`).emit('ticket:updated', ticket);

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Vérifier les permissions (owner ou admin)
    if (ticket.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Supprimer les messages associés
    await Message.deleteMany({ ticketId: ticket._id });

    await ticket.deleteOne();

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchTicketsFullText = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const query = searchTickets(q);
    const total = await Ticket.countDocuments(query.getQuery());
    const paginatedQuery = paginateQuery(query, page, limit);

    const tickets = await paginatedQuery
      .populate('createdBy', 'email role')
      .populate('assignedTo', 'email role');

    res.json(formatPaginationResponse(tickets, total, page, limit));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  searchTicketsFullText
};

