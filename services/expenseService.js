const Trip = require('../models/tripModel');

exports.createExpense = async (tripId, { title, amount, payer, splitType, splitWith }) => {

  const trip = await Trip.findById(tripId)
  .populate('expenses.payer', 'name')
  .populate('expenses.splitWith.user', 'name'); // Only populate the 'name' field
  if (!trip) throw new Error('Trip not found');

  // Perform split calculations based on splitType
  switch (splitType) {
    case 'even':
      splitWith = calculateEvenSplit(amount, splitWith);
      break;
    case 'byAmount':
      validateTotalSplit(amount, splitWith);
      break;
    case 'byPercentage':
      splitWith = calculatePercentageSplit(amount, splitWith);
      break;
    case 'byShares':
      splitWith = calculateShareSplit(amount, splitWith);
      break;
    default:
      throw new Error('Invalid split type');
  }

  const expense = { title, amount, payer, splitType, splitWith };
  trip.expenses.push(expense);
  await trip.save();

  return expense;
};

// Retrieve all expenses for a specific trip
exports.getExpenses = async (tripId) => {
  const trip = await Trip.findById(tripId).populate('expenses.splitWith.user');
  if (!trip) throw new Error('Trip not found');
  return trip.expenses;
};

// Retrieve a specific expense by ID
exports.getExpenseById = async (tripId, expenseId) => {
  const trip = await Trip.findById(tripId).populate('expenses.splitWith.user');
  if (!trip) throw new Error('Trip not found');

  const expense = trip.expenses.id(expenseId);
  if (!expense) throw new Error('Expense not found');

  return expense;
};

// Update an existing expense by ID
exports.updateExpense = async (tripId, expenseId, updateData) => {
  const trip = await Trip.findById(tripId)
  .populate('expenses.payer', 'name')
  .populate('expenses.splitWith.user', 'name'); // Only populate the 'name' field
  if (!trip) throw new Error('Trip not found');

  const expense = trip.expenses.id(expenseId);
  if (!expense) throw new Error('Expense not found');

  // Update fields if provided
  if (updateData.title) expense.title = updateData.title;
  if (updateData.amount) expense.amount = updateData.amount;
  if (updateData.payer) expense.payer = updateData.payer;

  if (updateData.splitType && updateData.splitWith) {
    expense.splitType = updateData.splitType;
    expense.splitWith = calculateSplit(updateData.amount || expense.amount, updateData.splitType, updateData.splitWith);
  }

  await trip.save();
  return expense;
};

// Delete an expense by ID
exports.deleteExpense = async (tripId, expenseId) => {
  try {
    console.log("Received tripId:", tripId);
    console.log("Received expenseId:", expenseId);

    const trip = await Trip.findById(tripId)
    .populate('expenses.payer', 'name')
    .populate('expenses.splitWith.user', 'name'); // Only populate the 'name' field

    if (!trip) {
      console.error("Trip not found");
      throw new Error('Trip not found');
    }

    const initialLength = trip.expenses.length;

    // Attempt to filter out the specific expense
    trip.expenses = trip.expenses.filter(exp => exp._id.toString() !== expenseId.toString());
    if (trip.expenses.length === initialLength) {
      console.error("Expense not found");
      throw new Error('Expense not found');
    }

    // Save the modified trip document
    await trip.save();
    console.log("Expense deleted successfully");

    return { message: 'Expense deleted successfully' };
  } catch (error) {
    console.error("Error deleting expense:", error.message);
    throw new Error(error.message);
  }
};

// Helper function to calculate split based on split type
const calculateSplit = (amount, splitType, splitWith) => {
  switch (splitType) {
    case 'even':
      return calculateEvenSplit(amount, splitWith);
    case 'byAmount':
      validateTotalSplit(amount, splitWith);
      return splitWith;
    case 'byPercentage':
      return calculatePercentageSplit(amount, splitWith);
    case 'byShares':
      return calculateShareSplit(amount, splitWith);
    default:
      throw new Error('Invalid split type');
  }
};

// Helper functions for split calculations
const calculateEvenSplit = (amount, splitWith) => {
  const numParticipants = splitWith.length;
  const individualShare = Math.floor((amount / numParticipants) * 100) / 100;
  const remainder = amount - individualShare * numParticipants;

  return splitWith.map((entry, index) => ({
    ...entry,
    amount: index === numParticipants - 1 ? individualShare + remainder : individualShare
  }));
};

const validateTotalSplit = (amount, splitWith) => {
  const totalSplitAmount = splitWith.reduce((acc, entry) => acc + entry.amount, 0);
  if (totalSplitAmount !== amount) throw new Error("Split amounts do not add up to the total expense amount");
};

const calculatePercentageSplit = (amount, splitWith) => {
  const totalPercentage = splitWith.reduce((acc, entry) => acc + entry.percentage, 0);
  if (totalPercentage !== 100) throw new Error("Total percentage must equal 100%");
  
  return splitWith.map(entry => ({
    ...entry,
    amount: Math.floor(amount * (entry.percentage / 100) * 100) / 100
  }));
};

const calculateShareSplit = (amount, splitWith) => {
  const totalShares = splitWith.reduce((acc, entry) => acc + entry.shares, 0);
  
  return splitWith.map(entry => ({
    ...entry,
    amount: Math.floor((amount * (entry.shares / totalShares)) * 100) / 100
  }));
};
