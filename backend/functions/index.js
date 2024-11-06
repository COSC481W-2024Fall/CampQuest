const functions = require("firebase-functions");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Initialize Express app
const app = express();

// Use CORS middleware with specific configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));

// Add logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Middleware
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || functions.config().mongo.uri;
    console.log('Attempting MongoDB connection...');
    
    if (!uri) {
      throw new Error('MongoDB URI is not configured');
    }
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Define Camp Schema
const campSchema = new mongoose.Schema({
  name: String,
  city: String,
  state: String,
  type: String
}, { timestamps: true });

let Camp;
try {
  Camp = mongoose.model('Camp');
} catch {
  Camp = mongoose.model('Camp', campSchema);
}

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'CampQuest API is running' });
});

// Camps routes
app.get('/camps', async (req, res) => {
  console.log('Received request for /camps');
  try {
    console.log('Attempting to connect to MongoDB...');
    await connectDB();
    console.log('MongoDB connection successful');
    
    console.log('Attempting to fetch camps...');
    const camps = await Camp.find();
    console.log(`Successfully found ${camps.length} camps`);
    
    res.json(camps);
  } catch (error) {
    console.error('Detailed error in /camps route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch camps',
      details: error.message,
      stack: error.stack
    });
  }
});
// In your backend index.js
app.use(cors({
  origin: ['http://localhost:3000', 'your-frontend-deployed-url'],
  credentials: false // Change this to false since we're not using cookies
}));
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Export the Express app as a Firebase Function
exports.campquest = functions.https.onRequest(app);