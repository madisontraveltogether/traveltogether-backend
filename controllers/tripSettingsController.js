// controllers/tripSettingsController.js
const Trip = require('../models/tripModel');

// Get trip settings
exports.getSettings = async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId).select('settings');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    res.status(200).json(trip.settings);
  } catch (error) {
    console.error('Error fetching trip settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update trip settings with validation and role checks
exports.updateSettings = async (req, res) => {
  const { tripId } = req.params;
  const { settings } = req.body;
  const userId = req.user.userId; // Assuming authentication middleware provides userId

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    // Ensure user is organizer or collaborator
    const isAuthorized =
      trip.organizer.equals(userId) || trip.collaborators.some((collaborator) => collaborator.equals(userId));
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Access denied: Only organizers or collaborators can update settings' });
    }

    // Validate and update settings
    if (settings.maxGuests && settings.maxGuests < 1) {
      return res.status(400).json({ message: 'Max guests must be at least 1' });
    }

    trip.settings = { ...trip.settings, ...settings };
    await trip.save();

    res.status(200).json({ message: 'Settings updated successfully', settings: trip.settings });
  } catch (error) {
    console.error('Error updating trip settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
