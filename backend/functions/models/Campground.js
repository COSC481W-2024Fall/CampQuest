const mongoose = require('mongoose');
const Campground = require('./models/Campground_model');
const campgroundData = require('./campground-data');

const connectDB = async() => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Save hardcoded campground data
        for (const data of campgroundData) {
            const campsite = new Campground(data);
            await campsite.save();
        }
        console.log("Campground data saved");
    }
    catch(error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const closeDBConnection = async() => {
    try {
        await mongoose.connection.close();
        console.log("MongoDB connection is closed.");
    } catch (error) {
        console.error(`Error closing MongoDB connection: ${error.message}`);
    }
};

connectDB();