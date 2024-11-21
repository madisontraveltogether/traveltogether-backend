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

const router = express.Router();


/**
 * Trip Routes
 */
router.get('/all', authMiddleware, tripController.getAllUserTrips);
router.get('/:tripId', authMiddleware, tripController.getTripById);
router.patch('/:tripId', authMiddleware, tripController.updateTrip);
router.delete('/:tripId', authMiddleware, tripController.deleteTrip);
router.post('/', authMiddleware, tripController.createTrip);
router.post('/:tripId/notify', authMiddleware, tripController.notifyAllAttendees);
router.post('/:tripId/announcements/pin', authMiddleware, tripController.pinAnnouncement);
router.post(
    '/:tripId/announcements/:announcementId/comments',
    authMiddleware,
    tripController.addAnnouncementComment
  );
  router.get('/:tripId/messages/latest', authMiddleware, messagesController.getLatestMessages);
  
/**
 * Guest Routes
 */
router.post('/:tripId/guests', authMiddleware, guestController.addGuest);
router.patch('/:tripId/guests/:guestEmail/rsvp', authMiddleware, guestController.updateRSVP);
router.get('/:tripId/guests', authMiddleware, guestController.getGuests);
router.delete('/:tripId/guests/:guestEmail', authMiddleware, guestController.removeGuest);
router.get('/:tripId/guests/rsvp-counters', authMiddleware, guestController.getRSVPCounters);

/**
 * Expense Routes
 */
router.post('/:tripId/expenses', authMiddleware, expenseController.createExpense);
router.get('/:tripId/expenses', authMiddleware, expenseController.getExpenses);
router.get('/:tripId/expenses/:expenseId', authMiddleware, expenseController.getExpenseById);
router.patch('/:tripId/expenses/:expenseId', authMiddleware, expenseController.updateExpense);
router.delete('/:tripId/expenses/:expenseId', authMiddleware, expenseController.deleteExpense);
router.get('/:tripId/balances', authMiddleware, expenseController.getBalances);

/**
 * Task Routes
 */
router.post('/:tripId/tasks', authMiddleware, taskController.createTask);
router.get('/:tripId/tasks', authMiddleware, taskController.getTasks);
router.get('/:tripId/tasks/:taskId', authMiddleware, taskController.getTaskDetails);
router.patch('/:tripId/tasks/:taskId', authMiddleware, taskController.updateTask);
router.patch('/:tripId/tasks/:taskId/status', authMiddleware, taskController.updateTaskStatus);
router.patch('/:tripId/tasks/:taskId/assign', authMiddleware, taskController.assignTask);
router.delete('/:tripId/tasks/:taskId', authMiddleware, taskController.deleteTask);

/**
 * Poll Routes
 */
router.post('/:tripId/polls', authMiddleware, pollController.createPoll);
router.get('/:tripId/polls', authMiddleware, pollController.getPolls);
router.get('/:tripId/polls/:pollId', authMiddleware, pollController.getPollDetails);
router.put('/:tripId/polls/:pollId', authMiddleware, pollController.updatePoll);
router.delete('/:tripId/polls/:pollId', authMiddleware, pollController.deletePoll);
router.post('/:tripId/polls/:pollId/options/:optionId/vote', authMiddleware, pollController.voteOnPoll);
router.get('/:tripId/polls/:pollId/results', authMiddleware, pollController.getPollResults);

/**
 * Message Routes
 */
router.post('/:tripId/messages', authMiddleware, messageController.sendMessage);
router.get('/:tripId/messages', authMiddleware, messageController.getMessages);

/**
 * Announcement Routes
 */
router.post('/:tripId/announcements', authMiddleware, announcementController.createAnnouncement);
router.get('/:tripId/announcements', authMiddleware, announcementController.getAnnouncements);
router.delete('/:tripId/announcements/:announcementId', authMiddleware, announcementController.deleteAnnouncement);

/**
 * Itinerary Routes
 */
router.post('/:tripId/itinerary', authMiddleware, itineraryController.createItineraryItem);
router.get('/:tripId/itinerary', authMiddleware, itineraryController.getItinerary);
router.post('/:tripId/itinerary/suggestions', authMiddleware, itineraryController.addSuggestion);
router.post('/:tripId/itinerary/suggestions/:suggestionId/vote', authMiddleware, itineraryController.voteOnSuggestion);
router.delete('/:tripId/itinerary/:itemId', authMiddleware, itineraryController.deleteItineraryItem);

/**
 * Settings Routes
 */
router.get('/:tripId/settings', authMiddleware, tripSettingsController.getSettings);
router.patch('/:tripId/settings', authMiddleware, tripSettingsController.updateSettings);

/**
 * Invitation Routes
 */
router.get('/user/invitations', authMiddleware, invitationController.getUserInvitations);
router.post('/user/invitations/:invitationId/accept', authMiddleware, invitationController.acceptInvitation);
router.post('/user/invitations/:invitationId/decline', authMiddleware, invitationController.declineInvitation);

module.exports = router;
