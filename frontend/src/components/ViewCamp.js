import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useParams, Link } from 'react-router-dom';
import '../App.css';
import '../DetailsPage.css';
import ReviewList from './reviews/ReviewList';

const CampView = () => {
  const { id } = useParams(); // Get the campground ID from the URL
  const [camp, setCamp] = useState(null); // Store details of the current camp
  const [campsList, setCampList] = useState([]); // Store the list of all camps

  // Load current camp details
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/camps/${id}`)
      .then((response) => {
        setCamp(response.data);
      })
      .catch((error) => {
        console.error('Error fetching campground details:', error);
      });
  }, [id]);

  // Load all camps for similarity calculations
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/camps`)
      .then((response) => {
        setCampList(response.data);
      })
      .catch((error) => {
        console.error('Error fetching all campgrounds:', error);
      });
  }, []);

  // Calculate similar camps
  const similarCamps = camp && campsList.length > 0
    ? findSimilar(camp, campsList)
    : [];

  // Map container style for Google Maps
  const mapContainerStyle = {
    width: '100%',
    height: '300px',
  };

  // Center of the map, fallback if no camp data
  const center = camp?.latitude && camp?.longitude
  ? { lat: parseFloat(camp.latitude), lng: parseFloat(camp.longitude) }
  : { lat: 0, lng: 0 };


  return (
    <div className="view-camp-container">
      {/* Render camp details */}
      {camp ? (
        <>
          {/* Map and Details Section */}
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
              <p><strong>Campground Type:</strong> {camp.campgroundType}</p>
              <p><strong>Phone:</strong> {camp.phoneNumber}</p>
              <p><strong>Number of Sites:</strong> {camp.numSites}</p>
              <p><strong>Dates Open:</strong> {camp.datesOpen || 'N/A'}</p>
              <Link to="/">Back</Link>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="review-section">
            <h2>Leave a Review</h2>
            <ReviewList campgroundId={id} />
          </div>

          {/* Similar Campgrounds Section */}
          <div className="similar-campgrounds">
            <h2>Similar Campgrounds</h2>
            <div className="campgrounds">
              {similarCamps.length > 0 ? (
                similarCamps.slice(0, 4).map((similarCamp) => (
                  <Link to={`/view/${similarCamp.id}`} key={similarCamp.id}>
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

// Find the similarity scores of all campgrounds and sort them
function findSimilar(self, others) {
  if (!self || others.length === 0) return [];

  // Map similarity onto the camp list
  let campSimilarity = others.map((othr) => {
    // Calculate distance between two camps
    let distance = computeDistance(self.latitude, self.longitude, othr.latitude, othr.longitude);
    let ammenityScore = computeAmenities(self, othr);
    let similarityScore = distance + ammenityScore * 7.5;
    return {
      id: othr.id,
      campgroundName: othr.campgroundName,
      campgroundCode: othr.campgroundCode,
      longitude: othr.longitude,
      latitude: othr.latitude,
      phoneNumber: othr.phoneNumber,
      campgroundType: othr.campgroundType,
      numSites: othr.numSites,
      datesOpen: othr.datesOpen,
      similarity: similarityScore,
    };
  });

  // Sort the camp list by similarity
  campSimilarity.sort((a, b) => a.similarity - b.similarity);
  return campSimilarity;
}

// Find amenities score based on number of missing amenities
function computeAmenities(self, other) {
  let score = 0;
  let campAmenities = self.amenities.split(' ');

  if (other.amenities) {
    let otherAmenities = other.amenities.split(' ');
    campAmenities.forEach((amenity) => {
      if (!otherAmenities.includes(amenity)) {
        score += 1;
      }
    });
  }

  return score;
}

// Compute the distance between two geographical points
function computeDistance(latCurr, longCurr, latCamp, longCamp) {
  let dist = Math.acos(
    Math.sin(findRadians(latCurr)) * Math.sin(findRadians(latCamp)) +
    Math.cos(findRadians(latCurr)) * Math.cos(findRadians(latCamp)) * 
    Math.cos(findRadians(longCamp) - findRadians(longCurr))
  ) * 6371; // Radius of Earth in kilometers
  return dist;
}

// Convert degrees to radians
function findRadians(degrees) {
  return degrees * (Math.PI / 180);
}

export default CampView;
