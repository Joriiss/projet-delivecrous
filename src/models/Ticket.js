const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Index text pour recherche full-text
ticketSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Index pour améliorer les performances
ticketSchema.index({ status: 1, createdAt: -1 });
ticketSchema.index({ createdBy: 1 });
ticketSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);

