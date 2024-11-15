const Trip = require('../models/tripModel');
const User = require('../models/userModel');
const { v4: uuidv4 } = require('uuid'); 

// Create a new trip
exports.createTrip = async (req, res) => {
  const { name, location, description, startDate, endDate, privacy, tripType, coverImage, collaborators } = req.body;
  const organizer = req.user.userId; // Assume user ID is available from authentication middleware

  try {
    const trip = new Trip({
      name,
      location,
      description,
      startDate,
      endDate,
      privacy,
      tripType,
      coverImage,
      organizer,
      collaborators
    });
    await trip.save();

    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Retrieve full trip details by ID
exports.getTrip = async (tripId) => {
  const trip = await Trip.findById(tripId)
    .populate('organizer')
    .populate('guests')
    .populate('collaborators')
    .populate('tasks.assignedTo')
    .populate('expenses.splitWith.user')
    .populate('polls.options.votes');

  if (!trip) {
    throw new Error('Trip not found');
  }
  return trip;
};

// Retrieve a trip summary (e.g., for dashboard)
exports.getTripSummary = async (tripId) => {
  const trip = await Trip.findById(tripId, 'name location startDate endDate organizer coverImage')
    .populate('organizer');
  if (!trip) {
    throw new Error('Trip not found');
  }
  return trip;
};

// Update trip details
exports.updateTrip = async (tripId, updateData) => {
  const trip = await Trip.findByIdAndUpdate(tripId, updateData, { new: true });
  if (!trip) {
    throw new Error('Trip not found');
  }
  return trip;
};

// Delete a trip
exports.deleteTrip = async (tripId) => {
  const trip = await Trip.findByIdAndDelete(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }
};

// Add a guest to a trip
exports.addGuest = async (tripId, guestId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }

  // Check if guest is already in the list
  if (trip.guests.includes(guestId)) {
    throw new Error('Guest already added');
  }

  trip.guests.push(guestId);
  await trip.save();

  return trip;
};

// Remove a guest from a trip
exports.removeGuest = async (tripId, guestId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }

  trip.guests = trip.guests.filter(id => id.toString() !== guestId.toString());
  await trip.save();

  return trip;
};

// Add a collaborator to a trip
exports.addCollaborator = async (tripId, collaboratorId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }

  // Check if collaborator is already in the list
  if (trip.collaborators.includes(collaboratorId)) {
    throw new Error('Collaborator already added');
  }

  trip.collaborators.push(collaboratorId);
  await trip.save();

  return trip;
};

// Remove a collaborator from a trip
exports.removeCollaborator = async (tripId, collaboratorId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }

  trip.collaborators = trip.collaborators.filter(id => id.toString() !== collaboratorId.toString());
  await trip.save();

  return trip;
};
