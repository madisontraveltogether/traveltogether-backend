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

exports.getExpenseNotifications = async (tripId, userId) => {
  const notifications = await this.getNotificationsByTrip(tripId);
  return notifications.filter((n) => n.type === 'expenses');
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

  // Emit the new notification to clients
  const io = req.app.get('socketio'); // Access Socket.IO instance
  io.to(tripId).emit('newNotification', notification);

  return notification;
};

