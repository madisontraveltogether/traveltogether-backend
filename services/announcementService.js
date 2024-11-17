// services/announcementService.js
const Trip = require('../models/tripModel');

exports.createAnnouncement = async (tripId, { userId, message }) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const announcement = { user: userId, message, timestamp: new Date() };
  trip.announcements.push(announcement);
  await trip.save();

  return announcement;
};

exports.getAnnouncements = async (tripId) => {
  const trip = await Trip.findById(tripId).populate('announcements.user', 'name email');
  if (!trip) throw new Error('Trip not found');

  return trip.announcements;
};

exports.deleteAnnouncement = async (tripId, announcementId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  trip.announcements = trip.announcements.filter((announcement) => announcement._id.toString() !== announcementId);
  await trip.save();
};
