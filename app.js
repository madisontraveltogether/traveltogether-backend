// app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(express.json()); // JSON body parser

const corsOptions = {
  origin: 'https://www.gettraveltogether.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan('dev'));

// Debugging logs
console.log('authRoutes:', typeof authRoutes); // Should log 'function' or 'Router'
console.log('tripRoutes:', typeof tripRoutes); // Should log 'function' or 'Router'

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// Global error handler
app.use(errorHandler);

module.exports = app;
