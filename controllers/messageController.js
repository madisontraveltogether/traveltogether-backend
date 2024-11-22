const Message = require('../models/messageModel');
const Trip = require('../models/tripModel');

exports.sendMessage = async (req, res) => {
  const { tripId } = req.params;
  const { content } = req.body;
  const userId = req.user.userId;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip || !(trip.organizer.equals(userId) || trip.guests.some(g => g.user.equals(userId)) || trip.collaborators.includes(userId))) {
      return res.status(403).json({ message: 'You are not part of this trip.' });
    }

    const message = new Message({ tripId, userId, content });
    await message.save();

    // Emit the message to all users in the trip room
    const io = req.app.locals.io;
    io.to(tripId).emit('receiveMessage', {
      _id: message._id,
      userId: { _id: userId, name: req.user.name },
      content,
      timestamp: message.timestamp,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

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

    const io = req.app.locals.io;
    io.to(message.tripId).emit('reactionUpdate', { messageId, reactions: message.reactions });

    res.status(200).json({ message: 'Reaction added', reactions: message.reactions });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLatestMessages = async (req, res) => {
  const { tripId } = req.params;
  const limit = parseInt(req.query.limit, 10) || 10;

  try {
    const messages = await Message.find({ tripId })
      .populate('userId', 'name')
      .sort({ timestamp: -1 })
      .limit(limit);

    res.status(200).json(messages.reverse());
  } catch (error) {
    console.error('Error fetching latest messages:', error);
    res.status(500).json({ message: 'Failed to fetch latest messages.', error: error.message });
  }
};
