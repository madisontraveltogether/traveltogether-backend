const express = require('express');
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true }); // Allows merging URL parameters from parent routes

// Create a new task for a specific trip
router.post('/', authMiddleware, taskController.createTask);

// Get all tasks for a specific trip
router.get('/', authMiddleware, taskController.getTasks);

// Get details of a specific task
router.get('/:taskId', authMiddleware, taskController.getTaskDetails);

// Update task details by ID
router.put('/:taskId', authMiddleware, taskController.updateTask);

// Update task status
router.patch('/:taskId/status', authMiddleware, taskController.updateTaskStatus);

// Assign users to a task
router.patch('/:taskId/assign', authMiddleware, taskController.assignTask);

// Delete a specific task
router.delete('/:taskId', authMiddleware, taskController.deleteTask);

module.exports = router;
