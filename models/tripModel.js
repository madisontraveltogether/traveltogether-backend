const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Expense Subdocument Schema
const ExpenseSchema = new Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  payer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  splitType: { type: String, enum: ['even', 'byAmount', 'byPercentage', 'byShares'], required: true },
  splitWith: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      amount: Number,
      percentage: Number,
      shares: Number,
      status: { type: String, enum: ['pending', 'paid'], default: 'pending' }
    }
  ],
  createdAt: { type: Date, default: Date.now }
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

// Poll Subdocument Schema
const PollSchema = new Schema({
  question: { type: String, required: true },
  options: [
    {
      option: String,
      votes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    }
  ],
  expirationDate: Date, // Poll expiration date
  maxVotesPerUser: { type: Number, default: 1 } // Max votes per user
});

// Main Trip Schema
const TripSchema = new Schema({
  tripId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  location: String,
  description: String,
  organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
