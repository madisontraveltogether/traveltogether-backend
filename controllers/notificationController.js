const NotificationService = require('../services/notificationService');
const io = require('../server'); // Import WebSocket instance

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

const getExpenseNotifications = async (req, res) => {
  const { tripId } = req.params;
  try {
    const notifications = await NotificationService.getExpenseNotifications(tripId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching expense notifications:', error);
    res.status(500).json({ message: 'Failed to fetch expense notifications', error: error.message });
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

const createExpenseNotification = async (req, res) => {
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


const createNotification = async (req, res) => {
  const { tripId } = req.params;
  const { type, payload, userId } = req.body;

  try {
    const notification = await NotificationService.createNotification(tripId, type, payload, userId);

    // Emit the notification to WebSocket clients
    io.to(tripId).emit('newNotification', notification);

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Failed to create notification', error: error.message });
  }
};


module.exports = {
  getTripNotifications,
  getTaskNotifications,
  getItineraryNotifications,
  getExpenseNotifications,
  createExpenseNotification,
  markAsRead,
  createNotification,
};