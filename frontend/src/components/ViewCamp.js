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
  const [similarCamps, setSimilarCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch camp details and similar camps
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch current camp details
        const campResponse = await axios.get(`${process.env.REACT_APP_API_URL}/camps/${id}`);
        setCamp(campResponse.data);

        // Fetch all camps for similarity comparison
        const allCampsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/camps`);
        const otherCamps = allCampsResponse.data.filter(c => c._id !== id);
        
        // Find similar camps if we have the current camp data
        if (campResponse.data) {
          const similar = findSimilar(campResponse.data, otherCamps);
          // Get top 4 similar camps
          setSimilarCamps(similar.slice(0, 4));
        }
      } catch (error) {
        console.log('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      {loading ? (
        <p>Loading camp details...</p>
      ) : (
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
              <h1>{camp?.campgroundName}</h1>
              <p><strong>Location:</strong> {camp?.latitude || 'N/A'}, {camp?.longitude || 'N/A'}</p>
              <p><strong>City:</strong> {camp?.city || 'N/A'}</p>
              <p><strong>State:</strong> {camp?.state || 'N/A'}</p>
              <p><strong>Campground Type:</strong> {decodedType}</p>
              <p><strong>Campground Amenities:</strong> {decodedAmenities}</p>
              <p><strong>Phone:</strong> {camp?.phoneNumber || 'N/A'}</p>
              <p><strong>Number of Sites:</strong> {camp?.numSites || 'N/A'}</p>
              <p><strong>Dates Open:</strong> {camp?.datesOpen || 'N/A'}</p>
              <Link to="/">Back</Link>
            </div>
          </div>

          {/* Similar Campgrounds */}
          <div className="similar-campgrounds">
            <h2>Similar Campgrounds</h2>
            <div className="campgrounds">
              {similarCamps.length > 0 ? (
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
      )}
    </div>
  );
};

export default CampView;