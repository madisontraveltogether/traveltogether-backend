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
  };

  trip.itinerary.push(itineraryItem);
  await trip.save();

  return itineraryItem;
};

// Get all itinerary items for a trip
exports.getItinerary = async (tripId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  return trip.itinerary;
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

exports.getItineraryItem = async (tripId, itemId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const item = trip.itinerary.id(itemId);
  if (!item) throw new Error('Itinerary item not found');

  return item;
};

exports.updateItineraryItem = async (tripId, itemId, updates) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const item = trip.itinerary.id(itemId);
  if (!item) throw new Error('Itinerary item not found');

  Object.assign(item, updates); // Apply updates to the item
  await trip.save();

  return item;
};

exports.getItineraryItem = async (tripId, itemId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const item = trip.itinerary.id(itemId);
  if (!item) throw new Error('Itinerary item not found');

  return item;
};