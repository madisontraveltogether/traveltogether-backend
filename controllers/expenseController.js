const expenseService = require('../services/expenseService');
const Trip = require('../models/tripModel');
const mongoose = require('mongoose');

exports.createExpense = async (req, res) => {
  const { tripId } = req.params;
  const { title, amount, payer, splitType, splitWith, date, description } = req.body;

  try {
    // Validate required fields
    if (!title || !amount || !payer) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Perform split calculations if splitType and splitWith are provided
    let calculatedSplitWith = [];
    if (splitType && splitWith) {
      switch (splitType) {
        case 'even':
          calculatedSplitWith = calculateEvenSplit(amount, splitWith);
          break;
        case 'byAmount':
          validateTotalSplit(amount, splitWith);
          calculatedSplitWith = splitWith; // Already validated
          break;
        case 'byPercentage':
          calculatedSplitWith = calculatePercentageSplit(amount, splitWith);
          break;
        case 'byShares':
          calculatedSplitWith = calculateShareSplit(amount, splitWith);
          break;
        default:
          return res.status(400).json({ message: 'Invalid split type' });
      }
    } else {
      // If no splitType or splitWith, the payer takes on the full expense
      calculatedSplitWith = [{ userId: payer, amount }];
    }

    // Create the expense
    const expense = {
      title,
      amount,
      payer,
      splitType: splitType || 'self', // Default to 'self' when no split
      splitWith: calculatedSplitWith,
      date: date || new Date(), // Default to current date
      description: description || '', // Default to empty description
    };

    // Add the expense to the trip
    trip.expenses.push(expense);
    await trip.save();

    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getExpenses = async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId).select('expenses');
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.status(200).json(trip.expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getExpenseById = async (req, res) => {
  const { tripId, expenseId } = req.params;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const expense = trip.expenses.id(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getBalances = async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId).populate('expenses.payer expenses.splitWith.user guests.user', 'name');
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Calculate balances
    const balances = {};
    const summary = [];

    trip.expenses.forEach((expense) => {
      const payerId = expense.payer.toString();
      if (!balances[payerId]) balances[payerId] = 0;
      balances[payerId] += expense.amount;

      expense.splitWith.forEach((split) => {
        const userId = split.user.toString();
        if (!balances[userId]) balances[userId] = 0;
        balances[userId] -= split.amount;

        // Add to summary for "who owes whom"
        if (userId !== payerId) {
          summary.push({
            from: split.user.name,
            to: expense.payer.name,
            amount: split.amount,
          });
        }
      });
    });

    // Convert balances to an array with user details
    const balanceArray = await Promise.all(
      Object.entries(balances).map(async ([userId, amount]) => {
        const user = await User.findById(userId).select('name');
        return { user, amount };
      })
    );

    res.status(200).json({ balances: balanceArray, summary });
  } catch (error) {
    console.error('Error fetching balances:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const { parse } = require('json2csv');

exports.exportBalances = async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId).populate('expenses.payer expenses.splitWith.user guests.user', 'name');
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Calculate balances
    const balances = {};
    trip.expenses.forEach((expense) => {
      const payerId = expense.payer.toString();
      if (!balances[payerId]) balances[payerId] = 0;
      balances[payerId] += expense.amount;

      expense.splitWith.forEach((split) => {
        const userId = split.user.toString();
        if (!balances[userId]) balances[userId] = 0;
        balances[userId] -= split.amount;
      });
    });

    const balanceArray = await Promise.all(
      Object.entries(balances).map(async ([userId, amount]) => {
        const user = await User.findById(userId).select('name');
        return { name: user.name, balance: amount };
      })
    );

    const csv = parse(balanceArray);
    res.header('Content-Type', 'text/csv');
    res.attachment('trip_balances.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting balances:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  const { tripId, expenseId } = req.params;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const expense = trip.expenses.id(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Remove the expense
    expense.remove();
    await trip.save();

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  const { tripId, expenseId } = req.params;
  const { title, amount, payer, splitType, splitWith, date, description } = req.body;

  try {
    // Validate required fields
    if (!title || !amount || !payer || !splitType || !splitWith) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const expense = trip.expenses.id(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Update expense details
    expense.title = title;
    expense.amount = amount;
    expense.payer = payer;
    expense.splitType = splitType;
    expense.splitWith = splitWith;
    expense.date = date || expense.date;
    expense.description = description || expense.description;

    await trip.save();

    res.status(200).json({ message: 'Expense updated successfully', expense });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.addComment = async (req, res) => {
  const { tripId, expenseId } = req.params;
  const { content } = req.body;
  const userId = req.user.userId;

  if (!content) return res.status(400).json({ message: 'Comment content is required' });

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const expense = trip.expenses.id(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const comment = { user: userId, content };
    expense.comments.push(comment);
    await trip.save();

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getComments = async (req, res) => {
  const { tripId, expenseId } = req.params;

  try {
    const trip = await Trip.findById(tripId).populate('expenses.comments.user', 'name');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const expense = trip.expenses.id(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    res.status(200).json(expense.comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  const { tripId, expenseId, commentId } = req.params;
  const userId = req.user.userId;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const expense = trip.expenses.id(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const comment = expense.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (!comment.user.equals(userId)) {
      return res.status(403).json({ message: 'You are not authorized to delete this comment' });
    }

    comment.remove();
    await trip.save();

    res.status(200).json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
