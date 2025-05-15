const mongoose = require('mongoose');
const startImapConnection = require('./imapService');
const Email = require('./models/Email'); // Import the Email mongoose model
const categorizeEmail = require('./categorizeEmail'); // Import the categorizeEmail function

mongoose.connect('mongodb://localhost:27017/email_sync', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.once('open', () => {
  console.log('MongoDB connected.');
});

// Accounts array
const accounts = [
  {
    email: 'mahawarkhushi27@gmail.com',
    password: 'frcx qqwz ghhi cthx',
    host: 'imap.gmail.com',
    port: 993,
    tls: true
  },
  {
    email: 'wonderfully2weird@gmail.com',
    password: 'lgxx fdly qlgu uxkl',
    host: 'imap.gmail.com',
    port: 993,
    tls: true
  }
];

// Function to save email to MongoDB
const saveEmailToDatabase = (mail, label) => {
  const newEmail = new Email({
    from: mail.from.text,
    to: mail.to.text,
    subject: mail.subject,
    body: mail.text,
    category: label,
    date: mail.date
  });

  newEmail.save((err) => {
    if (err) {
      console.error('Error saving email:', err);
    } else {
      console.log('Email saved to MongoDB:', mail.subject);
    }
  });
};

// Start syncing all accounts
accounts.forEach((config) => {
  const imap = startImapConnection(config);

  imap.on('new-email', (mail) => {
    // Categorize the email
    const label = categorizeEmail(mail.subject || '', mail.text || '');
    
    // Log the subject and category
    console.log(`📩 [${config.email}] Subject: ${mail.subject}`);
    console.log(`📌 Category: ${label}`);
    
    // Save the categorized email to MongoDB
    saveEmailToDatabase(mail, label);
  });
});