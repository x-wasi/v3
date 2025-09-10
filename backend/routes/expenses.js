const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Expense = require('../models/Expense');

const router = express.Router();

// @route   GET api/expenses
// @desc    Get all expenses for a user
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/expenses
// @desc    Add a new expense
router.post('/', auth, async (req, res) => {
  const { type, amount, description, date, categoryId } = req.body;
  
  try {
    const newExpense = new Expense({
      user: req.user.id,
      type,
      amount,
      description,
      date,
      categoryId
    });
    
    const expense = await newExpense.save();
    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/expenses/:id
// @desc    Update an expense
router.put('/:id', auth, async (req, res) => {
  const { type, amount, description, date, categoryId } = req.body;
  
  try {
    let expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found' });
    }
    
    // Make sure user owns the expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { $set: { type, amount, description, date, categoryId } },
      { new: true }
    );
    
    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/expenses/:id
// @desc    Delete an expense
router.delete('/:id', auth, async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found' });
    }
    
    // Make sure user owns the expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    await Expense.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Expense removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/expenses/user
// @desc    Get user data (categories, recurring expenses, budget)
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/expenses/user
// @desc    Update user data (categories, recurring expenses, budget)
router.put('/user', auth, async (req, res) => {
  const { categories, recurringExpenses, budget } = req.body;
  
  try {
    let user = await User.findById(req.user.id);
    
    if (categories) user.categories = categories;
    if (recurringExpenses) user.recurringExpenses = recurringExpenses;
    if (budget !== undefined) user.budget = budget;
    
    await user.save();
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
