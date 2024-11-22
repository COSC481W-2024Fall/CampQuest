const router = require('express').Router();
const Campground = require('../models/campground_model');

// GET all campgrounds with pagination and optional filters
router.route('/').get(async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 12, 1);
        const amenitiesFilter = req.query.amenities
            ? req.query.amenities.split(',').map(amenity => amenity.toLowerCase())
            : [];
        const typesFilter = req.query.types
            ? req.query.types.split(',').map(type => type.toLowerCase())
            : [];
        const statesFilter = req.query.states
            ? req.query.states.split(',').map(state => state.toLowerCase())
            : [];

        let query = {};

        if (amenitiesFilter.length > 0) {
            query.amenities = { $all: amenitiesFilter };
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
        res.status(400).json('Error: ' + err.message);
    }
});

// SEARCH campgrounds by name
router.route('/search').get(async (req, res) => {
    try {
        const searchTerm = req.query.q ? req.query.q.toLowerCase() : '';
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 12, 1);

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
        res.status(400).json('Error: ' + err.message);
    }
});

module.exports = router;
