require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const dbConfig = require('./src/config/Db');
const cors = require('cors');
const path = require("path");

const app = express();
dbConfig.connect();


// Enable CORS
app.use(cors()); // Corrected the usage of cors

// Middlewares
app.use(express.json()); 
 
app.use('/images', express.static('src/upload/'));

// Enable CORS
app.use(cors()); // Corrected the usage of cors

// Middlewares
app.use(express.json()); // Ensure this is before your routes
 
// Import routes
const userRoutes = require('./src/routes/Userroute');
app.use('/api/users', userRoutes);

const adminRoutes = require('./src/routes/Adminroute');
app.use('/api/admin', adminRoutes);

app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/', (req, res) => res.json("hello")); // Corrected the method from req.json to res.json


// Start the server
const PORT = process.env.PORT || 5000; // Set a default port if PORT is not defined
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))


