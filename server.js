// server.js
const http = require('http');
const app = require('./app');
const dotenv = require('dotenv');
const socketIo = require('socket.io'); // Socket.IO for real-time features
const express = require('express');
const cors = require('cors');

const corsOptions = {
  origin: 'https://refactored-space-fishstick-r4p5g94vv55jcv57-3000.app.github.dev', // Replace with your frontend URL
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware and route setup
app.use(express.json());
dotenv.config();

// Define port
const PORT = process.env.PORT || 5000;

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins or specify domains
    methods: ['GET', 'POST']
  }
});

// WebSocket logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join room for a specific trip
  socket.on('joinTrip', (tripId) => {
    socket.join(tripId);
    console.log(`Client joined trip room: ${tripId}`);
  });

  // Handle voting updates
  socket.on('voteUpdate', (tripId, itemId, updateData) => {
    io.to(tripId).emit('voteUpdate', { itemId, ...updateData });
  });

  // Handle comment updates
  socket.on('commentUpdate', (tripId, itemId, comment) => {
    io.to(tripId).emit('commentUpdate', { itemId, comment });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
