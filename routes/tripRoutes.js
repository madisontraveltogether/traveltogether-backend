const express = require('express');
const tripController = require('../controllers/tripController');
const expenseController = require('../controllers/expenseController');
const taskController = require('../controllers/taskController');
const pollController = require('../controllers/pollController');
const messageController = require('../controllers/messageController');
const announcementController = require('../controllers/announcementController');
const itineraryController = require('../controllers/itineraryController');
const guestController = require('../controllers/guestController');
const invitationController = require('../controllers/invitationController');
const tripSettingsController = require('../controllers/tripSettingsController');
const authMiddleware = require('../middlewares/authMiddleware');
const { ensureTripMember } = require('../middlewares/roleMiddleware');
const { authenticateUser } = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer();
const userController = require('../controllers/userController');
const router = express.Router();
const { validateTask } = require('../middlewares/taskValidation');
const notificationController = require('../controllers/notificationController');

// Trip Routes
router.get('/all', authMiddleware, tripController.getAllUserTrips);
router.get('/:tripId', authMiddleware, tripController.getTripById);
router.post('/', authMiddleware, tripController.createTrip);
router.delete('/:tripId', authMiddleware, tripController.deleteTrip);

// Expense Routes
router.post('/:tripId/expenses', authMiddleware, expenseController.createExpense);
router.get('/:tripId/expenses', authMiddleware, expenseController.getExpenses);
router.delete('/:tripId/expenses/:expenseId', authMiddleware, expenseController.deleteExpense);

// Task Routes
router.post('/:tripId/tasks', authMiddleware, taskController.createTask);
router.get('/:tripId/tasks', authMiddleware, taskController.getTasks);
router.delete('/:tripId/tasks/:taskId', authMiddleware, taskController.deleteTask);

// Itinerary Routes
router.post('/:tripId/itinerary', authMiddleware, itineraryController.createItineraryItem);
router.get('/:tripId/itinerary', authMiddleware, itineraryController.getItinerary);
router.delete('/:tripId/itinerary/:itemId', authMiddleware, itineraryController.deleteItineraryItem);

// Guests Routes
router.get('/:tripId/guests', authMiddleware, guestController.getGuests);
router.post('/:tripId/guests', authMiddleware, guestController.addGuest);
router.delete('/:tripId/guests/:guestEmail', authMiddleware, guestController.removeGuest);

// Invitation Routes
router.post('/:tripId/invite', authMiddleware, tripController.inviteUserToTrip);
router.post('/join', tripController.joinTripByCode);

