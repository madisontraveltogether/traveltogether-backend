const Trip = require('../models/tripModel');

// Create a new expense for a specific trip
exports.createExpense = async (tripId, { title, amount, payer }) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const expense = { title, amount, payer };
  trip.expenses.push(expense);
  await trip.save();

  return expense;
};

// Retrieve all expenses for a trip
exports.getExpenses = async (tripId) => {
  const trip = await Trip.findById(tripId).select('expenses');
  if (!trip) throw new Error('Trip not found');

  return trip.expenses;
};

// Delete an expense by ID
exports.deleteExpense = async (tripId, expenseId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const expense = trip.expenses.id(expenseId);
  if (!expense) throw new Error('Expense not found');

  expense.remove();
  await trip.save();

  return { message: 'Expense deleted successfully' };
};

// Calculate balances for all users in the trip
exports.getBalances = async (tripId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const balances = {};

  trip.expenses.forEach((expense) => {
    // Add amount to payer
    if (!balances[expense.payer]) balances[expense.payer] = 0;
    balances[expense.payer] += expense.amount;

    // Subtract equal shares from all guests
    const share = expense.amount / trip.guests.length;
    trip.guests.forEach((guest) => {
      if (!balances[guest._id]) balances[guest._id] = 0;
      balances[guest._id] -= share;
    });
  });

  return balances;
};
