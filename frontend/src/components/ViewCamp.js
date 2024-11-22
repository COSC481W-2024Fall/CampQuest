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
  const [similarCamps, setSimilarCamps] = useState([]); // Added missing state
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current camp
  useEffect(() => {
    setIsLoading(true);
    axios.get(`${process.env.REACT_APP_API_URL}/camps/${id}`)
      .then(response => {
        setCamp(response.data);
        // Fetch all camps for similarity comparison
        return axios.get(`${process.env.REACT_APP_API_URL}/camps`);
      })
      .then(response => {
        // Filter out the current camp and find similar ones
        const otherCamps = response.data.filter(c => c._id !== id);
        const similar = findSimilar(camp, otherCamps);
        // Get the top 4 similar camps
        setSimilarCamps(similar.slice(0, 4));
        setIsLoading(false);
      })
      .catch((error) => {
        console.log('Error fetching data:', error);
        setIsLoading(false);
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

  // Decode amenities
  const decodedAmenities = camp?.amenities
    ?.split(' ')
    .map(code => amenitiesMap[code] || code)
    .join(', ') || 'N/A';

  // Decode campground type
  const decodedType = campgroundTypeMap[camp?.campgroundType] || 'N/A';

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

          <div className="similar-campgrounds">
            <h2>Similar Campgrounds</h2>
            <div className="campgrounds">
              {!isLoading && similarCamps.length > 0 ? (
                similarCamps.map(camp => (
                  <Link key={camp._id} to={`/view/${camp._id}`}>
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