const functions = require("firebase-functions");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Initialize Express app
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://campque-c9b14.web.app'],
  credentials: false
}));

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Use your existing campground schema
const campgroundSchema = new mongoose.Schema({
    campgroundName: {
        type: String,
        required: true
    },
    campgroundCode: {
        type: String,
        required: false
    },
    longitude: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    campgroundType: {
        type: String,
        required: false
    },
    numSites: {
        type: Number,
        required: false
    },
    datesOpen: {
        type: String,
        required: false
    }
}, { collection: 'Campsites.ProductionCampsites' });

let Campground;
try {
  Campground = mongoose.model('Campground');
} catch {
  Campground = mongoose.model('Campground', campgroundSchema);
}

// MongoDB Connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('Reusing existing MongoDB connection');
    return;
  }
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Attempting MongoDB connection...');
    
    if (!uri) {
      throw new Error('MongoDB URI is not configured');
    }
    
<<<<<<< Updated upstream
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increase to 10 seconds
      socketTimeoutMS: 45000,          // Increase to 45 seconds if needed
      poolSize: 10                     // Increase the connection pool size
    });
    isConnected = true;
=======
    await mongoose.connect(uri);
>>>>>>> Stashed changes
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Camps routes
app.get('/camps', async (req, res) => {
  try {
<<<<<<< Updated upstream
    console.log('Fetching camps...');
    const limit = parseInt(req.query.limit) || 12; // 12 per page by default
    const page = parseInt(req.query.page) || 1;
    
    await connectDB();
    const camps = await Camp.find()
      .limit(limit)
      .skip((page - 1) * limit);

=======
    await connectDB();
    console.log('Attempting to fetch camps...');
    const camps = await Campground.find();
    console.log(`Successfully found ${camps.length} camps`);
>>>>>>> Stashed changes
    res.json(camps);
  } catch (error) {
    console.error('Error fetching camps:', error);
    res.status(500).json({ 
      error: 'Failed to fetch camps',
      details: error.message,
      stack: error.stack 
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

exports.campquest = functions.https.onRequest(app);