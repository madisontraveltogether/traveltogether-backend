const Trip = require('../models/tripModel');
const TripService = require('./tripService.js');
const io = require('../socket');

// Create a new task for a specific trip
exports.createTask = async (tripId, { title, description, assignedTo, dueDate, priority, isRecurring }) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }

  const task = { title, description, assignedTo, dueDate, priority, isRecurring };
  trip.tasks.push(task);
  await trip.save();

  const progress = await TripService.calculateTripProgress(tripId);
  io.to(tripId).emit('tripProgressUpdated', progress);

   return task;
 };

// Retrieve all tasks for a specific trip
exports.getTasks = async (tripId) => {
  const trip = await Trip.findById(tripId).populate('tasks.assignedTo');
  if (!trip) {
    throw new Error('Trip not found');
  }
  return trip.tasks;
};

// Retrieve a specific task by ID
exports.getTaskDetails = async (tripId, taskId) => {
  const trip = await Trip.findById(tripId).populate('tasks.assignedTo');
  if (!trip) {
    throw new Error('Trip not found');
  }

  const task = trip.tasks.id(taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  return task;
};

// Update task details by ID
exports.updateTask = async (tripId, taskId, updateData) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }

  const task = trip.tasks.id(taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  // Update task fields if they are provided in updateData
  if (updateData.title) task.title = updateData.title;
  if (updateData.description) task.description = updateData.description;
  if (updateData.dueDate) task.dueDate = updateData.dueDate;
  if (updateData.priority) task.priority = updateData.priority;
  if (typeof updateData.isRecurring !== 'undefined') task.isRecurring = updateData.isRecurring;

  await trip.save();

  return task;
};

// Update task status
exports.updateTaskStatus = async (tripId, taskId, status) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }

  const task = trip.tasks.id(taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  task.status = status;
  await trip.save();

  const progress = await TripService.calculateTripProgress(tripId);
  io.to(tripId).emit('tripProgressUpdated', progress);


  return task;
};

// Assign users to a task
exports.assignTask = async (tripId, taskId, assignedTo) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }

  const task = trip.tasks.id(taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  task.assignedTo = assignedTo;
  await trip.save();

  return task;
};

// Delete a specific task by ID
exports.deleteTask = async (tripId, taskId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }

  const task = trip.tasks.id(taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  task.remove();
  await trip.save();

  return task;
};
