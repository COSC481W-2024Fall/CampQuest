const functions = require("firebase-functions");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Initialize Express app
const app = express();

// Use CORS middleware
app.use(cors({
  origin: '*', // Allow all origins or restrict to specific origins as needed
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
const uri = process.env.MONGO_URI || functions.config().mongo.uri;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB database connection established successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// Define routes
const campRouter = require("./routes/campgrounds");
app.use("/camps", campRouter);

// Export the app as a Firebase Function
exports.app = functions.https.onRequest(app);
