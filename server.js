const http = require('http');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = require('./app'); // Ensure `app.js` has correct configurations
const connectDB = require('./config/db');
const emailRoutes = require('./routes/emailRoutes');

app.use('/api/email', emailRoutes);

dotenv.config(); // Load .env variables

// Connect to MongoDB
connectDB();

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [process.env.FRONTEND_URL, 'https://www.gettraveltogether.com'];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'https://www.gettraveltogether.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

// Attach io to app.locals to avoid circular dependencies
app.locals.io = io;

// Socket.IO event handling
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

// Start the server
server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
