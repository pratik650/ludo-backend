const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    Phonenumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
    },
    otp: {
        type: String, // Add an OTP field to store the generated OTP
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
