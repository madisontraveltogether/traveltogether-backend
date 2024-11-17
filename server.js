const http = require('http');
const app = require('./app');
const dotenv = require('dotenv');
const socketIo = require('socket.io'); // Socket.IO for real-time features
const express = require('express');
const cors = require('cors');
const path = require('path'); // Ensure this is imported if not already

dotenv.config();

// Middleware for serving static files and handling CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Add PATCH method for API routes
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware and JSON parsing
app.use(express.json());

// Define port
const PORT = process.env.PORT || 5000;

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Add PATCH for compatibility
  },
});
const taskController = require('./controllers/taskController');
taskController.setSocket(io);

// WebSocket logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Listen for a client joining a trip
  socket.on('joinTrip', (tripId) => {
    if (!tripId) {
      console.log('Invalid tripId received.');
      return;
    }
    socket.join(tripId);
    console.log(`Client joined trip room: ${tripId}`);
  });

  // Handle receiving and broadcasting messages
  socket.on('sendMessage', (message) => {
    if (message && message.tripId) {
      io.to(message.tripId).emit('receiveMessage', message);
      console.log(`Message sent to trip room ${message.tripId}:`, message);
    } else {
      console.log('Invalid message received:', message);
    }
  });

  // Handle voting updates
  socket.on('voteUpdate', (tripId, itemId, updateData) => {
    if (tripId && itemId) {
      io.to(tripId).emit('voteUpdate', { itemId, ...updateData });
    } else {
      console.log('Invalid voting update:', { tripId, itemId, updateData });
    }
  });

  // Handle comment updates
  socket.on('commentUpdate', (tripId, itemId, comment) => {
    if (tripId && itemId && comment) {
      io.to(tripId).emit('commentUpdate', { itemId, comment });
    } else {
      console.log('Invalid comment update:', { tripId, itemId, comment });
    }
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export `io` for use in controllers
app.locals.io = io;

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
