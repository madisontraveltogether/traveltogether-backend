const guestService = require('../services/guestService');

exports.addGuest = async (req, res) => {
  const { tripId } = req.params;
  const { email, notes } = req.body;

  try {
    const guests = await guestService.addGuest(tripId, email, notes);
    res.status(201).json({ message: 'Guest added successfully', guests });
  } catch (error) {
    console.error('Error adding guest:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getGuests = async (req, res) => {
  const { tripId } = req.params;

  try {
    const guests = await guestService.getGuests(tripId);
    res.status(200).json(guests);
  } catch (error) {
    console.error('Error fetching guests:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.removeGuest = async (req, res) => {
  const { tripId, guestEmail } = req.params;

  try {
    const guests = await guestService.removeGuest(tripId, guestEmail);
    res.status(200).json({ message: 'Guest removed successfully', guests });
  } catch (error) {
    console.error('Error removing guest:', error.message);
    res.status(500).json({ message: error.message });
  }
};
