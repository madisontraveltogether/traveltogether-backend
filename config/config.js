// config/config.js
const dotenv = require('dotenv');

// Load environment variables from a .env file into process.env
dotenv.config();

const config = {
  // Application settings
  app: {
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
  },

  // Database settings
  database: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/myapp',
  },

  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Default expiry time for JWT
  },

  // Mailjet (Email) configuration
  mailjet: {
    apiKey: process.env.MAILJET_API_KEY || '',
    apiSecret: process.env.MAILJET_API_SECRET || '',
    senderEmail: process.env.EMAIL_FROM || 'no-reply@yourapp.com',
    senderName: process.env.EMAIL_NAME || 'Your App',
  },

  // WebSocket settings
  websocket: {
    allowedOrigins: process.env.WS_ALLOWED_ORIGINS || '*', // Adjust for production
  },

  // Third-party API keys and other integrations
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  },
  calendar: {
    googleCalendarApiKey: process.env.GOOGLE_CALENDAR_API_KEY || '',
    outlookCalendarApiKey: process.env.OUTLOOK_CALENDAR_API_KEY || '',
  },
  notifications: {
    firebaseApiKey: process.env.FIREBASE_API_KEY || '',
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  },

  // Currency and weather APIs
  currency: {
    apiKey: process.env.CURRENCY_API_KEY || '',
  },
  weather: {
    apiKey: process.env.WEATHER_API_KEY || '',
  },
};

// Basic validation for required environment variables
if (!config.database.uri) {
  throw new Error('MONGO_URI is required but not provided in .env file');
}
if (!config.jwt.secret) {
  throw new Error('JWT_SECRET is required but not provided in .env file');
}
if (!config.mailjet.apiKey || !config.mailjet.apiSecret) {
  console.warn('Mailjet API keys are missing, email functionality may be limited');
}

module.exports = config;
