const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
);

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
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number]
        }
    },
    reviews : [reviewSchema],
    imageUrl: {
        type: String,
        required: false
    }
},{ collection: 'ProductionCampsites' });

campgroundSchema.index({ location: '2dsphere' });

const Campground = mongoose.model('Campground', campgroundSchema);
module.exports = Campground;