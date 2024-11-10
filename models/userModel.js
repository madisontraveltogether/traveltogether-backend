const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store hashed password
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // Role for permission levels
  refreshToken: { type: String }, // Store refresh token for authentication
  joinedTrips: [{ type: Schema.Types.ObjectId, ref: 'Trip' }], // Trips the user is part of
  invitedTrips: [{ type: Schema.Types.ObjectId, ref: 'Trip' }], // Trips user is invited to
  preferences: {
    receiveNotifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
