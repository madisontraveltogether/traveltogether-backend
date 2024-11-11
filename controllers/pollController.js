// controllers/pollController.js
const pollService = require('../services/pollService');

// Create a new poll
exports.createPoll = async (req, res) => {
  const { tripId } = req.params;
  const { question, options, expirationDate, maxVotesPerUser } = req.body;

  try {
    const poll = await pollService.createPoll(tripId, { question, options, expirationDate, maxVotesPerUser });
    res.status(201).json(poll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all polls for a specific trip
exports.getPolls = async (req, res) => {
  const { tripId } = req.params;

  try {
    const polls = await pollService.getPolls(tripId);
    res.status(200).json(polls);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get details of a specific poll by ID
exports.getPollDetails = async (req, res) => {
  const { tripId, pollId } = req.params;

  try {
    const poll = await pollService.getPollDetails(tripId, pollId);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    res.status(200).json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a specific poll by ID
exports.updatePoll = async (req, res) => {
  const { tripId, pollId } = req.params;
  const updateData = req.body;

  try {
    const updatedPoll = await pollService.updatePoll(tripId, pollId, updateData);
    if (!updatedPoll) return res.status(404).json({ message: 'Poll not found' });
    res.status(200).json(updatedPoll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a specific poll by ID
exports.deletePoll = async (req, res) => {
  const { tripId, pollId } = req.params;

  try {
    const deletedPoll = await pollService.deletePoll(tripId, pollId);
    if (!deletedPoll) return res.status(404).json({ message: 'Poll not found' });
    res.status(200).json({ message: 'Poll deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vote on a poll option
exports.voteOnPoll = async (req, res) => {
  const { tripId, pollId, optionId } = req.params;
  const userId = req.user.userId; // Assuming user ID is available from authentication

  try {
    const poll = await pollService.voteOnPoll(tripId, pollId, optionId, userId);
    res.status(200).json(poll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get poll results by ID
exports.getPollResults = async (req, res) => {
  const { tripId, pollId } = req.params;

  try {
    const results = await pollService.getPollResults(tripId, pollId);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
