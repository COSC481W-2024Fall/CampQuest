const express = require('express');
const router = express.Router();
let Campsite = require('../models/Campground.model');  // Assuming this is where your model is stored

// GET all campsites
router.get('/', async (req, res) => {
  try {
    const campsites = await Campsite.find();
    res.json(campsites);
  } catch (err) {
    res.status(400).json({ message: 'Error: ' + err });
  }
});

// POST a new campsite
router.post('/add', async (req, res) => {
  const newCampsite = new Campsite(req.body);
  try {
    await newCampsite.save();
    res.json('Campsite added!');
  } catch (err) {
    res.status(400).json({ message: 'Error: ' + err });
  }
});

// GET a specific campsite by ID
router.get('/:id', async (req, res) => {
  try {
    const campsite = await Campsite.findById(req.params.id);
    res.json(campsite);
  } catch (err) {
    res.status(400).json({ message: 'Error: ' + err });
  }
});

// DELETE a specific campsite by ID
router.delete('/:id', async (req, res) => {
  try {
    await Campsite.findByIdAndDelete(req.params.id);
    res.json('Campsite deleted.');
  } catch (err) {
    res.status(400).json({ message: 'Error: ' + err });
  }
});

// UPDATE a specific campsite by ID
router.post('/update/:id', async (req, res) => {
  try {
    const campsite = await Campsite.findById(req.params.id);
    Object.assign(campsite, req.body);  // Merge the update fields with the existing document
    await campsite.save();
    res.json('Campsite updated!');
  } catch (err) {
    res.status(400).json({ message: 'Error: ' + err });
  }
});

module.exports = router;
