const NotificationService = require('../services/notificationService');

/**
 * Get all notifications for a trip
 */
const getTripNotifications = async (req, res) => {
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
 * Get task-specific notifications
 */
const getTaskNotifications = async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;
  try {
    const notifications = await NotificationService.getTaskNotifications(tripId, userId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching task notifications:', error);
    res.status(500).json({ message: 'Failed to fetch task notifications', error });
  }
};

/**
 * Get itinerary-specific notifications
 */
const getItineraryNotifications = async (req, res) => {
  const { tripId } = req.params;
  try {
    const notifications = await NotificationService.getItineraryNotifications(tripId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching itinerary notifications:', error);
    res.status(500).json({ message: 'Failed to fetch itinerary notifications', error });
  }
};

/**
 * Mark a notification as read
 */
const markAsRead = async (req, res) => {
  const { notificationId } = req.params;
  try {
    const notification = await NotificationService.markNotificationAsRead(notificationId);
    res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read', error });
  }
};

module.exports = {
  getTripNotifications,
  getTaskNotifications,
  getItineraryNotifications,
  markAsRead,
};

// notificationController.js

exports.getExpenseNotifications = async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user?.id; // Optional chaining to avoid undefined errors

  try {
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const notifications = await NotificationService.getNotificationsByType(tripId, 'expense', userId);

    if (!notifications || notifications.length === 0) {
      console.warn('No notifications found for user:', userId);
      return res.status(200).json([]);
    }

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching expense notifications:', error);
    res.status(500).json({ message: 'Failed to fetch expense notifications', error: error.message });
  }
};


exports.createExpenseNotification = async (req, res) => {
  const { tripId } = req.params;
  const { title, message, userId } = req.body; // Expecting these in the request body

  try {
    const notification = await NotificationService.createNotification({
      tripId,
      type: 'expense',
      title,
      message,
      userId,
    });
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating expense notification:', error);
    res.status(500).json({ message: 'Failed to create expense notification', error: error.message });
  }
};