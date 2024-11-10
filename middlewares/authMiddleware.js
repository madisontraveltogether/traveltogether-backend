const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  // Check if authorization header is present
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied, no token provided' });
  }
  
  // Extract token from "Bearer <token>" format
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  try {
    // Verify access token
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded; // Attach decoded token (user info) to the request object
    next();
  } catch (error) {
    // Differentiate between expired and invalid tokens
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please log in again' });
    }
    res.status(400).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
