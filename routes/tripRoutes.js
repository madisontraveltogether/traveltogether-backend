const express = require('express');
const tripController = require('../controllers/tripController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Create a new trip
router.post('/', authMiddleware, tripController.createTrip);

// Get trip details
router.get('/:tripId', authMiddleware, tripController.getTrip);

// Get trip summary for dashboard or overview
router.get('/:tripId/summary', authMiddleware, tripController.getTripSummary);

// Update trip details
router.patch('/:tripId', authMiddleware, tripController.updateTrip);

// Delete a trip
router.delete('/:tripId', authMiddleware, tripController.deleteTrip);

// Add a guest to a trip
router.post('/:tripId/guests', authMiddleware, tripController.addGuest);

// Remove a guest from a trip
router.delete('/:tripId/guests/:guestId', authMiddleware, tripController.removeGuest);

// Add a collaborator to a trip
router.post('/:tripId/collaborators', authMiddleware, tripController.addCollaborator);

// Remove a collaborator from a trip
router.delete('/:tripId/collaborators/:collaboratorId', authMiddleware, tripController.removeCollaborator);

module.exports = router;
