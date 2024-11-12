const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Expense Subdocument Schema
const ExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  splitType: { type: String, enum: ['even', 'byAmount', 'byPercentage', 'byShares'], default: null }, // Optional
  splitWith: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      amount: { type: Number }
    }
  ],
  date: Date,
  time: String,
  description: String,
});

// Itinerary Item Subdocument Schema
const ItineraryItemSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  location: String,
  startTime: Date,
  endTime: Date,
  suggestions: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      date: Date,
      time: String,
      votes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      votingCutoff: Date,
    }
  ]
});

// Task Subdocument Schema
const TaskSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  dueDate: Date,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  isRecurring: { type: Boolean, default: false }
});

const PollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }] // Array of ObjectIds
});

const PollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [PollOptionSchema],
  expirationDate: Date,
  maxVotesPerUser: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});


// Main Trip Schema
const TripSchema = new Schema({

  name: { type: String, required: true },
  location: String,
  description: String,
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  guests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Users with edit permissions
  startDate: Date,
  endDate: Date,
  privacy: { type: String, enum: ['public', 'private'], default: 'private' },
  tripType: { type: String, enum: ['vacation', 'business', 'family', 'adventure'], default: 'vacation' },
  coverImage: String,
  createdAt: { type: Date, default: Date.now },
  expenses: [ExpenseSchema],   // Embedded expenses
  itinerary: [ItineraryItemSchema],  // Embedded itinerary items
  tasks: [TaskSchema],         // Embedded tasks
  polls: [PollSchema],         // Embedded polls
});

module.exports = mongoose.model('Trip', TripSchema);
