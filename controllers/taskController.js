// taskService.js
const Trip = require('../models/tripModel');
const taskService = require('../services/taskService');

exports.createTask = async (tripId, taskData) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const task = {
    title: taskData.title,
    description: taskData.description,
    assignedTo: taskData.assignedTo || [],
    dueDate: taskData.dueDate,
    priority: taskData.priority || 'Medium',
    isRecurring: taskData.isRecurring || false,
    status: 'Pending',
    createdAt: new Date(),
  };

  trip.tasks.push(task);
  await trip.save();

  return task;
};

exports.getTasks = async (tripId) => {
  const trip = await Trip.findById(tripId);
  return trip ? trip.tasks : [];
};

exports.getTaskDetails = async (tripId, taskId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const task = trip.tasks.id(taskId);
  if (!task) throw new Error('Task not found');

  return task;
};

exports.updateTaskStatus = async (tripId, taskId, status) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const task = trip.tasks.id(taskId);
  if (!task) throw new Error('Task not found');

  task.status = status;
  await trip.save();

  return task;
};

exports.assignTask = async (tripId, taskId, assignedTo) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const task = trip.tasks.id(taskId);
  if (!task) throw new Error('Task not found');

  task.assignedTo = assignedTo;
  await trip.save();

  return task;
};

exports.deleteTask = async (tripId, taskId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const task = trip.tasks.id(taskId);
  if (!task) throw new Error('Task not found');

  task.remove();
  await trip.save();

  return task;
};

exports.updateTask = async (req, res) => {
  const { tripId, taskId } = req.params;
  const updates = req.body;

  try {
    const updatedTask = await taskService.updateTask(tripId, taskId, updates);
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

