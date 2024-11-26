const Trip = require('../models/tripModel');

/**
 * Get all notifications for a trip
 */
exports.getNotificationsByTrip = async (tripId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');
  return trip.notifications || [];
};

/**
 * Get task-specific notifications for a trip
 */
exports.getTaskNotifications = async (tripId, userId) => {
  const notifications = await this.getNotificationsByTrip(tripId);
  return notifications.filter((n) => n.type === 'task' && (!n.userId || n.userId.toString() === userId));
};

/**
 * Get itinerary-specific notifications for a trip
 */
exports.getItineraryNotifications = async (tripId) => {
  const notifications = await this.getNotificationsByTrip(tripId);
  return notifications.filter((n) => n.type === 'itinerary');
};

/**
 * Mark a notification as read
 */
exports.markNotificationAsRead = async (notificationId) => {
  const trip = await Trip.findOne({ 'notifications._id': notificationId });
  if (!trip) throw new Error('Notification not found');

  const notification = trip.notifications.id(notificationId);
  if (!notification) throw new Error('Notification not found');

  notification.read = true;
  await trip.save();

  return notification;
};

/**
 * Create a notification
 */
exports.createNotification = async (tripId, type, payload, userId = null) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const notification = {
    type,
    payload,
    userId,
    read: false,
    createdAt: new Date(),
  };

  trip.notifications.push(notification);
  await trip.save();
  return notification;
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

exports.getNotificationsByType = async (tripId, type, userId) => {
  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      console.error('Trip not found:', tripId);
      throw new Error('Trip not found');
    }

    if (!trip.notifications || !Array.isArray(trip.notifications)) {
      console.error('No notifications found in trip:', tripId);
      return [];
    }

    // Filter notifications by type and user
    const filteredNotifications = trip.notifications.filter((notification) => {
      return (
        notification.type === type &&
        (!notification.userId || notification.userId.toString() === userId) // Match userId or global notification
      );
    });

    return filteredNotifications;
  } catch (error) {
    console.error('Error fetching notifications by type:', error);
    throw new Error('Failed to fetch notifications by type');
  }
};
