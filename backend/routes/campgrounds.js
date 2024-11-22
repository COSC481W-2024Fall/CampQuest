const router = require('express').Router();
let Campground = require('../models/campground_model');

// GET all campgrounds with pagination and optional amenities filter
router.route('/').get(async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const amenitiesFilter = req.query.amenities ? req.query.amenities.split(',') : [];
      const typesFilter = req.query.types ? req.query.types.split(',') : [];
      const statesFilter = req.query.states ? req.query.states.split(',') : [];
  
      let query = {};
  
      if (amenitiesFilter.length > 0) {
        query.amenities = {
          $all: amenitiesFilter.map((amenity) => new RegExp(amenity, 'i')), // Ensure matches all selected
        };
      }
      
      if (typesFilter.length > 0) {
        query.campgroundType = { $in: typesFilter };
      }
      
  
      if (statesFilter.length > 0) {
        query.state = { $in: statesFilter };
      }
  
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
      res.status(400).json('Error: ' + err);
    }
  });

// SEARCH campgrounds by name
router.route('/search').get(async (req, res) => {
    try {
        const searchTerm = req.query.q || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;

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
        res.status(400).json('Error: ' + err);
    }
});

// POST a campground
router.route('/add').post((req, res) => {
    const {
        campgroundName,
        campgroundCode,
        longitude,
        latitude,
        phoneNumber,
        campgroundType,
        numSites,
        datesOpen,
        city,
        state,
        amenities,
        nearestTownDistance,
        nearestTownBearing,
    } = req.body;

    const newCampground = new Campground({
        campgroundName,
        campgroundCode,
        longitude,
        latitude,
        phoneNumber,
        campgroundType,
        numSites,
        datesOpen,
        city,
        state,
        amenities,
        nearestTownDistance,
        nearestTownBearing,
    });

    newCampground.save()
        .then(() => res.json('Campground added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

// GET a specific campground's details
router.route('/:id').get((req, res) => {
    Campground.findById(req.params.id)
        .then(campground => res.json(campground))
        .catch(err => res.status(400).json('Error: ' + err));
});

// DELETE a campground
router.route('/:id').delete((req, res) => {
    Campground.findByIdAndDelete(req.params.id)
        .then(() => res.json('Campground deleted.'))
        .catch(err => res.status(400).json('Error: ' + err));
});

// UPDATE a campground
router.route('/update/:id').post((req, res) => {
    Campground.findById(req.params.id)
        .then(campground => {
            campground.campgroundName = req.body.campgroundName;
            campground.campgroundCode = req.body.campgroundCode;
            campground.longitude = Number(req.body.longitude);
            campground.latitude = Number(req.body.latitude);
            campground.phoneNumber = req.body.phoneNumber;
            campground.campgroundType = req.body.campgroundType;
            campground.numSites = Number(req.body.numSites);
            campground.datesOpen = req.body.datesOpen;
            campground.city = req.body.city;
            campground.state = req.body.state;
            campground.amenities = req.body.amenities;
            campground.nearestTownDistance = req.body.nearestTownDistance;
            campground.nearestTownBearing = req.body.nearestTownBearing;

            campground.save()
                .then(() => res.json('Campground updated!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;