const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getUser);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);

router.patch('/profile/password', authMiddleware, authController.resetPassword);
router.post('/profile/picture', authMiddleware, userController.uploadProfilePicture);
router.patch('/profile', authMiddleware, userController.updateUserProfile);
router.patch('/profile/preferences', authMiddleware, userController.updatePreferences);
router.get('/profile/notification-preferences', authMiddleware, userController.getNotificationPreferences);
router.patch('/profile/notification-preferences', authMiddleware, userController.updateNotificationPreferences);

module.exports = router;
