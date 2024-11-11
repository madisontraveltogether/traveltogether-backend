// authMiddleware.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log("Auth Header:", authHeader);
  // Check if authorization header is present
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied, no token provided' });
  }
  
  // Extract token from "Bearer <token>" format
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  console.log("Extracted Token:", token);

  try {
    // Verify access token using config.jwtSecret
    const decoded = jwt.verify(token, config.jwtSecret); // Change here
    req.user = decoded; // Attach decoded token (user info) to the request object
    console.log("Decoded Token:", decoded); 
    next();
  } catch (error) {
    console.log("JWT Secret:", config.jwtSecret);
    console.log("JWT Verification Error:", error); 
    // Differentiate between expired and invalid tokens
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please log in again' });
    }
    res.status(400).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;