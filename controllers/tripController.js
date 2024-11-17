// tripController.js
const mongoose = require('mongoose');
const Trip = require('../models/tripModel');
const User = require('../models/userModel');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/trip_covers'); // Define where to store images
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  },
});

// Create a new trip
exports.createTrip = async (req, res) => {
  const { name, location, description, startDate, endDate, privacy, guests, collaborators } = req.body;
  const organizer = req.user.userId; // The user ID from the token

  try {
    // Create a new trip with optional fields
    const trip = new Trip({
      name,
      location: location || null, // Default to null if not provided
      description: description || '', // Default to an empty string if not provided
      startDate: startDate || null, // Default to null if not provided
      endDate: endDate || null, // Default to null if not provided
      privacy: privacy || 'private', // Default to 'private' if not provided
      organizer,
      coverImage: req.file ? `/uploads/trip_covers/${req.file.filename}` : null, // Save image path if uploaded
    });

    // Add guests and collaborators if provided
    if (guests && Array.isArray(guests)) {
      trip.guests = guests;
    }
    if (collaborators && Array.isArray(collaborators)) {
      trip.collaborators = collaborators;
    }

    await trip.save();

    // Update the user's joinedTrips array with the new trip ID
    await User.findByIdAndUpdate(
      organizer,
      { $push: { joinedTrips: trip._id } },
      { new: true }
    );

    res.status(201).json(trip);
  } catch (error) {
    console.error('Error creating trip:', error);
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

exports.getAllUserTrips = async (req, res) => {
  const userId = req.user.userId; // Assuming user ID is stored in `req.user`

  try {
    // Find trips where the user is the organizer or a guest
    const trips = await Trip.find({
      $or: [
        { organizer: userId },          // Trips created by the user
        { guests: userId },             // Trips where the user is a guest
        { collaborators: userId }       // Trips where the user is a collaborator, if applicable
      ]
    });

    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Helper function to validate Object IDs
const validateObjectId = (id) => mongoose.isValidObjectId(id);

// **Add Guest**
exports.addGuest = async (req, res) => {
  const { tripId } = req.params;
  const { guestId, rsvpStatus = 'pending', role = 'guest', notes = '' } = req.body;

  if (!validateObjectId(tripId) || !validateObjectId(guestId)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const user = await User.findById(guestId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check for duplicate guest
    if (trip.guests.some((guest) => guest.user.equals(guestId))) {
      return res.status(400).json({ message: 'Guest already added' });
    }

    trip.guests.push({ user: guestId, rsvpStatus, role, notes });
    await trip.save();

    await trip.populate('guests.user', 'name email').execPopulate();

    res.status(200).json({ message: 'Guest added successfully', guests: trip.guests });
  } catch (error) {
    console.error('Error adding guest:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// **Remove Guest**
exports.removeGuest = async (req, res) => {
  const { tripId } = req.params;
  const { guestId } = req.body;

  if (!validateObjectId(tripId) || !validateObjectId(guestId)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const initialGuestCount = trip.guests.length;
    trip.guests = trip.guests.filter((guest) => !guest.user.equals(guestId));

    if (initialGuestCount === trip.guests.length) {
      return res.status(404).json({ message: 'Guest not found in the trip' });
    }

    await trip.save();
    res.status(200).json({ message: 'Guest removed successfully', guests: trip.guests });
  } catch (error) {
    console.error('Error removing guest:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// **Get Guest List**
exports.getGuestList = async (req, res) => {
  const { tripId } = req.params;

  if (!validateObjectId(tripId)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const trip = await Trip.findById(tripId).populate('guests.user', 'name email');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    res.status(200).json(trip.guests);
  } catch (error) {
    console.error('Error fetching guest list:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// **Invite User to Trip**
exports.inviteUserToTrip = async (req, res) => {
  const { tripId, userId } = req.params;

  if (!validateObjectId(tripId) || !validateObjectId(userId)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const trip = await Trip.findById(tripId);
    const user = await User.findById(userId);

    if (!trip || !user) return res.status(404).json({ message: 'Trip or user not found' });

    // Add user to the guest list if not already present
    if (!trip.guests.some((guest) => guest.user.equals(userId))) {
      trip.guests.push({ user: userId, rsvpStatus: 'pending', role: 'guest' });
    }

    // Add trip to user's invited trips if not already present
    if (!user.invitedTrips.includes(tripId)) {
      user.invitedTrips.push(tripId);
    }

    await Promise.all([trip.save(), user.save()]);

    res.status(200).json({ message: 'User invited successfully', trip, user });
  } catch (error) {
    console.error('Error inviting user to trip:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// **Get Invited Trips for a User**
exports.getInvitedTrips = async (req, res) => {
  const userId = req.user.userId; // Assuming authenticated user

  try {
    const user = await User.findById(userId).populate('invitedTrips', 'title description');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user.invitedTrips);
  } catch (error) {
    console.error('Error fetching invited trips:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// **Add Collaborator**
exports.addCollaborator = async (req, res) => {
  const { tripId } = req.params;
  const { userId } = req.body;

  if (!validateObjectId(tripId) || !validateObjectId(userId)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (trip.collaborators.includes(userId)) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    trip.collaborators.push(userId);
    await trip.save();

    res.status(200).json({ message: 'Collaborator added successfully', trip });
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

