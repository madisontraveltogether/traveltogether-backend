const Trip = require('../models/tripModel');

exports.addGuest = async (tripId, email, notes = '') => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  // Check if guest already exists
  if (trip.guests.some((guest) => guest.email === email)) {
    throw new Error('Guest is already part of the trip');
  }

  // Add guest
  trip.guests.push({ email, notes, rsvpStatus: 'pending' });
  await trip.save();

  return trip.guests;
};

exports.getGuests = async (tripId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  return trip.guests;
};

exports.removeGuest = async (tripId, email) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const initialLength = trip.guests.length;
  trip.guests = trip.guests.filter((guest) => guest.email !== email);

  if (trip.guests.length === initialLength) {
    throw new Error('Guest not found');
  }

  await trip.save();
  return trip.guests;
};
