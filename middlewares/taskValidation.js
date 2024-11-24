const { check, validationResult } = require('express-validator');

exports.validateTask = [
  check('title').notEmpty().withMessage('Title is required'),
  check('dueDate').optional().isISO8601().toDate().withMessage('Invalid date format'),
  check('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority level'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];