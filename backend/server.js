const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Use CORS middleware
app.use(cors({
  origin: 'http://localhost:3000',  // Adjust based on your frontend
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB using environment variables
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
  .then(() => console.log("MongoDB database connection established successfully"))
  .catch(err => console.log("MongoDB connection error:", err));


// Define the Mongoose schema and model to use the 'TestData' collection in 'Test' database
const campsiteSchema = new mongoose.Schema({
  name: String,
  longitude: Number,
  latitude: Number,
  amenities: String,
  state: String,
  nearest_town_distance: Number,
  nearest_town_bearing: String,
  city: String
}, { collection: 'TestData' });  // Explicitly use 'TestData' collection

const Campsite = mongoose.model('Campsite', campsiteSchema, 'TestData');  // Use the 'TestData' collection in 'Test' DB

// Example GET route to fetch all campsites
app.get('/campsites', async (req, res) => {
  try {
    const campsites = await Campsite.find();
    res.json(campsites);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching campsites' });
  }
});

// Example POST route to add a new campsite
app.post('/campsites', async (req, res) => {
  const campsite = new Campsite(req.body);
  try {
    await campsite.save();
    res.status(201).json(campsite);
  } catch (err) {
    res.status(400).json({ message: 'Error saving campsite' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
