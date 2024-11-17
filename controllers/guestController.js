const Trip = require('../models/tripModel');

// Add a guest to the trip
exports.addGuest = async (req, res) => {
  const { tripId } = req.params;
  const { rsvpStatus = 'pending', notes = '' } = req.body;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Get the current user's ID from the authentication middleware
    const userId = req.user.userId;

    // Check if the user is already a guest
    if (trip.guests.some((guest) => guest.user.toString() === userId)) {
      return res.status(400).json({ message: 'User is already a guest' });
    }

    // Add the current user as a guest
    trip.guests.push({ user: userId, rsvpStatus, notes });

    await trip.save();

    res.status(201).json(trip.guests);
  } catch (error) {
    console.error('Error adding guest:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Update guest RSVP status
exports.updateRSVP = async (req, res) => {
  const { tripId, guestEmail } = req.params;
  const { rsvpStatus } = req.body;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error('Trip not found');

    const guest = trip.guests.find((guest) => guest.email === guestEmail);
    if (!guest) throw new Error('Guest not found');

    guest.rsvpStatus = rsvpStatus;
    await trip.save();

    res.status(200).json(trip.guests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all guests for a trip
exports.getGuests = async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error('Trip not found');

    res.status(200).json(trip.guests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a guest
exports.removeGuest = async (req, res) => {
  const { tripId, guestEmail } = req.params;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error('Trip not found');

    trip.guests = trip.guests.filter((guest) => guest.email !== guestEmail);
    await trip.save();

    res.status(200).json(trip.guests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRSVPCounters = async (req, res) => {
    const { tripId } = req.params;
  
    try {
      const trip = await Trip.findById(tripId);
      if (!trip) throw new Error('Trip not found');
  
      const counters = trip.guests.reduce(
        (acc, guest) => {
          acc[guest.rsvpStatus] = (acc[guest.rsvpStatus] || 0) + 1;
          return acc;
        },
        { going: 0, maybe: 0, notGoing: 0, pending: 0 }
      );
  
      res.status(200).json(counters);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };