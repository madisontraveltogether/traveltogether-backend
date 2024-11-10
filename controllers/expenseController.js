const expenseService = require('../services/expenseService');
const Trip = require('../models/tripModel');

// Create a new expense for a specific trip
exports.createExpense = async (req, res) => {
  const { tripId } = req.params;
  const { title, amount, payer, splitType, splitWith, date, time, description } = req.body;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const expense = await expenseService.createExpense(tripId, {
      title,
      amount,
      payer,
      splitType,
      splitWith,
      date,
      time,
      description
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all expenses for a specific trip
exports.getExpenses = async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const expenses = await expenseService.getExpenses(tripId);
    res.status(200).json(expenses);
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
    const deletedExpense = await expenseService.deleteExpense(tripId, expenseId);
    if (!deletedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
