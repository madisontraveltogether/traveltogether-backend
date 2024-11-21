const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Expense Subdocument Schema
const ExpenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    splitType: { 
      type: String, 
      enum: ['even', 'byAmount', 'byPercentage', 'byShares', 'self'], // Added 'self' as a valid option
      default: 'self', // Defaults to 'self' if not provided
    },
    splitWith: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: { type: Number },
      },
    ],
    date: { type: Date, default: Date.now },
    description: { type: String, default: '' }, // Default to an empty string if not provided
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

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
});

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  comments: [CommentSchema], // Array of comments
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
  location: { type: String, default: null }, // Optional field
  description: { type: String, default: '' }, // Optional field
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  guests: [GuestSchema], // Optional by default due to array nature
  collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Optional field
  startDate: { type: Date, default: null }, // Optional field
  endDate: { type: Date, default: null }, // Optional field
  privacy: { type: String, enum: ['public', 'private'], default: 'private' },
  tripType: { type: String, enum: ['vacation', 'business', 'family', 'adventure'], default: 'vacation' },
  coverImage: { type: String, default: null }, // Optional field
  announcements: [AnnouncementSchema], // Optional by default
  createdAt: { type: Date, default: Date.now },
  expenses: [ExpenseSchema], // Optional by default
  itinerary: [ItineraryItemSchema], // Optional by default
  tasks: [TaskSchema], // Optional by default
  polls: [PollSchema], // Optional by default
  settings: {
    isPrivate: { type: Boolean, default: false },
    notificationsEnabled: { type: Boolean, default: true },
    customTheme: { type: String, default: 'default' },
    maxGuests: { type: Number, default: 50 },
  },
  tripDates: [String],
  notifications: [
    {
      message: String,
      date: { type: Date, default: Date.now },
    },
  ],
  activityLogs: [
    {
      activity: String,
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      date: { type: Date, default: Date.now },
    },
  ],
  suggestions: [
    {
      text: String,
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      date: { type: Date, default: Date.now },
    },
  ],
});

TripSchema.pre('save', function (next) {
  if (this.startDate && this.endDate) {
    this.tripDates = generateTripDates(this.startDate, this.endDate);
  }
  next();
});

const generateTripDates = (startDate, endDate) => {
  const dates = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  let day = 1;
  while (currentDate <= end) {
    dates.push(`Day ${day} - ${currentDate.toLocaleDateString()}`);
    currentDate.setDate(currentDate.getDate() + 1);
    day++;
  }
  return dates;
};

module.exports = mongoose.model('Trip', TripSchema);
