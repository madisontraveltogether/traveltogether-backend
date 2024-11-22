// tripController.js
const mongoose = require('mongoose');
const Trip = require('../models/tripModel');
const User = require('../models/userModel');
const multer = require('multer');
const path = require('path');
const Invitation = require('../models/invitationModel');
const { sendInvitationEmail } = require('../utils/emailUtils'); // Assuming emailUtils has the sendInvitationEmail function
const sendMail = require('../services/mailService');
const { generateInvitationLink } = require('../utils/invitationUtils'); 
const PDFDocument = require('pdfkit');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/trip_covers');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Images Only!'));
    }
  },
});

// Export the upload middleware
module.exports.upload = upload;

// Create a new trip
exports.createTrip = async (req, res) => {
  const { name, location, description, startDate, endDate, privacy, guests, collaborators } = req.body;
  const organizer = req.user.userId; // The user ID from the token

  if (!name) {
    return res.status(400).json({ message: "Trip name is required" });
  }
  
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
    if (req.body.startDate) trip.startDate = req.body.startDate;
if (req.body.endDate) trip.endDate = req.body.endDate;
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

exports.getNotifications = async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    // Retrieve notifications
    const notifications = trip.notifications || []; // Assume a `notifications` field in the trip model
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications.', error: error.message });
  }
};
exports.getActivityLogs = async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    // Return activity logs
    const logs = trip.activityLogs || [];
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch activity logs.', error: error.message });
  }
};

exports.addSuggestion = async (req, res) => {
  const { tripId } = req.params;
  const { text } = req.body;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    // Add suggestion
    trip.suggestions.push({ text, user: req.user.userId });
    await trip.save();

    res.status(200).json({ message: 'Suggestion added successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add suggestion.', error: error.message });
  }
};

exports.resendInvite = async (req, res) => {
  const { tripId } = req.params;
  const { email } = req.body;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    // Check if the email is in pendingInvites
    if (!trip.pendingInvites.includes(email)) {
      return res.status(404).json({ message: 'Email not found in pending invites.' });
    }

    // Send invitation email
    const invitationLink = `https://traveltogether.com/trips/${tripId}/join`;
    await sendMail(email, `You're invited to ${trip.name}`, `Join here: ${invitationLink}`);

    res.status(200).json({ message: 'Invitation resent successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resend invitation.', error: error.message });
  }
};



exports.getAllUserTrips = async (req, res) => {
  const userId = req.user.userId; // Assuming `userId` is available in `req.user`

  try {
    // Find trips where the user is an organizer, guest, or collaborator
    const trips = await Trip.find({
      $or: [
        { organizer: userId },              // User is the organizer
        { 'guests.userId': userId },        // User is in guests (nested field)
        { collaborators: userId },         // User is a collaborator
      ],
    });

    res.status(200).json(trips);
  } catch (error) {
    console.error('Error fetching user trips:', error);
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
  console.log('Request body:', req.body);
  console.log('Request params:', req.params);

  try {
    const { tripId } = req.params; // Extract the trip ID from the URL
    const { email } = req.body; // Extract the email from the request body
    const organizerId = req.user.id; // Get the organizer's user ID from the authMiddleware (assumed)

    // Validate the input
    if (!email) {
      return res.status(400).json({ error: 'Email is required to send an invitation.' });
    }

    // Check if an invitation already exists for this trip and email
    const existingInvitation = await Invitation.findOne({ trip: tripId, email });
    if (existingInvitation) {
      return res.status(400).json({ error: 'This email has already been invited to the trip.' });
    }

    // Create a new invitation
    const invitation = new Invitation({
      trip: tripId,
      email,
      status: 'Pending',
    });

    await invitation.save();

    // Generate an invitation link (customize as needed)
    const invitationLink = `https://yourapp.com/trips/${tripId}/join?email=${encodeURIComponent(email)}`;

    // Send the invitation email
    await sendInvitationEmail(email, 'Trip Name', 'Organizer Name', invitationLink); // Replace "Trip Name" and "Organizer Name" dynamically if available

    res.status(201).json({ message: 'Invitation sent successfully.' });
  } catch (error) {
    console.error('Error inviting user to trip:', error.message);
    res.status(500).json({ error: 'Failed to send invitation.' });
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

exports.exportTrip = async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId).populate('guests.user', 'name email');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${trip.name}.pdf`);

    doc.text(`Trip Name: ${trip.name}`);
    doc.text(`Location: ${trip.location}`);
    doc.text(`Dates: ${trip.startDate} to ${trip.endDate}`);
    doc.text(`Guests:`);
    trip.guests.forEach((guest) => {
      doc.text(`- ${guest.user.name} (${guest.rsvpStatus})`);
    });

    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to export trip.', error: error.message });
  }
};

exports.addNotification = async (tripId, message) => {
  try {
    await Trip.findByIdAndUpdate(tripId, {
      $push: { notifications: { message, date: new Date() } },
    });
  } catch (error) {
    console.error('Failed to add notification:', error.message);
  }
};

// Filter Guests
exports.getFilteredGuests = async (req, res) => {
  const { tripId } = req.params;
  const { rsvpStatus } = req.query;

  try {
    const trip = await Trip.findById(tripId).populate('guests.user', 'name email');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    let filteredGuests = trip.guests;
    if (rsvpStatus) {
      filteredGuests = filteredGuests.filter(
        (guest) => guest.rsvpStatus.toLowerCase() === rsvpStatus.toLowerCase()
      );
    }

    res.status(200).json(filteredGuests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch filtered guests.', error: error.message });
  }
};

// Activity Logs
exports.logActivity = async (tripId, userId, activity) => {
  try {
    await Trip.findByIdAndUpdate(tripId, {
      $push: { activityLogs: { activity, user: userId, date: new Date() } },
    });
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
};

exports.notifyAllAttendees = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    // Notify logic here (e.g., send emails)
    res.status(200).json({ message: 'Notifications sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send notifications.', error: error.message });
  }
};

exports.pinAnnouncement = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { announcementId } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const announcement = trip.announcements.find((a) => a.id === announcementId);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found.' });

    // Pin the announcement
    trip.announcements.forEach((a) => (a.isPinned = false)); // Unpin others
    announcement.isPinned = true;

    await trip.save();
    res.status(200).json({ message: 'Announcement pinned successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to pin announcement.', error: error.message });
  }
};

exports.addAnnouncementComment = async (req, res) => {
  const { tripId, announcementId } = req.params;
  const { text } = req.body;
  const userId = req.user.userId;

  if (!text) {
    return res.status(400).json({ message: 'Comment text is required.' });
  }

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    const announcement = trip.announcements.id(announcementId);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found.' });
    }

    // Add the comment to the announcement
    const newComment = {
      text,
      user: userId,
      date: new Date(),
    };

    announcement.comments.push(newComment);
    await trip.save();

    res.status(201).json({ message: 'Comment added successfully.', comments: announcement.comments });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Failed to add comment.', error: error.message });
  }
};
