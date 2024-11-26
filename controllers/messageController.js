const messageService = require('../services/messageService');

exports.sendMessage = async (req, res) => {
  const { tripId } = req.params;
  const { content } = req.body;
  const userId = req.user.userId;

  try {
    const message = await messageService.sendMessage(tripId, userId, content);

    const io = req.app.locals.io;
    io.to(tripId).emit('receiveMessage', {
      _id: message._id,
      userId: { _id: userId, name: req.user.name },
      content,
      timestamp: message.timestamp,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  const { tripId } = req.params;

  try {
    const messages = await messageService.getMessages(tripId);
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.reactToMessage = async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;
  const userId = req.user.userId;

  try {
    const reactions = await messageService.reactToMessage(messageId, userId, emoji);

    const io = req.app.locals.io;
    io.to(req.body.tripId).emit('reactionUpdate', { messageId, reactions });

    res.status(200).json({ message: 'Reaction added', reactions });
  } catch (error) {
    console.error("Error reacting to message:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getLatestMessages = async (req, res) => {
  const { tripId } = req.params;
  const limit = parseInt(req.query.limit, 10) || 10;

  try {
    const messages = await messageService.getLatestMessages(tripId, limit);
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching latest messages:", error.message);
    res.status(500).json({ message: error.message });
  }
};
