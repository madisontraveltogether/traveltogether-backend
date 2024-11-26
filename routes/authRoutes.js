const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

// User registration and login
router.post('/register', authController.register);    // Public route
router.post('/login', authController.login);          // Public route
router.get('/me', authMiddleware, authController.getUser); // Protected route
router.post('/refresh-token', authController.refreshToken); // Public route, but requires a valid refresh token in the body
router.post('/logout', authMiddleware, authController.logout); // Protected route
router.patch('/profile/password', authMiddleware, authController.resetPassword);
router.post('/profile/picture', authMiddleware, userController.uploadProfilePicture);
router.patch('/profile', authMiddleware, userController.updateUserProfile);
router.patch('/profile/preferences', authMiddleware, userController.updatePreferences);
router.get('/auth/profile/notification-preferences', authMiddleware, userController.getNotificationPreferences);
router.patch('/auth/profile/notification-preferences', authMiddleware, userController.updateNotificationPreferences);

module.exports = router;
