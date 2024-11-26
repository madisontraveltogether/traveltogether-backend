const Notification = require('../models/notificationModel');
const Trip = require('../models/tripModel');

// Create a new notification
exports.createNotification = async (tripId, type, payload, userIds = []) => {
  const notifications = userIds.map((userId) => ({
    tripId,
    type,
    payload,
    userId,
    read: false,
    createdAt: new Date(),
  }));

  const createdNotifications = await Notification.insertMany(notifications);
  return createdNotifications;
};

// Fetch notifications by trip
exports.getNotificationsByTrip = async (tripId) => {
  const notifications = await Notification.find({ tripId }).sort({ createdAt: -1 });
  return notifications;
};

// Fetch notifications for a specific user
exports.getNotificationsByUser = async (userId) => {
  const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
  return notifications;
};

// Mark a notification as read
exports.markNotificationAsRead = async (notificationId) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) throw new Error('Notification not found');

  notification.read = true;
  await notification.save();

  return notification;
};

// Mark all notifications for a user as read
exports.markAllNotificationsAsRead = async (userId) => {
  const result = await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
  return result;
};

// Delete a notification
exports.deleteNotification = async (notificationId) => {
  const notification = await Notification.findByIdAndDelete(notificationId);
  if (!notification) throw new Error('Notification not found');
  return notification;
};

// Delete all notifications for a trip
exports.deleteNotificationsByTrip = async (tripId) => {
  const result = await Notification.deleteMany({ tripId });
  return result;
};
