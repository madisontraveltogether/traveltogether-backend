// controllers/taskController.js
const taskService = require('../services/taskService');

// Create a new task for a specific trip
exports.createTask = async (req, res) => {
  const { tripId } = req.params;
  const { title, description, assignedTo, dueDate, priority, isRecurring } = req.body;

  try {
    const task = await taskService.createTask(tripId, {
      title,
      description,
      assignedTo,
      dueDate,
      priority,
      isRecurring
    });
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all tasks for a specific trip
exports.getTasks = async (req, res) => {
  const { tripId } = req.params;

  try {
    const tasks = await taskService.getTasks(tripId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get details of a specific task
exports.getTaskDetails = async (req, res) => {
  const { tripId, taskId } = req.params;

  try {
    const task = await taskService.getTaskDetails(tripId, taskId);
    res.status(200).json(task);
  } catch (error) {
    console.error('Error retrieving task details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update task details by ID
exports.updateTask = async (req, res) => {
  const { tripId, taskId } = req.params;
  const updates = req.body;

  try {
    const updatedTask = await taskService.updateTask(tripId, taskId, updates);
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  const { tripId, taskId } = req.params;
  const { status } = req.body;

  try {
    const updatedTask = await taskService.updateTaskStatus(tripId, taskId, status);
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign users to a task
exports.assignTask = async (req, res) => {
  const { tripId, taskId } = req.params;
  const { assignedTo } = req.body;

  try {
    const updatedTask = await taskService.assignTask(tripId, taskId, assignedTo);
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error assigning users to task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a specific task
exports.deleteTask = async (req, res) => {
  const { tripId, taskId } = req.params;

  try {
    await taskService.deleteTask(tripId, taskId);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
