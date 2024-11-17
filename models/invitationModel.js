const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InvitationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Invitation', InvitationSchema);
