const taskService = require('../services/taskService');

// Create a new task for a specific trip
exports.createTask = async (req, res) => {
  const { tripId } = req.params;
  const taskData = req.body;

  try {
    const task = await taskService.createTask(tripId, taskData);
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task', error: error.message });
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
    res.status(500).json({ message: 'Failed to retrieve tasks', error: error.message });
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
    res.status(500).json({ message: 'Failed to retrieve task details', error: error.message });
  }
};

// Update a task by ID
exports.updateTask = async (req, res) => {
  const { tripId, taskId } = req.params;
  const updates = req.body;

  try {
    const updatedTask = await taskService.updateTask(tripId, taskId, updates);
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
};

// Delete a specific task by ID
exports.deleteTask = async (req, res) => {
  const { tripId, taskId } = req.params;

  try {
    await taskService.deleteTask(tripId, taskId);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
};
