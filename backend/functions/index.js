const functions = require("firebase-functions");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Initialize Express app
const app = express();

// Use CORS middleware with specific configuration
app.use(cors({
  origin: true, // Allow all origins
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
    const uri = functions.config().mongo.uri;
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
    await connectDB();
    console.log('Connected to MongoDB, fetching camps...');
    const camps = await Camp.find();
    console.log(`Found ${camps.length} camps`);
    res.json(camps);
  } catch (error) {
    console.error('Error in /camps route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch camps',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Export the Express app as a Firebase Function
exports.app = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '1GB'
  })
  .https.onRequest(app);