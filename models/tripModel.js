const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Guest Schema
const GuestSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rsvpStatus: {
    type: String,
    enum: ['pending', 'going', 'maybe', 'notGoing'],
    default: 'pending',
  },
});

// Task Schema
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dueDate: { type: Date, default: null },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
});

// Itinerary Item Schema
const ItineraryItemSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  location: { type: String, default: '' },
  startTime: { type: Date },
  endTime: { type: Date },
});

// Expense Schema
const ExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  splitWith: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      amount: { type: Number },
    },
  ],
  date: { type: Date, default: Date.now },
  description: { type: String, default: '' },
});

// Message Schema
const MessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  reactions: [
    {
      emoji: { type: String },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
  ],
});

// Main Trip Schema
const TripSchema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, default: null },
    description: { type: String, default: '' },
    startDate: { type: Date },
    endDate: { type: Date },
    privacy: { type: String, enum: ['public', 'private'], default: 'private' },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    guests: [GuestSchema],
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tasks: [TaskSchema],
    expenses: [ExpenseSchema],
    itinerary: [ItineraryItemSchema],
    messages: [MessageSchema], 
    inviteCode: { type: String, unique: true },
    pendingInvites: [
      {
        email: { type: String, required: true },
        status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
      },
    ],

  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', TripSchema);
