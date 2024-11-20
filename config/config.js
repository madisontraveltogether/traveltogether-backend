require('dotenv').config();

const config = {
  // Application Environment
  environment: process.env.NODE_ENV || 'development',

  // MongoDB Configuration
  database: {
    uri: process.env.MONGO_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    },
  },

  // JWT Configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: process.env.JWT_EXPIRATION || '7d', // Default: 7 days
  },
 


  // Server Port
  server: {
    port: process.env.PORT || 5000,
  },

  // Email Configuration
  email: {
    user: process.env.EMAIL_USER || 'your_email@example.com',
    pass: process.env.EMAIL_PASS || 'your_email_password',
    service: process.env.EMAIL_SERVICE || 'gmail', // Example: gmail, outlook
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info', // Levels: error, warn, info, verbose, debug
    logToFile: process.env.LOG_TO_FILE || false, // Enable file logging
  },

  // Socket.IO URL
  socket: {
    url: process.env.SOCKET_URL || 'https://www.gettraveltogether.com',
  },

  // Base Application URL (for frontend redirects)
  baseUrl: process.env.BASE_URL || 'https://www.gettraveltogether.com',

  // Feature Toggles (Optional for specific functionalities)
  features: {
    enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
  },
};

module.exports = config;
