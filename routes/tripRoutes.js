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

/**
 * Trip Routes
 */
router.get('/all', authMiddleware, tripController.getAllUserTrips);
router.get('/:tripId', authMiddleware, tripController.getTripById);
router.patch('/:tripId', authMiddleware, tripController.updateTrip);
router.delete('/:tripId', authMiddleware, tripController.deleteTrip);
router.post('/', authMiddleware, tripController.createTrip);
router.get('/:tripId/progress', authMiddleware, tripController.getTripProgress);

// Invite system routes
router.post('/:tripId/generate-code', authMiddleware, tripController.generateTripCode); // Generate a unique invite code for a trip
router.get('/:tripId/invite-link', authMiddleware, tripController.getInviteLink); // Fetch the invite link for a trip
router.get('/:tripId/code', authMiddleware, tripController.getTripCode); // Get the invite code for a trip
router.post('/:tripId/invite', authMiddleware, tripController.inviteUserToTrip); // Invite a user to a trip by email
router.post('/join', tripController.joinTripByCode); // Join a trip using an invite code (no auth required)

//notifications, announcements, and logs
router.post('/:tripId/notify', authMiddleware, tripController.notifyAllAttendees); // Notify all attendees
router.post('/:tripId/announcements/pin', authMiddleware, tripController.pinAnnouncement); // Pin an announcement
router.post('/:tripId/announcements/:announcementId/comments', authMiddleware, tripController.addAnnouncementComment); // Add a comment to an announcement
router.get('/:tripId/notifications', authMiddleware, tripController.getNotifications); // Get notifications for a trip
router.get('/:tripId/activity-logs', authMiddleware, tripController.getActivityLogs); // Get activity logs for a trip

// Messaging

// Guests and attendees
router.get('/:tripId/guests/filter', authMiddleware, tripController.getFilteredGuests); // Get guests based on filters
router.post('/:tripId/resend-invite', authMiddleware, tripController.resendInvite); // Resend invitation to a user

// Export trip
router.get('/:tripId/export', authMiddleware, tripController.exportTrip); // Export trip details

// User routes
router.get('/users/:userId', userController.getUserById); // Get user details by userId

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
router.get('/:tripId/expenses/tags', authMiddleware, expenseController.getExpensesByTags);
router.get('/:tripId/expenses/export', authMiddleware, expenseController.exportExpenses);
router.post('/:tripId/expenses/batch-delete', authMiddleware, expenseController.batchDeleteExpenses);
router.post('/:tripId/expenses/filter', authMiddleware, expenseController.filterExpenses); // For dynamic querying


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
router.post('/:tripId/tasks/:taskId/comments', authMiddleware, taskController.addTaskComment);
router.get('/:tripId/tasks/:taskId/comments', authMiddleware, taskController.getTaskComments);
router.get('/:tripId/tasks/progress', authMiddleware, taskController.getTripProgress);
router.post('/:tripId/tasks/filter', authMiddleware, taskController.filterTasks); // Dynamic querying and filters
router.post('/:tripId/tasks/batch-delete', authMiddleware, taskController.batchDeleteTasks);

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
router.get('/:tripId/messages/latest', authMiddleware, messageController.getLatestMessages); // Get latest messages for a trip

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
router.get('/:tripId/itinerary/tags', authMiddleware, itineraryController.getItineraryByTags);
router.get('/:tripId/itinerary/export', authMiddleware, itineraryController.exportToCalendar);
router.post('/:tripId/itinerary/filter', authMiddleware, itineraryController.filterItinerary); // Dynamic filters
router.post('/:tripId/itinerary/batch-delete', authMiddleware, itineraryController.batchDeleteItineraryItems);

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


//notification Routes
router.get('/:tripId/notifications', authMiddleware, notificationController.getTripNotifications); // OK
router.get('/:tripId/tasks/notifications', authMiddleware, notificationController.getTaskNotifications); // OK
router.get('/:tripId/itinerary/notifications', authMiddleware, notificationController.getItineraryNotifications); // OK
router.patch('/notifications/:notificationId', authMiddleware, notificationController.markAsRead); // OK
router.get('/:tripId/expenses/notifications', authMiddleware, notificationController.getExpenseNotifications); // Get notifications for expenses
router.post('/:tripId/expenses/notifications', authMiddleware, notificationController.createExpenseNotification);

module.exports = router;
