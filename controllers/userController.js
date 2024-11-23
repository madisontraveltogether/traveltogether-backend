const User = require('../models/userModel');
const sendMail = require('../services/mailService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env;
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require('multer');


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


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_pictures'); // Define where to store images
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.userId}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

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

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ id: user.id, name: user.name });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
