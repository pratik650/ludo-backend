// driverRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controller/Admincontroller');


// Assuming driverController has a function named 'registerDriver'

router.post('/login', adminController.adminLogin);

module.exports = router;