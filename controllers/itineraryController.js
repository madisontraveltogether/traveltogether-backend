// controllers/itineraryController.js

const itineraryService = require('../services/itineraryService');

// Create a new itinerary item
exports.createItineraryItem = async (req, res) => {
  const { tripId } = req.params;
  const itemData = req.body;

  try {
    const itineraryItem = await itineraryService.createItineraryItem(tripId, itemData);
    res.status(201).json(itineraryItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a suggestion to an itinerary item
exports.addSuggestion = async (req, res) => {
  const { tripId, itemId } = req.params;
  const suggestionData = { ...req.body, user: req.user.userId };

  try {
    const suggestion = await itineraryService.addSuggestion(tripId, itemId, suggestionData);
    res.status(201).json(suggestion);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Vote on a suggestion
exports.voteOnSuggestion = async (req, res) => {
  const { tripId, itemId, suggestionId } = req.params;
  const userId = req.user.userId;

  try {
    const suggestion = await itineraryService.voteOnSuggestion(tripId, itemId, suggestionId, userId);
    res.status(200).json(suggestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all itinerary items for a trip
exports.getItinerary = async (req, res) => {
  const { tripId } = req.params;

  try {
    const itinerary = await itineraryService.getItinerary(tripId);
    res.status(200).json(itinerary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete an itinerary item
exports.deleteItineraryItem = async (req, res) => {
  const { tripId, itemId } = req.params;

  try {
    await itineraryService.deleteItineraryItem(tripId, itemId);
    res.status(200).json({ message: 'Itinerary item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
