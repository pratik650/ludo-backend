const Admin = require('../models/Admin'); 
const bcrypt = require('bcrypt');

exports.adminLogin = async (req, res) => {
    const {username,password} = req.body;
    try {console.log("error")
        const admin = await Admin.findOne({username}).exec();
        if (!admin) {
            return res.status(401).json({ message: 'Admin not found, please try again.' });
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials for password, please try again.' });
        }
        res.json({
            message: 'Login successful.',
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error occurred.', error: error.message });
    }
};