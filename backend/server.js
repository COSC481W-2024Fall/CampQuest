const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Use CORS middleware
app.use(cors({
  origin: 'http://localhost:3000', // or '*' to allow all origins
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
  .then(() => console.log("MongoDB database connection established successfully"))
  .catch(err => console.log("MongoDB connection error:", err));
mongoose
// Define routes
const campRouter = require('./routes/campgrounds');
app.use('/camps', campRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
