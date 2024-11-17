// controllers/announcementController.js
const announcementService = require('../services/announcementService');

// Create a new announcement
exports.createAnnouncement = async (req, res) => {
  const { tripId } = req.params;
  const { message } = req.body;
  const userId = req.user.userId;

  try {
    const announcement = await announcementService.createAnnouncement(tripId, { userId, message });
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all announcements for a specific trip
exports.getAnnouncements = async (req, res) => {
  const { tripId } = req.params;

  try {
    const announcements = await announcementService.getAnnouncements(tripId);
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete an announcement
exports.deleteAnnouncement = async (req, res) => {
  const { tripId, announcementId } = req.params;

  try {
    await announcementService.deleteAnnouncement(tripId, announcementId);
    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
