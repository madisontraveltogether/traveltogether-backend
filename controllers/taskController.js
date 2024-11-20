// controllers/taskController.js
const taskService = require('../services/taskService');
const Trip = require('../models/tripModel');

let io;
exports.initialize = (socketIo) => {
  io = socketIo;
};


// Create a new task for a specific trip
exports.createTask = async (req, res) => {
  const { tripId } = req.params;
  const { title, description, assignedTo, dueDate, priority, isRecurring } = req.body;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Validate assigned users
    const validUsers = trip.guests.concat(trip.collaborators, trip.organizer.toString());
    if (assignedTo) {
      assignedTo.forEach((user) => {
        if (!validUsers.includes(user.toString())) {
          throw new Error(`User ${user} is not part of this trip`);
        }
      });
    }

    const task = { title, description, assignedTo, dueDate, priority, isRecurring, status: 'pending' };
    trip.tasks.push(task);
    await trip.save();

    if (io) {
      io.to(tripId).emit('taskCreated', task);
    } else {
      console.error('Socket.io is not initialized');
    }

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
exports.assignTask = async (tripId, taskId, assignedTo) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const task = trip.tasks.id(taskId);
  if (!task) throw new Error('Task not found');

  // Validate assigned users
  const validUsers = trip.guests.concat(trip.collaborators, trip.organizer.toString());
  assignedTo.forEach((user) => {
    if (!validUsers.includes(user.toString())) {
      throw new Error(`User ${user} is not part of this trip`);
    }
  });

  task.assignedTo = assignedTo;
  await trip.save();
  io.to(tripId).emit('taskUpdated', task);

  return task;
};

// Delete a specific task
exports.deleteTask = async (req, res) => {
  const { tripId, taskId } = req.params;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Find the index of the task to delete
    const taskIndex = trip.tasks.findIndex((task) => task._id.toString() === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Remove the task from the array
    trip.tasks.splice(taskIndex, 1);

    // Save the updated trip document
    await trip.save();

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

