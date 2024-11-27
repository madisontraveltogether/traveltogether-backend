const express = require('express');
const tripController = require('../controllers/tripController');
const expenseController = require('../controllers/expenseController');
const guestController = require('../controllers/guestController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Trip Routes
router.get('/all', tripController.getAllUserTrips);
router.get('/:tripId', tripController.getTripById);
router.post('/', tripController.createTrip);
router.delete('/:tripId', tripController.deleteTrip);

// Expense Routes
router.post('/:tripId/expenses', expenseController.createExpense);
router.get('/:tripId/expenses', expenseController.getExpenses);
router.delete('/:tripId/expenses/:expenseId', expenseController.deleteExpense);

// Guests Routes
router.get('/:tripId/guests', guestController.getGuests);
router.post('/:tripId/guests', guestController.addGuest);
router.delete('/:tripId/guests/:guestEmail', guestController.removeGuest);

// Invitation Routes
router.post('/:tripId/invite', tripController.inviteUserToTrip);
router.post('/invitations/join', tripController.joinTripByCode);

module.exports = router;
