const expenseService = require('../services/expenseService');

// Create a new expense
exports.createExpense = async (req, res) => {
  const { tripId } = req.params;
  const { title, amount, payer } = req.body;

  try {
    if (!title || !amount || !payer) {
      return res.status(400).json({ message: 'Title, amount, and payer are required' });
    }

    const expense = await expenseService.createExpense(tripId, { title, amount, payer });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create expense', error: error.message });
  }
};

// Get all expenses for a trip
exports.getExpenses = async (req, res) => {
  const { tripId } = req.params;

  try {
    const expenses = await expenseService.getExpenses(tripId);
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch expenses', error: error.message });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  const { tripId, expenseId } = req.params;

  try {
    const response = await expenseService.deleteExpense(tripId, expenseId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete expense', error: error.message });
  }
};

// Get balances for a trip
exports.getBalances = async (req, res) => {
  const { tripId } = req.params;

  try {
    const balances = await expenseService.getBalances(tripId);
    res.status(200).json(balances);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch balances', error: error.message });
  }
};
