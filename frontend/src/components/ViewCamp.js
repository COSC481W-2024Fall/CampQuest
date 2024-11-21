import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useParams, Link } from 'react-router-dom';
import '../App.css';
import '../DetailsPage.css';
import ReviewList from './reviews/ReviewList';

const CampView = () => {
  const { id } = useParams(); // Get the campground ID from the URL
  const [camp, setCamp] = useState(null);
  const [campsList, setCampList] = useState([]);

  // Load camp details from the database
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/camps/${id}`)
      .then((response) => setCamp(response.data))
      .catch((error) => console.error('Error fetching campground details:', error));
  }, [id]);

  // Load all campgrounds for similarity comparison
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/camps`)
      .then((response) => setCampList(response.data))
      .catch((error) => console.error('Error fetching similar campgrounds:', error));
  }, []);

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
    WES: 'Water Electricity Sewer',
  };

  const campgroundTypeMap = {
    CP: 'County Park',
    COE: 'Corps of Engineers',
    NP: 'National Park',
    NF: 'National Forest',
    SP: 'State Park',
    PP: 'Provincial Park',
    RV: 'RV Park',
    BML: 'Bureau of Land Management',
  };

  // Decode amenities and types
  const decodedAmenities = camp?.amenities
    ?.split(' ')
    .map((code) => amenitiesMap[code] || code)
    .join(', ');

  const decodedType = campgroundTypeMap[camp?.campgroundType] || camp?.campgroundType;

  const mapContainerStyle = {
    width: '100%',
    height: '300px',
  };

  const center = camp && camp.latitude && camp.longitude
    ? {
        lat: parseFloat(camp.latitude),
        lng: parseFloat(camp.longitude),
      }
    : { lat: 0, lng: 0 }; // Fallback center for invalid data

  const similarCamps = camp && campsList.length > 0 ? findSimilar(camp, campsList) : [];

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
              <p><strong>Location:</strong> {camp.latitude}, {camp.longitude}</p>
              <p><strong>City:</strong> {camp.city}</p>
              <p><strong>State:</strong> {camp.state}</p>
              <p><strong>Campground Type:</strong> {decodedType}</p>
              <p><strong>Amenities:</strong> {decodedAmenities || 'N/A'}</p>
              <p><strong>Phone:</strong> {camp.phoneNumber || 'N/A'}</p>
              <p><strong>Number of Sites:</strong> {camp.numSites || 'N/A'}</p>
              <p><strong>Dates Open:</strong> {camp.datesOpen || 'N/A'}</p>
              <Link to="/">Back</Link>
            </div>
          </div>

          {/* Review Section */}
          <div className="review-section">
            <h2>Leave a Review</h2>
            <ReviewList campgroundId={id} />
          </div>

          {/* Similar Campgrounds */}
          <div className="similar-campgrounds">
            <h2>Similar Campgrounds</h2>
            <div className="campgrounds">
              {similarCamps.length > 0 ? (
                similarCamps.slice(0, 4).map((camp) => (
                  <Link to={`/view/${camp._id}`} key={camp._id}>
                    <div className="camping-card">{camp.campgroundName}</div>
                  </Link>
                ))
              ) : (
                <>
                  <div className="camping-card">Loading Camp 1</div>
                  <div className="camping-card">Loading Camp 2</div>
                  <div className="camping-card">Loading Camp 3</div>
                  <div className="camping-card">Loading Camp 4</div>
                </>
              )}
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

// Helper Functions
function findSimilar(self, others) {
  if (!self || !self.latitude || !self.longitude || !self.amenities) return [];
  return others
    .map((other) => {
      const distance = computeDistance(self.latitude, self.longitude, other.latitude, other.longitude);
      const amenityScore = computeAmenities(self, other);
      return {
        ...other,
        similarity: distance + amenityScore * 7.5,
      };
    })
    .sort((a, b) => a.similarity - b.similarity);
}

function computeAmenities(self, other) {
  if (!self.amenities || !other.amenities) return Infinity;
  const selfAmenities = self.amenities.split(' ');
  const otherAmenities = other.amenities.split(' ');
  return selfAmenities.filter((amenity) => !otherAmenities.includes(amenity)).length;
}

function computeDistance(latCurr, longCurr, latCamp, longCamp) {
  const toRadians = (deg) => deg * (Math.PI / 180);
  return (
    Math.acos(
      Math.sin(toRadians(latCurr)) * Math.sin(toRadians(latCamp)) +
        Math.cos(toRadians(latCurr)) * Math.cos(toRadians(latCamp)) * Math.cos(toRadians(longCamp - longCurr))
    ) * 6371
  ); // Distance in km
}