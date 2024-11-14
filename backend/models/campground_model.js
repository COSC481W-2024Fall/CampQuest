const mongoose = require('mongoose');

const campgroundSchema = new mongoose.Schema({
    _id:{
        type: String,
    },
    amenities:{
        Type: String,
    },
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
    }
    

},{ collection: 'ProductionCampsites' });

const Campground = mongoose.model('Campground', campgroundSchema);
module.exports = Campground;