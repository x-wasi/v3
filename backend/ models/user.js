const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  categories: [{
    id: Number,
    name: String,
    color: String
  }],
  recurringExpenses: [{
    id: Number,
    name: String,
    amount: Number,
    description: String,
    frequency: String,
    categoryId: Number,
    lastAdded: String
  }],
  budget: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
