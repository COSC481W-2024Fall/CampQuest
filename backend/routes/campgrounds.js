const router = require('express').Router();
const Campground = require('../models/campground_model');
const axios = require('axios');
require('dotenv').config();

router.get('/image', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    // Search for the campground in the database
    const existingCamp = await Campground.findOne({ campgroundName: new RegExp(query.split(',')[0], 'i') });

    if (existingCamp && existingCamp.imageUrl) {
      return res.json({ imageUrl: existingCamp.imageUrl });
    }

    // Fetch from Google Maps if not in database
    if (!process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({ message: 'Google Places API key is not configured' });
    }

    const searchQueries = [
      query,
      query.replace('campground', '').trim(),
      query.split(',')[0],
      `${query.split(',')[0]} campground`,
      `campground near ${query}`,
      `camping ${query}`
    ];

    for (const searchQuery of searchQueries) {
      try {
        const placesResponse = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
          params: {
            query: searchQuery,
            key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
            type: 'campground'
          }
        });

        const results = placesResponse.data.results;

        if (!results || results.length === 0) continue;

        for (const result of results) {
          const photoReference = result.photos?.[0]?.photo_reference;

          if (photoReference) {
            const imageResponse = await axios.get('https://maps.googleapis.com/maps/api/place/photo', {
              params: {
                maxwidth: 400,
                photoreference: photoReference,
                key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
              },
              responseType: 'text'
            });

            const imageUrl = imageResponse.request.res.responseUrl;

            // Save the image URL to the database
            existingCamp.imageUrl = imageUrl;
            await existingCamp.save();

            return res.json({ imageUrl });
          }
        }
      } catch (searchError) {
        console.error(`Error with search query ${searchQuery}:`, searchError.message);
      }
    }

    return res.json({ imageUrl: null });
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ message: 'Unexpected error in image retrieval', error: error.message });
  }
});


// Utility function to construct queries
const buildQuery = ({ campgroundName, amenities, types, states }) => {
  const query = {};

  if (amenities?.length) {
    query.amenities = {
      $all: amenities.map((amenity) => new RegExp(amenity, 'i')),
    };
  }

  if (types?.length) {
    query.campgroundType = { $in: types };
  }

  if (states?.length) {
    query.state = { $in: states };
  }

  if (campgroundName?.length) {
    query.campgroundName = { $regex: campgroundName, $options: 'i'};
  }

  return query;
};

// Utility function for pagination parameters
const getPaginationParams = (req) => ({
  page: parseInt(req.query.page) || 1,
  limit: parseInt(req.query.limit) || 12,
});

// GET all campgrounds with filters and pagination
router.get('/', async (req, res) => {
  try {
    const { page, limit } = getPaginationParams(req);
    const query = buildQuery({
      campgroundName: req.query?.q || '',
      amenities: req.query?.amenities?.length > 0 ? req.query?.amenities?.split(',') : [],
      types: req.query?.types?.length > 0 ? req.query?.types?.split(',') : [],
      states: req.query?.states?.length > 0 ? req.query?.states?.split(',') : [],
    });

    const campgrounds = await Campground.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCampgrounds = await Campground.countDocuments(query);

    res.json({
      campgrounds,
      totalPages: Math.ceil(totalCampgrounds / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(400).json({ message: 'Error fetching campgrounds', error: err });
  }
});

router.get('/nearest', async (req, res) => {
  try {
    const { lat, lon, id } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude and Longitude are required' });
    }

    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lon), parseFloat(lat)], 
          },
          $maxDistance: 50000, 
        },
      },
      _id: { $ne: id },
    };
    
    const closestCamps = await Campground.find(query)
      .limit(4)
      .exec();

    res.json({ closestCamps });
  } catch (err) {
    res.status(400).json({ message: 'Error fetching nearest campgrounds', error: err });
  }
});

// SEARCH campgrounds by name with pagination
router.get('/search', async (req, res) => {
  try {
    const { page, limit } = getPaginationParams(req);
    const searchTerm = req.query.q || '';

    const query = searchTerm
      ? { campgroundName: { $regex: searchTerm, $options: 'i' } }
      : {};

    const campgrounds = await Campground.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalResults = await Campground.countDocuments(query);

    res.json({
      campgrounds,
      totalPages: Math.ceil(totalResults / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(400).json({ message: 'Error searching campgrounds', error: err });
  }
});

// POST a new campground
router.post('/add', async (req, res) => {
  try {
    const newCampground = new Campground(req.body);
    await newCampground.save();
    res.status(201).json({ message: 'Campground added!', campground: newCampground });
  } catch (err) {
    res.status(400).json({ message: 'Error adding campground', error: err });
  }
});

// GET a specific campground's details
router.get('/:id', async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      return res.status(404).json({ message: 'Campground not found' });
    }
    res.json(campground);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching campground details', error: err });
  }
});

// DELETE a campground
router.delete('/:id', async (req, res) => {
  try {
    const campground = await Campground.findByIdAndDelete(req.params.id);
    if (!campground) {
      return res.status(404).json({ message: 'Campground not found' });
    }
    res.json({ message: 'Campground deleted.' });
  } catch (err) {
    res.status(400).json({ message: 'Error deleting campground', error: err });
  }
});

// UPDATE a campground
router.post('/update/:id', async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      return res.status(404).json({ message: 'Campground not found' });
    }

    Object.assign(campground, req.body);

    await campground.save();
    res.json({ message: 'Campground updated!', campground });
  } catch (err) {
    res.status(400).json({ message: 'Error updating campground', error: err });
  }
});

// GET reviews for a specific campground with pagination
router.get('/:id/reviews', async (req, res) => {
  try {
    const { page, limit } = getPaginationParams(req);
    const campground = await Campground.findById(req.params.id).select('reviews');

    if (!campground) {
      return res.status(404).json({ message: 'Campground not found' });
    }

    const startIndex = (page - 1) * limit;
    const paginatedReviews = campground.reviews.slice(startIndex, startIndex + limit);

    res.json({
      reviews: paginatedReviews,
      totalPages: Math.ceil(campground.reviews.length / limit),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews', error: err });
  }
});

// POST a review for a specific campground
router.post('/:id/reviews', async (req, res) => {
  try {
    const { content } = req.body;
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
      return res.status(404).json({ message: 'Campground not found' });
    }

    campground.reviews.push({ content });
    await campground.save();

    res.status(201).json({ message: 'Review submitted successfully', review: { content } });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting review', error: err });
  }
});

module.exports = router;
