const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    // match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  Phonenumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  eligible: {
    type: Boolean,
    required: [true, 'Eligibility status is required']
  },
  available: {
    type: Boolean,
    required: [true, 'Availability status is required']
  }
}, {
  timestamps: true
});


const Driver = mongoose.model('User', userSchema);

module.exports = Driver;
