const Ticket = require('../models/Ticket');

const searchTickets = (searchQuery, filters = {}) => {
  const query = {};

  // Recherche full-text si query fournie
  if (searchQuery && searchQuery.trim()) {
    query.$text = { $search: searchQuery };
  }

  // Filtres additionnels
  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.priority) {
    query.priority = filters.priority;
  }

  if (filters.createdBy) {
    query.createdBy = filters.createdBy;
  }

  if (filters.assignedTo) {
    query.assignedTo = filters.assignedTo;
  }

  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }

  // Construction de la requête avec tri par pertinence si recherche textuelle
  let mongoQuery = Ticket.find(query);

  if (searchQuery && searchQuery.trim()) {
    mongoQuery = mongoQuery.sort({ score: { $meta: 'textScore' } });
  } else {
    mongoQuery = mongoQuery.sort({ createdAt: -1 });
  }

  return mongoQuery;
};

module.exports = {
  searchTickets
};

