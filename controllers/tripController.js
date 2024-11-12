// tripController.js
const mongoose = require('mongoose');
const Trip = require('../models/tripModel');
const User = require('../models/userModel');

// Create a new trip
exports.createTrip = async (req, res) => {
  const { name, location, description, startDate, endDate, privacy } = req.body;
  const organizer = req.user.userId; // The user ID from the token

  try {
    // Create a new trip
    const trip = new Trip({
      name,
      location,
      description,
      startDate,
      endDate,
      privacy,
      organizer,
    });

    await trip.save();

    // Update the user's joinedTrips array with the new trip ID
    await User.findByIdAndUpdate(
      organizer,
      { $push: { joinedTrips: tripId } },
      { new: true }
    );

    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTripById = async (req, res) => {
  const { tripId } = req.params;

  // Validate tripId format
  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    return res.status(400).json({ message: 'Invalid trip ID format' });
  }

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update trip details by ID
exports.updateTrip = async (req, res) => {
  const { tripId } = req.params;
  const updateData = req.body;

  // Validate the ID format
  if (!mongoose.isValidObjectId(tripId)) {
    return res.status(400).json({ message: 'Invalid trip ID format' });
  }

  try {
    const trip = await Trip.findByIdAndUpdate(tripId, updateData, { new: true });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a specific trip by ID
exports.deleteTrip = async (req, res) => {
  const { tripId } = req.params;

  // Validate the ID format
  if (!mongoose.isValidObjectId(tripId)) {
    return res.status(400).json({ message: 'Invalid trip ID format' });
  }

  try {
    const trip = await Trip.findByIdAndDelete(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(200).json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a guest to a trip
exports.addGuest = async (req, res) => {
  const { tripId } = req.params;
  const { guestId } = req.body;

  // Validate the ID format
  if (!mongoose.isValidObjectId(tripId) || !mongoose.isValidObjectId(guestId)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if the guest is already in the list
    if (trip.guests.includes(guestId)) {
      return res.status(400).json({ message: 'Guest already added' });
    }

    trip.guests.push(guestId);
    await trip.save();

    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove a guest from a trip
exports.removeGuest = async (req, res) => {
  const { tripId } = req.params;
  const { guestId } = req.body;

  // Validate the ID format
  if (!mongoose.isValidObjectId(tripId) || !mongoose.isValidObjectId(guestId)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Remove the guest from the list
    trip.guests = trip.guests.filter(id => id.toString() !== guestId.toString());
    await trip.save();

    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addCollaborator = async (req, res) => {
  const { tripId } = req.params;
  const { userId } = req.body; // Assuming the collaborator's ID is sent in the request body

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if the user is already a collaborator
    if (trip.collaborators.includes(userId)) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    // Add collaborator
    trip.collaborators.push(userId);
    await trip.save();

    res.status(200).json({ message: 'Collaborator added successfully', trip });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.inviteUserToTrip = async (req, res) => {
  const { tripId, userId } = req.params;

  try {
    // Find trip and user
    const trip = await Trip.findById(tripId);
    const user = await User.findById(userId);

    if (!trip || !user) {
      return res.status(404).json({ message: 'Trip or user not found' });
    }

    // Add the user to the trip's guest list
    trip.guests.push(userId);
    await trip.save();

    // Add the trip to the user's invited trips list
    user.invitedTrips.push(tripId);
    await user.save();

    res.status(200).json({ message: 'User invited successfully', trip, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getInvitedTrips = async (req, res) => {
  const userId = req.user.userId; // Assuming user is authenticated

  try {
    const user = await User.findById(userId).populate('invitedTrips');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ invitedTrips: user.invitedTrips });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
