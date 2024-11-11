const express = require('express');
const tripController = require('../controllers/tripController'); // Ensure the path is correct
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Route to create a new trip
router.post('/', authMiddleware, tripController.createTrip);

// Route to get trip details by ID
router.get('/:tripId', authMiddleware, tripController.getTripDetails);

// Route to update trip details by ID
router.patch('/:tripId', authMiddleware, tripController.updateTrip);

// Route to delete a trip by ID
router.delete('/:tripId', authMiddleware, tripController.deleteTrip);

// Route to add a guest to a trip
router.post('/:tripId/guests', authMiddleware, tripController.addGuest);

// Route to remove a guest from a trip
router.delete('/:tripId/guests', authMiddleware, tripController.removeGuest);

module.exports = router;
