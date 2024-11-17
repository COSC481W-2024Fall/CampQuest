    const router = require('express').Router();
    let Campground = require('../models/campground_model');

    //GET all campgrounds
    router.route('/').get((req, res) =>{ 

        //creates query for database
        let query = {};
        let amenityFilter;

        if(req.query.amenities){
            amenityFilter = req.query.amenities.split(',');
        }
        else {
            amenityFilter = [];
        }

        //Uses Reg Expression to match Amenities from amenitiesFilter[] to database
        if(amenityFilter.length > 0) {
            const regex = amenityFilter.map(amenity => `(?=.*${amenity})`).join('');
            query.amenities = { $regex: regex, $options: 'i'};
        }

        Campground.find(query)
            .then(campgrounds => {
                if(campgrounds.length == 0){
                    return res.status(200).json({ message: "No matching campgrounds."})
                }
                res.json(campgrounds);
            })
            .catch(err => res.status(400).json('Error: ' + err));
    })

    //POST a campground
    router.route('/add').post((req, res) => {
        const{campgroundName, campgroundCode, longitude, latitude, phoneNumber, campgroundType, numSites, datesOpen} = req.body;

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
            nearestTownBearing
        });

        newCampground.save()
            .then(() => res.json('Campground added!'))
            .catch(err => res.status(400).json('Error: ' + err));
    });

    //GET a specific campground details
    router.route('/:id').get((req, res) => {
        Campground.findById(req.params.id)
        .then(campground => res.json(campground))
        .catch(err => res.status(400).json('Error: ' + err));
    })

    //DELETE a campground
    router.route('/:id').delete((req,res ) => {
    Campground.findByIdAndDelete(req.params.id)
        .then(() => res.json('Book deleted.'))
        .catch(err => res.status(400).json('Error: ' + err));
        });

    // UPDATE a Campground
    router.route('/update/:id').post((req, res) => {
        Campground.findById(req.params.id)
            .then(campground => {
                campground.campgroundName = req.body.campgroundName;
                campground.campgroundCode = req.body.code;
                campground.longitude = Number(req.body.longitude);
                campground.latitude = Number(req.body.latitude);
                campground.phoneNumber = req.body.phoneNumber;
                campground.campgroundType = req.body.campgroundType;
                campground.numSites = Number(req.body.numSites);
                campground.datesOpen = req.body.datesOpen;
    
            campground.save()
            .then(() => res.json('Book updated!'))
            .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
    });

    module.exports = router;