const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ }, // Validate email format
  password: { type: String, required: true }, 
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  refreshToken: { type: String },
  joinedTrips: [{ type: Schema.Types.ObjectId, ref: 'Trip' }],
  invitedTrips: [{ type: Schema.Types.ObjectId, ref: 'Trip' }],
  profilePicture: String,
  preferences: {
    receiveNotifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    tripNotifications: { type: Boolean, default: true },
    expenseNotifications: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  deletedAt: { type: Date }, // For soft deletion
});

module.exports = mongoose.model('User', UserSchema);

