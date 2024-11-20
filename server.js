const http = require('http');
const app = require('./app');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const express = require('express');
const WebSocket = require('ws');

dotenv.config();

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://www.gettraveltogether.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use('/uploads', express.static('uploads'));

// Server Port
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Socket.IO Configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'https://www.gettraveltogether.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
});

// WebSocket Configuration
const wss = new WebSocket.Server({ server });

// Initialize Socket.IO Handlers
io.on('connection', (socket) => {
  console.log(`Socket.IO connected: ${socket.id}`);

  socket.on('joinTrip', (tripId) => {
    if (tripId) {
      socket.join(tripId);
      console.log(`Socket joined trip: ${tripId}`);
    }
  });

  socket.on('sendMessage', (message) => {
    if (message && message.tripId) {
      io.to(message.tripId).emit('receiveMessage', message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket.IO disconnected: ${socket.id}`);
  });
});

// WebSocket Handlers
wss.on('connection', (ws) => {
  console.log('WebSocket connected');

  ws.on('message', (message) => {
    console.log('WebSocket received message:', message);
    ws.send(`Echo: ${message}`);
  });

  ws.on('close', () => {
    console.log('WebSocket disconnected');
  });
});

// Attach Real-Time Features to App
app.locals.io = io;
app.locals.wss = wss;

// Global Error Handler Middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});