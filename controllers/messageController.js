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

    req.app.locals.io.to(tripId).emit('receiveMessage', {
      _id: message._id,
      userId: { _id: userId, name: req.user.name }, // Assuming req.user has `name`
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

exports.reactToMessage = async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;
  const userId = req.user.userId;

  try {
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    message.reactions.push({ emoji, userId });
    await message.save();

    io.to(message.tripId).emit('reactionUpdate', { messageId, reactions: message.reactions });
    res.status(200).json({ message: 'Reaction added', reactions: message.reactions });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLatestMessages = async (req, res) => {
  const { tripId } = req.params;
  const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 messages if limit not provided

  try {
    const trip = await Trip.findById(tripId).populate({
      path: 'messages.user', // Assuming messages are associated with users
      select: 'name email', // Fetch user name and email for each message
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    // Sort messages by date and limit the number of messages
    const latestMessages = trip.messages
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    res.status(200).json(latestMessages);
  } catch (error) {
    console.error('Error fetching latest messages:', error);
    res.status(500).json({ message: 'Failed to fetch latest messages.', error: error.message });
  }
};
