const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// User registration and login
router.post('/register', authController.register);    // Public route
router.post('/login', authController.login);          // Public route

// Access user profile and details
router.get('/me', authMiddleware, authController.getUser); // Protected route

// Refresh token for new access tokens
router.post('/refresh-token', authController.refreshToken); // Public route, but requires a valid refresh token in the body

// Logout to revoke refresh token
router.post('/logout', authMiddleware, authController.logout); // Protected route

module.exports = router;
