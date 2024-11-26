const itineraryService = require('../services/itineraryService');

// Create a new itinerary item
exports.createItineraryItem = async (req, res) => {
  const { tripId } = req.params;
  const itemData = req.body;

  try {
    const itineraryItem = await itineraryService.createItineraryItem(tripId, itemData);
    res.status(201).json(itineraryItem);
  } catch (error) {
    console.error('Error creating itinerary item:', error);
    res.status(500).json({ message: 'Failed to create itinerary item', error: error.message });
  }
};

// Get all itinerary items for a trip
exports.getItinerary = async (req, res) => {
  const { tripId } = req.params;

  try {
    const itinerary = await itineraryService.getItinerary(tripId);
    res.status(200).json(itinerary);
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    res.status(500).json({ message: 'Failed to fetch itinerary', error: error.message });
  }
};

// Delete an itinerary item
exports.deleteItineraryItem = async (req, res) => {
  const { tripId, itemId } = req.params;

  try {
    await itineraryService.deleteItineraryItem(tripId, itemId);
    res.status(200).json({ message: 'Itinerary item deleted successfully' });
  } catch (error) {
    console.error('Error deleting itinerary item:', error);
    res.status(500).json({ message: 'Failed to delete itinerary item', error: error.message });
  }
};

exports.updateItineraryItem = async (req, res) => {
  const { tripId, itemId } = req.params;
  const updates = req.body;

  try {
    const updatedItem = await itineraryService.updateItineraryItem(tripId, itemId, updates);
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error updating itinerary item:', error);
    res.status(500).json({ message: 'Failed to update itinerary item', error: error.message });
  }
};

exports.getItineraryItem = async (req, res) => {
  const { tripId, itemId } = req.params;

  try {
    const item = await itineraryService.getItineraryItem(tripId, itemId);
    res.status(200).json(item);
  } catch (error) {
    console.error('Error retrieving itinerary item:', error);
    res.status(500).json({ message: 'Failed to retrieve itinerary item', error: error.message });
  }
};