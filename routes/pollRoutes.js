// routes/pollRoutes.js
const express = require('express');
const pollController = require('../controllers/pollController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });

router.post('/', authMiddleware, pollController.createPoll);
router.get('/', authMiddleware, pollController.getPolls);
router.get('/:pollId', authMiddleware, pollController.getPollDetails);
router.put('/:pollId', authMiddleware, pollController.updatePoll);
router.delete('/:pollId', authMiddleware, pollController.deletePoll);
router.post('/:pollId/options/:optionId/vote', authMiddleware, pollController.voteOnPoll);
router.get('/:pollId/results', authMiddleware, pollController.getPollResults);

module.exports = router;
