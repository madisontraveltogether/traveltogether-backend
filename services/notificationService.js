const Trip = require('../models/tripModel');

// Get notifications for a trip
exports.getNotificationsByTrip = async (tripId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');
  return trip.notifications || [];
};

// Get task-specific notifications
exports.getTaskNotifications = async (tripId, userId) => {
  const notifications = await this.getNotificationsByTrip(tripId);
  return notifications.filter((n) => n.type === 'task' && n.userId.toString() === userId);
};

// Mark a notification as read
exports.markNotificationAsRead = async (notificationId) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) throw new Error('Notification not found');
  notification.isRead = true;
  await notification.save();
  return notification;
};

// Create a new notification
exports.createNotification = async ({ tripId, type, title, message, userId }) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const notification = {
    type,
    title,
    message,
    userId,
    isRead: false,
    createdAt: new Date(),
  };

  trip.notifications.push(notification);
  await trip.save();
  return notification;
};
