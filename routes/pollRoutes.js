const express = require('express');
const pollController = require('../controllers/pollController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true }); // Allows merging URL parameters from parent routes

// Create a new poll for a specific trip
router.post('/', authMiddleware, pollController.createPoll);

// Get all polls for a specific trip
router.get('/', authMiddleware, pollController.getPolls);

// Get details of a specific poll by ID
router.get('/:pollId', authMiddleware, pollController.getPollDetails);

// Update a specific poll by ID
router.put('/:pollId', authMiddleware, pollController.updatePoll);

// Delete a specific poll by ID
router.delete('/:pollId', authMiddleware, pollController.deletePoll);

// Vote on a poll option
router.post('/:pollId/options/:optionId/vote', authMiddleware, pollController.voteOnPoll);

// Get results of a specific poll by ID
router.get('/:pollId/results', authMiddleware, pollController.getPollResults);

module.exports = router;
