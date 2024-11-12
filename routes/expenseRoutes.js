const express = require('express');
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true }); // Allows merging URL parameters from parent routes

// Create a new expense
router.post('/', authMiddleware, expenseController.createExpense);

// Route to get all expenses for a specific trip
router.get('/', authMiddleware, expenseController.getExpenses);

// Get a specific expense by ID
router.get('/:expenseId', authMiddleware, expenseController.getExpenseById);

// Update an existing expense by ID
router.put('/:expenseId', authMiddleware, expenseController.updateExpense);

// Delete an expense by ID
router.delete('/:expenseId', authMiddleware, expenseController.deleteExpense);

module.exports = router;
