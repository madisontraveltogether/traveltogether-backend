const Trip = require('../models/tripModel');
const NotificationService = require('../services/notificationService');

/**
 * Get all notifications for a trip
 */
exports.getTripNotifications = async (req, res) => {
  const { tripId } = req.params;

  try {
    const notifications = await NotificationService.getNotificationsByTrip(tripId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching trip notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error });
  }
};

/**
 * Get task-specific notifications for a trip
 */
exports.getTaskNotifications = async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;

  try {
    const taskNotifications = await NotificationService.getTaskNotifications(tripId, userId);
    res.status(200).json(taskNotifications);
  } catch (error) {
    console.error('Error fetching task notifications:', error);
    res.status(500).json({ message: 'Failed to fetch task notifications', error });
  }
};

/**
 * Get itinerary-specific notifications for a trip
 */
exports.getItineraryNotifications = async (req, res) => {
  const { tripId } = req.params;

  try {
    const itineraryNotifications = await NotificationService.getItineraryNotifications(tripId);
    res.status(200).json(itineraryNotifications);
  } catch (error) {
    console.error('Error fetching itinerary notifications:', error);
    res.status(500).json({ message: 'Failed to fetch itinerary notifications', error });
  }
};

/**
 * Mark a notification as read
 */
exports.markAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const updatedNotification = await NotificationService.markNotificationAsRead(notificationId);
    res.status(200).json(updatedNotification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read', error });
  }
};