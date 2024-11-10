const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Generate an access token
exports.generateAccessToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.secret, { expiresIn: config.jwt.accessTokenExpiry || '1h' });
};

// Generate a refresh token
exports.generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.secret, { expiresIn: config.jwt.refreshTokenExpiry || '7d' });
};

// Verify and decode an access token
exports.verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

// Verify and decode a refresh token
exports.verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};
