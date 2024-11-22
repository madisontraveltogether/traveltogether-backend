const mongoose = require('mongoose');

const InvitationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Make user optional
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
  },
  email: {
    type: String,
    required: true, // Email is required since it's the primary identifier
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Declined'],
    default: 'Pending',
  },
});

module.exports = mongoose.model('Invitation', InvitationSchema);
