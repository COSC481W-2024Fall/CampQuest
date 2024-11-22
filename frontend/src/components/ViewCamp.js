import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useParams, Link } from 'react-router-dom';
import '../App.css';
import '../DetailsPage.css';

const CampView = () => {
  const { id } = useParams(); // Get the campground ID from the URL
  const [camp, setCamp] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/camps/${id}`)
      .then(response => {
        setCamp(response.data);
      })
      .catch((error) => {
        console.log('Error fetching campground details:', error);
      });
  }, [id]);

  // Mapping for amenities and types
  const amenitiesMap = {
    E: 'Electricity',
    DP: 'Dump Station',
    DW: 'Drinking Water',
    SH: 'Showers',
    RS: 'Restrooms',
    PA: 'Pets Allowed',
    NP: 'No Pets',
    PT: 'Pit Toilet',
    NH: 'No Hookups',
    L$: 'Free or under $12',
    ND: 'No Dump Station',
    WE: 'Water Electricity',
    WES: 'Water Electricity Sewer'
  };

  const campgroundTypeMap = {
    CP: 'County Park',
    COE: 'Corps of Engineers',
    NP: 'National Park',
    NF: 'National Forest',
    SP: 'State Park',
    PP: 'Provincial Park',
    RV: 'RV Park',
    BML: 'Bureau of Land Management'
  };

  // Decode amenities
  const decodedAmenities = camp?.amenities
    ?.split(' ') // Split if it's a space-separated string
    .map(code => amenitiesMap[code] || code) // Map to readable values or fallback to code
    .join(', ') || 'N/A'; // Join back with commas or use fallback

  // Decode campground type
  const decodedType = campgroundTypeMap[camp?.campgroundType] || 'N/A';

  const mapContainerStyle = {
    width: '100%',
    height: '300px',
  };

  const center = camp ? {
    lat: parseFloat(camp.latitude),
    lng: parseFloat(camp.longitude)
  } : { lat: 0, lng: 0 }; // Fallback center

  return (
    <div className="view-camp-container">
      {camp ? (
        <>
          {/* Section for Map and Camp Details */}
          <div className="map-camp-section">
            <div className="map-container">
              <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={10}
                >
                  <Marker position={center} />
                </GoogleMap>
              </LoadScript>
            </div>

            <div className="camp-details">
              <h1>{camp.campgroundName}</h1>
              <p><strong>Location:</strong> {camp.latitude || 'N/A'}, {camp.longitude || 'N/A'}</p>
              <p><strong>City:</strong> {camp.city || 'N/A'}</p>
              <p><strong>State:</strong> {camp.state || 'N/A'}</p>
              <p><strong>Campground Type:</strong> {decodedType}</p>
              <p><strong>Campground Amenities:</strong> {decodedAmenities}</p>
              <p><strong>Phone:</strong> {camp.phoneNumber || 'N/A'}</p>
              <p><strong>Number of Sites:</strong> {camp.numSites || 'N/A'}</p>
              <p><strong>Dates Open:</strong> {camp.datesOpen || 'N/A'}</p>
              <Link to="/">Back</Link>
            </div>
          </div>

          {/* Review Section */}
          <div className="review-section">
            <h2>Leave a Review</h2>
            <textarea placeholder="Leave a review..." />
            <button>Submit</button>
          </div>

          {/* Similar Campgrounds */}
          <div className="similar-campgrounds">
            <h2>Similar Campgrounds</h2>
            <div className="campgrounds">
              <div className="camping-card">Campground 1</div>
              <div className="camping-card">Campground 2</div>
              <div className="camping-card">Campground 3</div>
              <div className="camping-card">Campground 4</div>
            </div>
          </div>
        </>
      ) : (
        <p>Loading camp details...</p>
      )}
    </div>
  );
};

export default CampView;