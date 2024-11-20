const http = require('http');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = require('./app'); // Ensure `app.js` has correct configurations

dotenv.config(); // Load .env variables

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://www.gettraveltogether.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'https://www.gettraveltogether.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

// Example: Initialize controllers with `io`
const taskController = require('./controllers/taskController');
taskController.initialize(io);

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('joinTrip', (tripId) => {
    socket.join(tripId);
    console.log(`Client joined trip room: ${tripId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

const connectDB = require('./config/db');
connectDB(); // Connect to MongoDB
