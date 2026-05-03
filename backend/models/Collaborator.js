const mongoose = require('mongoose');

const collaboratorSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['viewer', 'editor'],
    default: 'viewer'
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  inviteToken: { type: String },
  inviteEmail: { type: String }
}, { timestamps: true });

collaboratorSchema.index({ trip: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Collaborator', collaboratorSchema);
