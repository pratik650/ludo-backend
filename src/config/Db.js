require('dotenv').config(); // Make sure to require dotenv at the top

const mongoose = require('mongoose');

exports.connect = () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('MongoDB connection string is not defined in .env file');
    process.exit(1); // Exit the process with an error code
  }

  // Connect to MongoDB without the deprecated options
  mongoose.connect(mongoURI).then(() => {
    console.log('Successfully connected to MongoDB');
  }).catch(error => {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  });

  // The connection object
  const db = mongoose.connection;

  // Error event listener
  db.on('error', (error) => {
    console.error('Connection error:', error.message);
    process.exit(1);
  });

  // Open event listener
  db.once('open', () => {
    console.log('MongoDB connection is open');
  });
};
