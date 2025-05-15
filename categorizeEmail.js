const natural = require('natural');  // This should import the `natural` module correctly
const classifier = new natural.BayesClassifier();


// Pre-train the classifier with basic examples
const trainClassifier = () => {
  classifier.addDocument('I am interested in your product', 'Interested');
  classifier.addDocument('Looking forward to meeting you', 'Meeting Booked');
  classifier.addDocument('Not interested, thank you', 'Not Interested');
  classifier.addDocument('This is a spam message', 'Spam');
  classifier.addDocument('I am out of office until next week', 'Out of Office');
  classifier.train();
};

// Train the classifier
trainClassifier();

// Function to categorize the email based on subject and body
const categorizeEmail = (subject, body) => {
  const text = `${subject} ${body}`;
  return classifier.classify(text);
};

module.exports = categorizeEmail;