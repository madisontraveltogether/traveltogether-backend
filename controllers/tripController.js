// tripService.js
const Trip = require('../models/tripModel');

exports.createTrip = async (tripData) => {
  const trip = new Trip(tripData);
  await trip.save();
  return trip;
};

exports.getTrip = async (tripId) => {
  return Trip.findById(tripId).populate('organizer collaborators guests');
};

exports.getTripSummary = async (tripId) => {
  return Trip.findById(tripId, 'name location startDate endDate organizer coverImage')
             .populate('organizer');
};

exports.updateTrip = async (tripId, updateData) => {
  return Trip.findByIdAndUpdate(tripId, updateData, { new: true });
};

exports.deleteTrip = async (tripId) => {
  const trip = await Trip.findById(tripId);
  if (trip) {
    await trip.remove();
    return true;
  }
  return false;
};

exports.addGuest = async (tripId, guestId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  if (!trip.guests.includes(guestId)) {
    trip.guests.push(guestId);
  }
  await trip.save();
  return trip;
};

exports.removeGuest = async (tripId, guestId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  trip.guests.pull(guestId);
  await trip.save();
  return trip;
};

exports.addCollaborator = async (tripId, collaboratorId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  if (!trip.collaborators.includes(collaboratorId)) {
    trip.collaborators.push(collaboratorId);
  }
  await trip.save();
  return trip;
};

exports.removeCollaborator = async (tripId, collaboratorId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  trip.collaborators.pull(collaboratorId);
  await trip.save();
  return trip;
};
