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

exports.getItineraryByTags = async (req, res) => {
  const { tripId } = req.params;
  const { tags } = req.query; // Expect tags to be comma-separated, e.g., `?tags=tag1,tag2`

  try {
    const itinerary = await Itinerary.find({
      tripId,
      tags: { $in: tags.split(',') },
    });

    res.status(200).json(itinerary);
  } catch (err) {
    console.error('Error filtering itinerary by tags:', err);
    res.status(500).json({ error: 'Failed to filter itinerary by tags.' });
  }
};

const { createEvents } = require('ics');

exports.exportToCalendar = async (req, res) => {
  const { tripId } = req.params;

  try {
    const itinerary = await Itinerary.find({ tripId });

    const events = itinerary.map((item) => ({
      title: item.title,
      description: item.description,
      location: item.location,
      start: [new Date(item.startTime).getFullYear(), new Date(item.startTime).getMonth() + 1, new Date(item.startTime).getDate()],
      end: [new Date(item.endTime).getFullYear(), new Date(item.endTime).getMonth() + 1, new Date(item.endTime).getDate()],
    }));

    const { error, value } = createEvents(events);

    if (error) {
      console.error('Error creating calendar:', error);
      return res.status(500).json({ error: 'Failed to generate calendar file.' });
    }

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename=itinerary.ics');
    res.status(200).send(value);
  } catch (err) {
    console.error('Error exporting itinerary to calendar:', err);
    res.status(500).json({ error: 'Failed to export itinerary to calendar.' });
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
  const { page = 1, limit = 10 } = req.query;

  try {
    const itinerary = await Itinerary.find({ tripId })
      .sort({ startTime: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalItems = await Itinerary.countDocuments({ tripId });

    res.status(200).json({
      items: itinerary,
      page: parseInt(page),
      totalPages: Math.ceil(totalItems / limit),
    });
  } catch (err) {
    console.error('Error fetching itinerary:', err);
    res.status(500).json({ error: 'Failed to fetch itinerary.' });
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

exports.batchDeleteItineraryItems = async (req, res) => {
  const { tripId } = req.params;
  const { itemIds } = req.body; // Array of itinerary item IDs to delete

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Filter out itinerary items that should not be deleted
    trip.itinerary = trip.itinerary.filter(item => !itemIds.includes(item._id.toString()));

    await trip.save();

    res.status(200).json({ message: "Itinerary items deleted successfully", remainingItems: trip.itinerary });
  } catch (error) {
    console.error("Error in batchDeleteItineraryItems:", error);
    res.status(500).json({ message: "Failed to delete itinerary items", error: error.message });
  }
};

exports.filterItinerary = async (req, res) => {
  const { tripId } = req.params;
  const { tags, day, startTimeRange } = req.query; // Filter criteria

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    let filteredItems = trip.itinerary;

    // Filter by tags
    if (tags) {
      const tagsArray = tags.split(",");
      filteredItems = filteredItems.filter(item =>
        item.tags.some(tag => tagsArray.includes(tag))
      );
    }

    // Filter by day
    if (day) {
      filteredItems = filteredItems.filter(item => item.day === day);
    }

    // Filter by start time range
    if (startTimeRange) {
      const [start, end] = startTimeRange.split(",");
      filteredItems = filteredItems.filter(item => {
        const itemStartTime = new Date(item.startTime);
        return (
          (!start || itemStartTime >= new Date(start)) &&
          (!end || itemStartTime <= new Date(end))
        );
      });
    }

    res.status(200).json(filteredItems);
  } catch (error) {
    console.error("Error filtering itinerary items:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};