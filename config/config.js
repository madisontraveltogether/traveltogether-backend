require('dotenv').config();

module.exports = {
  // MongoDB connection URI
  mongoURI: process.env.MONGO_URI || 

  // JWT Secret for signing tokens
  jwtSecret: process.env.JWT_SECRET || 'fallback_default_secret',

  // Port for the server
  port: process.env.PORT || 5000,

  // Email configuration for notifications (optional)
  emailUser: process.env.EMAIL_USER || 'your_email@example.com',
  emailPass: process.env.EMAIL_PASS || 'your_email_password',

  // Additional settings can go here, such as API keys, service URLs, etc.
};
