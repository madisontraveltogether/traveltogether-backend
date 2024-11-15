// controllers/messageController.js
const Message = require('../models/messageModel');
const Trip = require('../models/tripModel');
const io = require('../server').io; // Assuming io is exported from server setup

exports.sendMessage = async (req, res) => {
  const { tripId } = req.params;
  const { content } = req.body;
  const userId = req.user.userId;

  try {
    // Ensure the user is part of the trip (as an organizer, guest, or collaborator)
    const trip = await Trip.findById(tripId);
    if (!trip || !(trip.organizer.equals(userId) || trip.guests.includes(userId) || trip.collaborators.includes(userId))) {
      return res.status(403).json({ message: 'You are not part of this trip' });
    }

    // Create a new message
    const message = new Message({
      tripId,
      userId,
      content,
    });

    await message.save();

    // Emit the message to all users in the trip room
    io.to(tripId).emit('receiveMessage', {
      tripId,
      userId,
      content,
      timestamp: message.timestamp,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all messages for a trip
exports.getMessages = async (req, res) => {
  const { tripId } = req.params;

  try {
    const messages = await Message.find({ tripId }).populate('userId', 'name').sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Assuming you added io to app locals
const io = require('../server').io;

