const NotificationService = require('../services/notificationService');

/**
 * Get all notifications for a trip.
 */
exports.getTripNotifications = async (req, res) => {
  const { tripId } = req.params;

  try {
    const notifications = await NotificationService.getNotificationsByTrip(tripId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching trip notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

/**
 * Get task-specific notifications.
 */
exports.getTaskNotifications = async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;

  try {
    const notifications = await NotificationService.getTaskNotifications(tripId, userId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching task notifications:', error);
    res.status(500).json({ message: 'Failed to fetch task notifications', error: error.message });
  }
};

/**
 * Get itinerary-specific notifications.
 */
exports.getItineraryNotifications = async (req, res) => {
  const { tripId } = req.params;

  try {
    const notifications = await NotificationService.getItineraryNotifications(tripId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching itinerary notifications:', error);
    res.status(500).json({ message: 'Failed to fetch itinerary notifications', error: error.message });
  }
};

/**
 * Mark a notification as read.
 */
exports.markAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const updatedNotification = await NotificationService.markNotificationAsRead(notificationId);
    res.status(200).json(updatedNotification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
};

/**
 * Create a new notification.
 */
exports.createNotification = async (req, res) => {
  const { tripId, type, title, message, userId } = req.body;

  try {
    const notification = await NotificationService.createNotification({
      tripId,
      type,
      title,
      message,
      userId,
    });
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Failed to create notification', error: error.message });
  }
};
