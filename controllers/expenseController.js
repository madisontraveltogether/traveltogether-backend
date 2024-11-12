const expenseService = require('../services/expenseService');
const Trip = require('../models/tripModel');
const mongoose = require('mongoose');


exports.createExpense = async (req, res) => {
  const { tripId } = req.params;
  const { title, amount, payer, splitType, splitWith, date, time, description } = req.body;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const expense = {
      title,
      amount,
      payer,
      splitType,
      splitWith,
      date,
      time,
      description,
    };

    // Add the expense to the trip
    trip.expenses.push(expense);
    await trip.save();

    console.log("Trip after saving expense:", trip); // Log the trip with expenses
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Helper function to calculate even split
const calculateEvenSplit = (amount, splitWith) => {
  const numParticipants = splitWith.length;
  if (numParticipants === 0) return []; // Return empty if no participants

  const individualShare = Math.floor((amount / numParticipants) * 100) / 100;
  const remainder = amount - individualShare * numParticipants;

  return splitWith.map((entry, index) => ({
    ...entry,
    amount: index === numParticipants - 1 ? individualShare + remainder : individualShare,
  }));
};

// Helper function to validate total split by amount
const validateTotalSplit = (amount, splitWith) => {
  const totalSplitAmount = splitWith.reduce((acc, entry) => acc + entry.amount, 0);
  if (totalSplitAmount !== amount) throw new Error("Split amounts do not add up to the total expense amount");
};

// Helper function to calculate split by percentage
const calculatePercentageSplit = (amount, splitWith) => {
  const totalPercentage = splitWith.reduce((acc, entry) => acc + (entry.percentage || 0), 0);
  if (totalPercentage !== 100) throw new Error("Total percentage must equal 100%");

  return splitWith.map(entry => ({
    ...entry,
    amount: Math.floor(amount * (entry.percentage / 100) * 100) / 100,
  }));
};

// Helper function to calculate split by shares
const calculateShareSplit = (amount, splitWith) => {
  const totalShares = splitWith.reduce((acc, entry) => acc + (entry.shares || 0), 0);
  if (totalShares === 0) throw new Error("Total shares cannot be zero");

  return splitWith.map(entry => ({
    ...entry,
    amount: Math.floor((amount * (entry.shares / totalShares)) * 100) / 100,
  }));
};


// Get all expenses for a specific trip
exports.getExpenses = async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId).select('expenses');
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.status(200).json(trip.expenses); // Return expenses directly
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific expense by ID
exports.getExpenseById = async (req, res) => {
  const { tripId, expenseId } = req.params;

  try {
    const expense = await expenseService.getExpenseById(tripId, expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an existing expense
exports.updateExpense = async (req, res) => {
  const { tripId, expenseId } = req.params;
  const updates = req.body;

  try {
    const updatedExpense = await expenseService.updateExpense(tripId, expenseId, updates);
    if (!updatedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  const { tripId, expenseId } = req.params;

  try {
    const result = await expenseService.deleteExpense(tripId, expenseId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in deleteExpense controller:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};