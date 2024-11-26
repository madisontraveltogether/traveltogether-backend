const Trip = require('../models/tripModel');

// Create a new trip
exports.createTrip = async (organizerId, tripData) => {
  const { name, location, startDate, endDate, privacy } = tripData;

  if (!name) {
    throw new Error('Trip name is required');
  }

  const trip = new Trip({
    name,
    location: location || null,
    startDate: startDate || null,
    endDate: endDate || null,
    privacy: privacy || 'private',
    organizer: organizerId,
  });

  await trip.save();
  return trip;
};

// Retrieve trip details by ID
exports.getTrip = async (tripId) => {
  const trip = await Trip.findById(tripId).populate('organizer guests.user', 'name email');
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
exports.addGuest = async (tripId, userId, rsvpStatus = 'pending') => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }

  if (trip.guests.some((guest) => guest.user.toString() === userId)) {
    throw new Error('Guest already added');
  }

  trip.guests.push({ user: userId, rsvpStatus });
  await trip.save();
  return trip.guests;
};

// Remove a guest from a trip
exports.removeGuest = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }

  const initialGuestCount = trip.guests.length;
  trip.guests = trip.guests.filter((guest) => guest.user.toString() !== userId);

  if (trip.guests.length === initialGuestCount) {
    throw new Error('Guest not found in the trip');
  }

  await trip.save();
  return trip.guests;
};

// Calculate trip progress (basic version for MVP)
exports.calculateTripProgress = async (tripId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  // Task progress
  const totalTasks = trip.tasks.length;
  const completedTasks = trip.tasks.filter((task) => task.status === 'completed').length;

  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return { progress, totalTasks, completedTasks };
};
