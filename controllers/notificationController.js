const Notification = require("../models/tripModel"); // Assuming a Notification model
const Trip = require("../models/tripModel");

/**
 * Get all notifications for a trip
 */
exports.getTripNotifications = async (req, res) => {
  const { tripId } = req.params;

  try {
    const notifications = await Notification.find({ tripId });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching trip notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications", error });
  }
};

/**
 * Get task-specific notifications
 */
exports.getTaskNotifications = async (req, res) => {
  const { tripId } = req.params;

  try {
    const notifications = await Notification.find({ tripId, type: "task" });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching task notifications:", error);
    res.status(500).json({ message: "Failed to fetch task notifications", error });
  }
};

/**
 * Get itinerary-specific notifications
 */
exports.getItineraryNotifications = async (req, res) => {
  const { tripId } = req.params;

  try {
    const notifications = await Notification.find({ tripId, type: "itinerary" });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching itinerary notifications:", error);
    res.status(500).json({ message: "Failed to fetch itinerary notifications", error });
  }
};

/**
 * Mark a notification as read
 */
exports.markAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read", error });
  }
};

/**
 * Create notifications for trip updates (e.g., tasks, expenses, itinerary)
 */
exports.createNotification = async (tripId, type, title, message, userId) => {
  try {
    const notification = new Notification({
      tripId,
      type,
      title,
      message,
      userId,
      isRead: false,
      createdAt: new Date(),
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};
