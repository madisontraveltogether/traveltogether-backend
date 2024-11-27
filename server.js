require('dotenv').config(); // Load .env variables

const http = require('http');
const app = require('./app'); // Ensure `app.js` is configured correctly
const connectDB = require('./config/db');
const initializeSocket = require('./utils/socket');
const emailRoutes = require('./routes/emailRoutes'); // Ensure this is implemented correctly

// Connect to MongoDB
connectDB();

// Use email ro
utes
app.use('/api/email', emailRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'https://www.gettraveltogether.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

// Attach io to app.locals for shared use
app.locals.io = io;

// Initialize Socket.IO events
initializeSocket(io);

// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1); // Exit process after logging
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1); // Exit process after logging
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
