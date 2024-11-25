// controllers/taskController.js
const taskService = require('../services/taskService');
const Trip = require('../models/tripModel');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


let io;
exports.initialize = (socketIo) => {
  io = socketIo;
};


// Create a new task for a specific trip
exports.createTask = async (req, res) => {
  const { tripId } = req.params;
  const { title, description, assignedTo, dueDate, priority, isRecurring } = req.body;
  const attachment = req.file;

  try {
    const task = { title, description, assignedTo, dueDate, priority, isRecurring, attachment: attachment?.path };
    trip.tasks.push(task);
    await trip.save();

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all tasks for a specific trip
exports.getTasks = async (req, res) => {
  const { tripId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const tasks = await taskService.getTasksPaginated(tripId, page, limit);
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTasksPaginated = async (tripId, page, limit) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const tasks = trip.tasks.slice((page - 1) * limit, page * limit);
  return { tasks, total: trip.tasks.length };
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

exports.addTaskComment = async (req, res) => {
  const { tripId, taskId } = req.params;
  const { userId, content } = req.body;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const task = trip.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = { userId, content, createdAt: new Date() };
    task.comments.push(comment);
    await trip.save();

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding task comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTaskComments = async (req, res) => {
  const { tripId, taskId } = req.params;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const task = trip.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.status(200).json(task.comments);
  } catch (error) {
    console.error('Error retrieving task comments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Update task status
exports.updateTaskStatus = async (req, res) => {
  const { tripId, taskId } = req.params;
  const { status } = req.body;

  try {
    const updatedTask = await taskService.updateTaskStatus(tripId, taskId, status);

    // Notify assigned users about the status change
    const task = await taskService.getTaskDetails(tripId, taskId);
    if (io) {
      task.assignedTo.forEach((userId) => {
        io.to(userId).emit("taskUpdated", { taskId, status });
      });
    }

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

// Get trip progress
exports.getTripProgress = async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const totalTasks = trip.tasks.length;
    const completedTasks = trip.tasks.filter(task => task.status === 'completed').length;

    const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

    res.status(200).json({ progress: Math.round(progress), totalTasks, completedTasks });
  } catch (error) {
    console.error('Error calculating trip progress:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.checkUpcomingTasks = async () => {
  const now = new Date();
  const upcomingTasks = await Trip.aggregate([
    { $unwind: '$tasks' },
    { $match: { 'tasks.dueDate': { $gte: now, $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) } } },
    { $project: { task: '$tasks', tripId: '$_id' } },
  ]);

  // Send in-app notifications to assigned users
  for (const taskData of upcomingTasks) {
    const { task, tripId } = taskData;
    const trip = await Trip.findById(tripId);

    const assignedUsers = trip.guests
      .filter((user) => task.assignedTo.includes(user.id))
      .map((user) => user.id);

    assignedUsers.forEach((userId) => {
      // Emit notifications via Socket.IO or save in DB
      io.to(userId).emit('upcomingTask', {
        taskId: task._id,
        title: task.title,
        dueDate: task.dueDate,
      });
    });
  }
};

exports.batchDeleteTasks = async (req, res) => {
  const { tripId } = req.params;
  const { taskIds } = req.body; // Array of task IDs to delete

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Filter out tasks that should not be deleted
    trip.tasks = trip.tasks.filter(task => !taskIds.includes(task._id.toString()));

    await trip.save();

    res.status(200).json({ message: "Tasks deleted successfully", remainingTasks: trip.tasks });
  } catch (error) {
    console.error("Error in batchDeleteTasks:", error);
    res.status(500).json({ message: "Failed to delete tasks", error: error.message });
  }
};
