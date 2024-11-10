// db.js
const mongoose = require('mongoose');
const config = require('./config'); // Import the config file

const connectDB = async () => {
  try {
    await mongoose.connect(config.database.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Additional options can go here, or retrieve from config if needed
    });
    console.log("MongoDB connected...");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
