const mongoose = require('mongoose');

const campgroundSchema = new mongoose.Schema({
    campgroundName: {
        type: String,
        required: true
    },
    campgroundCode: {
        type: String,
        requried: false
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
    },
    amenities: {
        type: String,
        required: false
    },
    reviews : {
        type: String,
        required: true,
        timestamps: true
    }


},{ collection: 'ProductionCampsites' });

const Campground = mongoose.model('Campground', campgroundSchema);
module.exports = Campground;