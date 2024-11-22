const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize Express app
const app = express();

// Use CORS middleware
app.use(cors({
  origin: '*', // or '*' to allow all origins
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

// Define routes
const campRouter = require('./routes/campgrounds');
app.use('/camps', campRouter);

// Serve static files from the frontend build folder
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Route all other requests to the frontend index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

module.exports = app;