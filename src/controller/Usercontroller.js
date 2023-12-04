const User = require('../models/User');
const Transaction = require('../models/Transaction');
const otpStorage = {}; 
const bcrypt = require('bcrypt');

const otpGenerator = require('otp-generator');
const twilio = require('twilio');

const accountSid = 'AC1ddef5ef335af5034c0fba9830bdea4b';
const authToken = 'c4eb9efcec3516d5731a4e8215f6d93a';

const client = new twilio(accountSid, authToken);

exports.registerUser = async (req, res) => {
    const { fullName, Phonenumber } = req.body;

    if (!fullName || !Phonenumber) {
        return res.status(400).json({ message: 'Name and contact number are required' });
    }

    const otp = otpGenerator.generate(4, { digits: true, upperCase: false, specialChars: false, alphabets: false });

    otpStorage[Phonenumber] = { otp, timestamp: Date.now() };
    
    try {
        const newUser = new User({
            fullName,
            Phonenumber,
            // Add other fields if needed
        });

        await newUser.save();
    } catch (error) {
        console.error('Error saving user to the database:', error);
        return res.status(500).json({ message: 'Error saving user to the database', error: error.message });
    }

    try {
        await client.messages.create({
            body: `Your OTP is: ${otp}`,
            from: '+12489234283',
            to: Phonenumber,
        });

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    const { Phonenumber, enteredOTP } = req.body;

    // Basic validation
    if (!Phonenumber || !enteredOTP) {
        return res.status(400).json({ message: 'Contact number and OTP are required' });
    }

    // Check if OTP exists in the in-memory store
    const storedOTPData = otpStorage[Phonenumber];

    if (!storedOTPData) {
        return res.status(404).json({ message: 'OTP not found' });
    }

    // Verify if the entered OTP matches the stored OTP
    if (enteredOTP !== storedOTPData.otp) {
        return res.status(400).json({ message: 'Incorrect OTP' });
    }

    // Verify if the OTP is still valid (within a certain time window, e.g., 30 seconds)
    const otpTimestamp = storedOTPData.timestamp;
    const currentTimestamp = Date.now();
    const otpValidityDuration = 60000; // 30 seconds

    if (currentTimestamp - otpTimestamp > otpValidityDuration) {
        return res.status(400).json({ message: 'OTP has expired' });
    }

    // Clear the used OTP from the in-memory store
    delete otpStorage[Phonenumber];

    res.status(200).json({ message: 'OTP verified successfully' });
};


exports.userLogin = async (req, res) => {
    const { Phonenumber } = req.body;

    try {
        const user = await User.findOne({ Phonenumber }).exec();

        if (!user) {
            return res.status(401).json({ message: 'Phone number not found, please try again or register.' });
        }

        // Generate and store a new OTP
        const newOTP = otpGenerator.generate(4, { digits: true, upperCase: false, specialChars: false, alphabets: false });
        otpStorage[Phonenumber] = { otp: newOTP, timestamp: Date.now() };

        // Send the new OTP to the user's contact number
        try {
            await client.messages.create({
                body: `Your new OTP is: ${newOTP}`,
                from: '+12489234283', // Use the user's phone number dynamically
                to: Phonenumber,
            });

            res.json({
                message: 'Phone number found. New OTP sent successfully.',
                // You can include additional information if needed
            });
        } catch (error) {
            console.error('Error sending new OTP:', error);
            res.status(500).json({ message: 'Error sending new OTP', error: error.message });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error occurred.', error: error.message });
    }
};


exports.getUserProfile = async (req, res) => {
    const { Phonenumber }  = req.params; // Assuming you're using Phonenumber as the identifier
    try {
        const driver = await User.findOne({ Phonenumber }).exec();
        if (!driver) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const profileData = {
            fullName: driver.fullName,
            phoneNumber: driver.Phonenumber
        };
        res.json({
            message: 'Profile fetched successfully.',
            profile: profileData,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error occurred.', error: error.message });
    }
};

exports.Transactionupdate = async (req, res) => {
    const { userId, amount } = req.body;

    try {
        const user = await User.findById(userId).exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.balance += amount;
        await user.save();

        // Record the transaction
        const transaction = new Transaction({
            userId: userId,
            amount: amount,
            transactionType: 'add',
        });

        await transaction.save();

        res.json({ message: 'Money added successfully', newBalance: user.balance });
    } catch (error) {
        console.error('Error adding money:', error);
        res.status(500).json({ message: 'Error adding money', error: error.message });
    }
};


exports.updateMoney = async (req, res) => {
    const { userId, amount, transactionType } = req.body;

    try {
        // Check if the user exists
        const user = await User.findById(userId).exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user's balance based on the transaction type
        if (transactionType === 'add') {
            user.balance += amount;
        } else if (transactionType === 'withdraw') {
            user.balance -= amount;
        } else {
            return res.status(400).json({ message: 'Invalid transaction type' });
        }

        await user.save();

        // Update the latest transaction for the user
        const latestTransaction = await Transaction.findOneAndUpdate(
            { userId, transactionType },
            { $inc: { amount } },
            { new: true }
        );

        if (!latestTransaction) {
            // If no previous transaction of the same type exists, create a new one
            const newTransaction = new Transaction({
                userId: userId,
                amount: amount,
                transactionType: transactionType,
            });

            await newTransaction.save();
        }

        res.json({ message: 'Money updated successfully', newBalance: user.balance });
    } catch (error) {
        console.error('Error updating money:', error);
        res.status(500).json({ message: 'Error updating money', error: error.message });
    }
};


exports.userDetails = async (req, res) => {
    try {
        const User = await Driver.find({}).exec(); // Fetch all User
        if (!User || User.length === 0) {
            return res.status(404).json({ success: false, message: 'No User found.'});
        }

        res.json({
            success: true,
            message: 'Users fetched successfully.',
            data: User
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error occurred.', error: error.message });
    }
};


