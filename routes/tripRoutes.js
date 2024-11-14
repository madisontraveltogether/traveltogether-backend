const express = require('express');
const tripController = require('../controllers/tripController'); // Ensure the path is correct
const authMiddleware = require('../middlewares/authMiddleware');
const expenseController = require('../controllers/expenseController');
const taskController = require('../controllers/taskController');
const pollController = require('../controllers/pollController');
const messageController = require('../controllers/messageController');

const router = express.Router();

// Route to create a new trip
router.post('/', authMiddleware, tripController.createTrip);

// Route to get trip details by ID
router.get('/:tripId', authMiddleware, tripController.getTripById);

// Route to update trip details by ID
router.patch('/:tripId', authMiddleware, tripController.updateTrip);

// Route to delete a trip by ID
router.delete('/:tripId', authMiddleware, tripController.deleteTrip);

// Route to add a guest to a trip
router.post('/:tripId/guests', authMiddleware, tripController.addGuest);

// Route to remove a guest from a trip
router.delete('/:tripId/guests', authMiddleware, tripController.removeGuest);

router.post('/:tripId/expenses', expenseController.createExpense);

router.get('/', authMiddleware, expenseController.getExpenses);
router.get('/all', authMiddleware, tripController.getAllUserTrips);


router.get('/:tripId/expenses/:expenseId', authMiddleware, expenseController.getExpenseById);

// Update an existing expense by ID
router.put('/:tripId/expenses/:expenseId', authMiddleware, expenseController.updateExpense);

// Delete an expense by ID
router.delete('/:tripId/expenses/:expenseId', authMiddleware, expenseController.deleteExpense);

// Create a new task for a specific trip
router.post('/:tripId/tasks', authMiddleware, taskController.createTask);

// Get all tasks for a specific trip
router.get('/:tripId/tasks', authMiddleware, taskController.getTasks);

// Get details of a specific task
router.get('/:tripId/tasks/:taskId', authMiddleware, taskController.getTaskDetails);

// Update task details by ID
router.put('/:tripId/tasks/:taskId', authMiddleware, taskController.updateTask);

// Update task status
router.patch('/:tripId/tasks/:taskId/status', authMiddleware, taskController.updateTaskStatus);

// Assign users to a task
router.patch('/:tripId/tasks/:taskId/assign', authMiddleware, taskController.assignTask);

// Delete a specific task
router.delete('/:tripId/tasks/:taskId', authMiddleware, taskController.deleteTask);

router.post('/:tripId/polls', authMiddleware, pollController.createPoll);
router.get('/:tripId/polls', authMiddleware, pollController.getPolls);
router.get('/:tripId/polls/:pollId', authMiddleware, pollController.getPollDetails);
router.put('/:tripId/polls/:pollId', authMiddleware, pollController.updatePoll);
router.delete('/:tripId/polls/:pollId', authMiddleware, pollController.deletePoll);
router.post('/:tripId/polls/:pollId/options/:optionId/vote', authMiddleware, pollController.voteOnPoll);
router.get('/:tripId/polls/:pollId/results', authMiddleware, pollController.getPollResults);

router.post('/:tripId/collaborators', authMiddleware, tripController.addCollaborator);

router.post('/:tripId/messages', authMiddleware, messageController.sendMessage);

// Route to get all messages for a trip
router.get('/:tripId/messages', authMiddleware, messageController.getMessages);


module.exports = router;
