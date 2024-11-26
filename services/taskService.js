const Trip = require('../models/tripModel');

// Create a new task for a specific trip
exports.createTask = async (tripId, taskData) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const task = {
    title: taskData.title,
    description: taskData.description,
    assignedTo: taskData.assignedTo,
    dueDate: taskData.dueDate,
    priority: taskData.priority,
    isRecurring: taskData.isRecurring || false,
    status: 'pending', // Default status
  };

  trip.tasks.push(task);
  await trip.save();

  return task;
};

// Get all tasks for a specific trip
exports.getTasks = async (tripId) => {
  const trip = await Trip.findById(tripId).populate('tasks.assignedTo');
  if (!trip) throw new Error('Trip not found');

  return trip.tasks;
};

// Get details of a specific task
exports.getTaskDetails = async (tripId, taskId) => {
  const trip = await Trip.findById(tripId).populate('tasks.assignedTo');
  if (!trip) throw new Error('Trip not found');

  const task = trip.tasks.id(taskId);
  if (!task) throw new Error('Task not found');

  return task;
};

// Update a task by ID
exports.updateTask = async (tripId, taskId, updates) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const task = trip.tasks.id(taskId);
  if (!task) throw new Error('Task not found');

  Object.assign(task, updates); // Apply updates to the task
  await trip.save();

  return task;
};

// Delete a specific task by ID
exports.deleteTask = async (tripId, taskId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const task = trip.tasks.id(taskId);
  if (!task) throw new Error('Task not found');

  task.remove(); // Remove the task
  await trip.save();

  return task;
};