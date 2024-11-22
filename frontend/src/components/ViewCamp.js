import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useParams, Link } from 'react-router-dom';
import '../App.css';
import '../DetailsPage.css';
import ReviewList from './reviews/ReviewList';

const CampView = () => {
  const { id } = useParams();
  const [camp, setCamp] = useState(null);
  const [campsList, setCampList] = useState([]);
  const [similarCamps, setSimilarCamps] = useState([]);

  // Load camp details
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/camps/${id}`)
      .then(response => {
        setCamp(response.data);
      })
      .catch((error) => {
        console.log('Error fetching campground details:', error);
      });
  }, [id]);

  // Load all camps
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/camps/`)
      .then(response => {
        setCampList(response.data);
      })
      .catch((error) => {
        console.log('Error fetching campgrounds:', error);
      });
  }, []);

  // Calculate similar camps whenever camp or campsList changes
  useEffect(() => {
    if (camp && campsList && campsList.length > 0) {
      const similar = findSimilar(camp, campsList);
      setSimilarCamps(similar);
    }
  }, [camp, campsList]);

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
    'L$': 'Free or under $12',
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

  const mapContainerStyle = {
    width: '100%',
    height: '300px',
  };

  const center = camp ? {
    lat: parseFloat(camp.latitude),
    lng: parseFloat(camp.longitude)
  } : { lat: 0, lng: 0 };

  return (
    <div className="view-camp-container">
      {camp ? (
        <>
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
              <p><strong>Campground Type:</strong> {campgroundTypeMap[camp.campgroundType] || camp.campgroundType}</p>
              <p><strong>Phone:</strong> {camp.phoneNumber}</p>
              <p><strong>Number of Sites:</strong> {camp.numSites}</p>
              <p><strong>Dates Open:</strong> {camp.datesOpen || 'N/A'}</p>
              <Link to="/">Back</Link>
            </div>
          </div>

          <div className="review-section">
            <h2>Leave a Review</h2>
            <ReviewList campgroundId={id} />
          </div>

          <div className="similar-campgrounds">
            <h2>Similar Campgrounds</h2>
            <div className="campgrounds">
              {similarCamps.length > 0 ? (
                similarCamps.slice(1, 5).map((similarCamp) => (
                  <Link key={similarCamp._id} to={`/view/${similarCamp._id}`}>
                    <div className="camping-card">{similarCamp.campgroundName}</div>
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

// Helper functions
function findSimilar(self, others) {
  if (!self || !others || !Array.isArray(others)) {
    return [];
  }

  const campSimilarity = others.map(othr => {
    const distance = computeDistance(self.latitude, self.longitude, othr.latitude, othr.longitude);
    const ammenityScore = computeAmmenities(self, othr);
    const similarScore = distance + ammenityScore * 7.5;
    
    return {
      ...othr,
      similarity: similarScore
    };
  });

  return campSimilarity.sort((a, b) => a.similarity - b.similarity);
}

function computeAmmenities(self, other) {
  if (!self?.amenities || !other?.amenities) {
    return 0;
  }

  const campAmenities = self.amenities.split(" ");
  const otherAmenities = other.amenities.split(" ");
  
  return campAmenities.reduce((score, amenity) => {
    return score + (otherAmenities.includes(amenity) ? 0 : 1);
  }, 0);
}

function computeDistance(latCurr, longCurr, latCamp, longCamp) {
  if (!latCurr || !longCurr || !latCamp || !longCamp) {
    return 0;
  }

  const dist = Math.acos(
    (Math.sin(findRadians(latCurr)) * Math.sin(findRadians(latCamp))) +
    (Math.cos(findRadians(latCurr)) * Math.cos(findRadians(latCamp))) *
    (Math.cos(findRadians(longCamp) - findRadians(longCurr)))
  ) * 6371;

  return isNaN(dist) ? 0 : dist;
}

function findRadians(degrees) {
  return degrees * (Math.PI / 180);
}

export default CampView;