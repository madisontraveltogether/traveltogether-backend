const User = require('../models/userModel');
const sendMail = require('../services/mailService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env;

// Update user preferences
exports.updatePreferences = async (req, res) => {
  const userId = req.user.userId; // Assume user ID from middleware
  const { preferences } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.preferences = { ...user.preferences, ...preferences };
    await user.save();

    res.status(200).json({ message: 'Preferences updated successfully', preferences: user.preferences });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.uploadProfilePicture = [
  authMiddleware,
  upload.single('profilePicture'),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update user's profile picture path
      user.profilePicture = req.file.path;
      await user.save();

      res.status(200).json({ message: 'Profile picture updated successfully', profilePicture: user.profilePicture });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

exports.updateUserProfile = async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email) user.email = email;
    if (name) user.name = name;

    await user.save();

    res.status(200).json({ message: 'Profile updated successfully', user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
