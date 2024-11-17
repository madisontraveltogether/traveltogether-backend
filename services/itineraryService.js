// services/itineraryService.js

const Trip = require('../models/tripModel');

// Create a new itinerary item
exports.createItineraryItem = async (tripId, itemData) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const itineraryItem = {
    title: itemData.title,
    description: itemData.description,
    location: itemData.location,
    startTime: itemData.startTime,
    endTime: itemData.endTime,
    suggestions: itemData.suggestions || []
  };

  trip.itinerary.push(itineraryItem);
  await trip.save();

  return itineraryItem;
};

// Add a suggestion to an itinerary item
exports.addSuggestion = async (tripId, itemId, suggestionData) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const itineraryItem = trip.itinerary.id(itemId);
  if (!itineraryItem) throw new Error('Itinerary item not found');

  const suggestion = {
    user: suggestionData.user,
    date: suggestionData.date,
    time: suggestionData.time,
    votingCutoff: suggestionData.votingCutoff,
    votes: []
  };

  itineraryItem.suggestions.push(suggestion);
  await trip.save();

  return suggestion;
};

// Vote on a suggestion
exports.voteOnSuggestion = async (tripId, itemId, suggestionId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const itineraryItem = trip.itinerary.id(itemId);
  if (!itineraryItem) throw new Error('Itinerary item not found');

  const suggestion = itineraryItem.suggestions.id(suggestionId);
  if (!suggestion) throw new Error('Suggestion not found');

  if (suggestion.votes.includes(userId)) {
    throw new Error('User has already voted on this suggestion');
  }

  suggestion.votes.push(userId);
  await trip.save();

  return suggestion;
};

// Get all itinerary items for a trip
exports.getItinerary = async (tripId) => {
  const trip = await Trip.findById(tripId);
  return trip ? trip.itinerary : [];
};

// Delete an itinerary item
exports.deleteItineraryItem = async (tripId, itemId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const itineraryItem = trip.itinerary.id(itemId);
  if (!itineraryItem) throw new Error('Itinerary item not found');

  itineraryItem.remove();
  await trip.save();

  return itineraryItem;
};
