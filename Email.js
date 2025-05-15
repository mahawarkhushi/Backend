const mongoose = require('mongoose');

// Email schema with categorization field
const emailSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  from: { type: String, required: true },
  date: { type: Date, required: true },
  body: { type: String, required: true },
  account: { type: String, required: true }, // The account from which the email was received
  category: { type: String, enum: ['Interested', 'Meeting Booked', 'Not Interested', 'Spam', 'Out of Office'], required: true } // Categorized label
});

// Create and export Email model
const Email = mongoose.model('Email', emailSchema);

module.exports = Email;  