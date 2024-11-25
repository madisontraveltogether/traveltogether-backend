const expenseService = require('../services/expenseService');
const Trip = require('../models/tripModel');
const mongoose = require('mongoose');

exports.createExpense = async (req, res) => {
  const { tripId } = req.params;
  const { title, amount, payer, splitType, splitWith, date, description, tags, currency } = req.body;

  try {
    // Validate required fields
    if (!title || !amount || !payer) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Validate payer and splitWith users
    const validUsers = trip.guests
      .concat(trip.collaborators)
      .concat(trip.organizer.toString());

    if (!validUsers.includes(payer)) {
      return res.status(400).json({ message: 'Payer is not part of this trip' });
    }

    if (splitWith && splitWith.length) {
      splitWith.forEach((user) => {
        if (!validUsers.includes(user.userId.toString())) {
          throw new Error(`User ${user.userId} is not part of this trip`);
        }
      });
    }

    // Default splitWith to all attendees who RSVP'd "yes"
    const defaultSplitWith = trip.guests
      .filter((guest) => guest.rsvpStatus === 'yes')
      .map((guest) => ({ userId: guest._id.toString(), amount: 0 }));

    // Perform split calculations
    let calculatedSplitWith = splitWith?.length
      ? splitWith
      : calculateEvenSplit(amount, defaultSplitWith);

    if (splitType) {
      switch (splitType) {
        case 'even':
          calculatedSplitWith = calculateEvenSplit(amount, splitWith || defaultSplitWith);
          break;
        case 'byAmount':
          validateTotalSplit(amount, splitWith);
          calculatedSplitWith = splitWith; // Already validated
          break;
        case 'byPercentage':
          calculatedSplitWith = calculatePercentageSplit(amount, splitWith || defaultSplitWith);
          break;
        case 'byShares':
          calculatedSplitWith = calculateShareSplit(amount, splitWith || defaultSplitWith);
          break;
        default:
          return res.status(400).json({ message: 'Invalid split type' });
      }
    }

    // Handle file attachments if provided
    let attachmentUrl = '';
    if (req.file) {
      attachmentUrl = req.file.location || `/uploads/${req.file.filename}`;
    }

    // Create the expense
    const expense = {
      title,
      amount,
      payer,
      splitType: splitType || 'self',
      splitWith: calculatedSplitWith,
      date: date || new Date(),
      description: description || '',
      tags: tags || [],
      currency: currency || 'USD',
      attachment: attachmentUrl || null,
    };

    // Add the expense to the trip
    trip.expenses.push(expense);
    await trip.save();

    // Notify relevant users
    io?.to(tripId).emit('expenseCreated', expense);

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

const { Parser } = require('json2csv');

exports.exportExpenses = async (req, res) => {
  const { tripId } = req.params;

  try {
    const expenses = await Expense.find({ tripId });

    const fields = ['title', 'amount', 'splitWith', 'date', 'description', 'tags', 'currency'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(expenses);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
    res.status(200).send(csv);
  } catch (err) {
    console.error('Error exporting expenses:', err);
    res.status(500).json({ error: 'Failed to export expenses.' });
  }
};

exports.searchItinerary = async (req, res) => {
  const { tripId } = req.params;
  const { query } = req.query;

  try {
    const itinerary = await Itinerary.find({
      tripId,
      $or: [
        { title: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
      ],
    });

    res.status(200).json(itinerary);
  } catch (err) {
    console.error('Error searching itinerary:', err);
    res.status(500).json({ error: 'Failed to search itinerary.' });
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
  const updateData = req.body;

  console.log('Update request received:', { tripId, expenseId, updateData });

  try {
    if (!mongoose.Types.ObjectId.isValid(tripId) || !mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({ message: 'Invalid trip ID or expense ID format' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const expense = trip.expenses.id(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    Object.keys(updateData).forEach((key) => {
      expense[key] = updateData[key];
    });

    await trip.save();

    console.log('Expense updated:', expense);

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

exports.getExpensesByTags = async (req, res) => {
  const { tripId } = req.params;
  const { tags } = req.query; // Expect tags to be comma-separated

  try {
    const expenses = await Expense.find({
      tripId,
      tags: { $in: tags.split(',') },
    });

    res.status(200).json(expenses);
  } catch (err) {
    console.error('Error filtering expenses by tags:', err);
    res.status(500).json({ error: 'Failed to filter expenses by tags.' });
  }
};

exports.batchDeleteExpenses = async (req, res) => {
  const { tripId } = req.params;
  const { expenseIds } = req.body; // Array of expense IDs to delete

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Filter out expenses that should not be deleted
    trip.expenses = trip.expenses.filter(expense => !expenseIds.includes(expense._id.toString()));

    await trip.save();

    res.status(200).json({ message: "Expenses deleted successfully", remainingExpenses: trip.expenses });
  } catch (error) {
    console.error("Error in batchDeleteExpenses:", error);
    res.status(500).json({ message: "Failed to delete expenses", error: error.message });
  }
};

exports.filterExpenses = async (req, res) => {
  const { tripId } = req.params;
  const { minAmount, maxAmount, type, date } = req.query;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    let filteredExpenses = trip.expenses;

    // Apply filters
    if (minAmount) {
      filteredExpenses = filteredExpenses.filter(expense => expense.amount >= parseFloat(minAmount));
    }
    if (maxAmount) {
      filteredExpenses = filteredExpenses.filter(expense => expense.amount <= parseFloat(maxAmount));
    }
    if (type) {
      filteredExpenses = filteredExpenses.filter(expense => expense.type === type);
    }
    if (date) {
      const targetDate = new Date(date).toISOString().split("T")[0];
      filteredExpenses = filteredExpenses.filter(
        expense => new Date(expense.date).toISOString().split("T")[0] === targetDate
      );
    }

    res.status(200).json(filteredExpenses);
  } catch (error) {
    console.error("Error filtering expenses:", error);
    res.status(500).json({ message: "Failed to filter expenses", error: error.message });
  }
};
