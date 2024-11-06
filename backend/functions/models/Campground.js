const mongoose = require('mongoose');
const Campground = require('./models/Campground_model');

const connectDB = async() => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        //Hardcoded Data
        const campsite = new Campground({
            campgroundName: "Ackley Creek County Park",
            campgroundCode: "ACKL",
            longitude: 92.875,
            latitude: 42.953,
            phoneNumber: "641.756.3490",
            campgroundType: "CP",
            numSites: 40,
            datesOpen: ""
        });
        //Saves campground to database
        await campsite.save();
        console.log("Campground data saved");

        mongoose.connection.close();
        console.log("MongoDB connection is closed.")

    }
    catch(error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();