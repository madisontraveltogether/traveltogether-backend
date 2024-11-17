const Trip = require('../models/tripModel');

exports.ensureTripMember = async (req, res, next) => {
  const { tripId } = req.params;
  const userId = req.user.userId; // Assuming user info is attached by the auth middleware

  try {
    const trip = await Trip.findById(tripId).populate('guests.user', '_id'); // Populate guest details
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const isMember = trip.guests.some(guest => guest.user._id.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this trip.' });
    }

    // If the user is part of the trip, proceed
    next();
  } catch (error) {
    console.error('Error in ensureTripMember middleware:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
