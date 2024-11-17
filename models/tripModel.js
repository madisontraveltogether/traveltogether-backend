const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Expense Subdocument Schema
const ExpenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    splitType: { type: String, enum: ['even', 'byAmount', 'byPercentage', 'byShares'], required: true },
    splitWith: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: { type: Number },
      },
    ],
    date: { type: Date, default: Date.now },
    description: { type: String },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        edited: { type: Boolean, default: false },
        editedAt: { type: Date },
      },
    ],
  },
  { timestamps: true }
);


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

const AnnouncementSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Task Subdocument Schema
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dueDate: { type: Date, default: null },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  isRecurring: { type: Boolean, default: false },
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

const GuestSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
  rsvpStatus: { 
    type: String, 
    enum: ['pending', 'going', 'maybe', 'notGoing'], 
    default: 'going' // Organizer defaults to 'going'
  },
  notes: { type: String },
});



// Main Trip Schema
const TripSchema = new Schema({

  name: { type: String, required: true },
  location: String,
  description: String,
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  guests: [GuestSchema],  
  collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Users with edit permissions
  startDate: Date,
  endDate: Date,
  privacy: { type: String, enum: ['public', 'private'], default: 'private' },
  tripType: { type: String, enum: ['vacation', 'business', 'family', 'adventure'], default: 'vacation' },
  coverImage: String,
  announcements: [AnnouncementSchema],
  createdAt: { type: Date, default: Date.now },
  expenses: [ExpenseSchema],   // Embedded expenses
  itinerary: [ItineraryItemSchema],  // Embedded itinerary items
  tasks: [TaskSchema],         // Embedded tasks
  polls: [PollSchema],         // Embedded polls
  settings: {
    isPrivate: { type: Boolean, default: false },
    notificationsEnabled: { type: Boolean, default: true },
    customTheme: { type: String, default: 'default' },
    maxGuests: { type: Number, default: 50 }
  },
});

module.exports = mongoose.model('Trip', TripSchema);
