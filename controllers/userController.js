// controllers/userController.js
const sendMail = require('../services/mailService');

exports.register = async (req, res) => {
  // Registration logic here...
  
  // After registration is successful
  try {
    await sendMail(
      'user-email@example.com', // Replace with the recipient's email
      'Welcome to Our Service!',
      'Thank you for registering with us!'
    );
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
