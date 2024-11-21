// app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const taskRoutes = require('./routes/taskRoutes');
const pollRoutes = require('./routes/pollRoutes');

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(express.json()); // JSON body parser
app.options('*', cors(corsOptions)); // Handle preflight requests
app.use(morgan('dev')); // Logger for development

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/trips/:tripId/expenses', expenseRoutes);
app.use('/api/trips/:tripId/tasks', taskRoutes);
app.use('/api/trips/:tripId/polls', pollRoutes);

// Global error handler
app.use(errorHandler);

module.exports = app;
