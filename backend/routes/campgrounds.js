const express = require('express');
const path = require('path');

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

    router.route('/').get(async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;  // Default to 12 items per page
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
        if (amenityFilter.length > 0) {
            query.amenities = { $all: amenityFilter };
        }
        
        Campground.find(query)
            .then(campgrounds => {
                if(campgrounds.length == 0){
                    return res.status(200).json({ message: "No matching campgrounds."})
                }
                res.json(campgrounds);
            })
            .catch(err => res.status(400).json('Error: ' + err));
            const campgrounds = await Campground.find()
                .skip((page - 1) * limit)
                .limit(limit);

            const totalCampgrounds = await Campground.countDocuments();
            res.json({
                campgrounds,
                totalPages: Math.ceil(totalCampgrounds / limit),
                currentPage: page
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
                currentPage: page
            });
        } catch (err) {
            res.status(400).json('Error: ' + err);
        }
    });
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


    router.get('/:id/reviews', async (req, res) => {
        const { id } = req.params;
        const { page = 1, limit = 5 } = req.query;
      
        try {
          const campground = await Campground.findById(id).select('reviews');
          if (!campground) return res.status(404).json({ message: 'Campground not found' });
      
          const startIndex = (page - 1) * limit;
          const paginatedReviews = campground.reviews.slice(startIndex, startIndex + parseInt(limit));
          const totalPages = Math.ceil(campground.reviews.length / limit);
      
          res.json({
            reviews: paginatedReviews,
            totalPages,
          });
        } catch (error) {
          res.status(500).json({ message: 'Error fetching reviews', error });
        }
    });

    router.post('/:id/reviews', async (req, res) => {
        const { id } = req.params;
        const { content } = req.body;

        try {
          const campground = await Campground.findById(id).select('reviews');
          if (!campground) return res.status(404).json({ message: 'Campground not found' });
      
          campground.reviews.push({ content });
          await campground.save();
      
          res.status(201).json({ message: 'Review submitted successfully' });
        } catch (error) {
          res.status(500).json({ message: 'Error submitting review', error });
        }
    });

    module.exports = router;