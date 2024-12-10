import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useParams, Link } from 'react-router-dom';
import '../ViewCamp.css';
import '../DetailsPage.css';
import ReviewList from './reviews/ReviewList';
const CampView = () => {
  const { id } = useParams();
  const [camp, setCamp] = useState(null);
  const [similarCamps, setSimilarCamps] = useState([]);

  const amenitiesMap = {
    E: 'Electric',
    WE: 'Water & Electric',
    WES: 'Water, Electric & Sewer',
    L$: 'Free or under $12',
    DW: 'Drinking Water',
    NW: 'No Drinking Water',
    SH: 'Showers',
    NS: 'No Showers',
    RS: 'Accepts Reservations',
    NR: 'No Reservations',
    PA: 'Pets Allowed',
    NP: 'No Pets Allowed',
    "23ft": '23 Feet Max RV Length',
    "40ft": '40 Feet Max RV Length',
    "45ft": '45 Feet Max RV Length',
    "50ft": '50 Feet Max RV Length',
    "60ft": '60 Feet Max RV Length',
    "100ft": '100 Feet Max RV Length',
    NH: 'No Hookups',
    DP: 'Dump Station',
    ND: 'No Dump Station',
    PT: 'Pit Toilet',
    FT: 'Flush Toilets',
    NT: 'No Toilets',
    VT: 'Vault Toilet',
    FTVT: 'Flush and Vault Toilets'
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

  const statesMap = {
    AL: "Alabama",
    AK: "Alaska",
    AZ: "Arizona",
    AR: "Arkansas",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DE: "Delaware",
    FL: "Florida",
    GA: "Georgia",
    HI: "Hawaii",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    IA: "Iowa",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    ME: "Maine",
    MD: "Maryland",
    MA: "Massachusetts",
    MI: "Michigan",
    MN: "Minnesota",
    MS: "Mississippi",
    MO: "Missouri",
    MT: "Montana",
    NE: "Nebraska",
    NV: "Nevada",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NY: "New York",
    NC: "North Carolina",
    ND: "North Dakota",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PA: "Pennsylvania",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VT: "Vermont",
    VA: "Virginia",
    WA: "Washington",
    WV: "West Virginia",
    WI: "Wisconsin",
    WY: "Wyoming",
  };

  const mapContainerStyle = {
    width: '100%',
    height: '300px',
  };

  // Decode amenities
  const decodeAmenities = (amenities) =>
    amenities
      ?.split(' ')
      .map((code) => amenitiesMap[code] || code)
      .join(', ') || 'N/A';

  // Decode campground type
  const decodeType = (type) => campgroundTypeMap[type] || 'N/A';

  // Fetch camp details
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/camps/${id}`)
      .then((response) => {
        setCamp(response.data);
      })
      .catch((error) => console.error('Error fetching campground details:', error));
  }, [id]);

  // Fetch similar campgrounds  
  useEffect(() => {
    if (camp) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/camps/nearest?lat=${camp.latitude}&lon=${camp.longitude}&id=${id}`)
        .then((response) => {
          setSimilarCamps(response.data.closestCamps);
        })
        .catch((error) => console.error('Error fetching similar campgrounds:', error));
    }
  }, [camp, id]);

  const center = camp
    ? {
        lat: parseFloat(camp.latitude),
        lng: parseFloat(camp.longitude),
      }
    : { lat: 0, lng: 0 };

  return (
    <div className="view-camp-container">
      {camp ? (
        <>
          {/* Map and Camp Details */}
          <div className="map-camp-section">
            <div className="map-container">
              <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={10}>
                  <Marker position={center} />
                </GoogleMap>
              </LoadScript>
            </div>
            <div className="camp-details">
              <h1>{camp.campgroundName}</h1>
              <p><strong>Location:</strong> {camp.latitude || 'N/A'}, {camp.longitude || 'N/A'}</p>
              <p><strong>City:</strong> {camp.city || 'N/A'}</p>
              <p><strong>State:</strong> {camp.state && statesMap[camp.state] ? statesMap[camp.state] : 'N/A'}</p>
              <p><strong>Campground Type:</strong> {decodeType(camp.campgroundType)}</p>
              <p><strong>Campground Amenities:</strong> {decodeAmenities(camp.amenities)}</p>
              <p><strong>Phone:</strong> {camp.phoneNumber || 'N/A'}</p>
              <p><strong>Number of Sites:</strong> {camp.numSites || 'N/A'}</p>
              <p><strong>Dates Open:</strong> {camp.datesOpen || 'N/A'}</p>
              <Link to="/">Back</Link>
            </div>
          </div>
          <div className="review-section">
            <h2>Leave a Review</h2>
            <ReviewList campgroundId={id} />
          </div>
          {/* Similar Campgrounds */}
          <div data-testid = "similar-camps" className="similar-campgrounds">
            <h2>Nearby Campgrounds</h2>
            <div className="campgrounds">
              {similarCamps.length > 0 ? (
                similarCamps.map((similarCamp) => (
                  <Link to={`/view/${similarCamp._id}`} key={similarCamp._id}>
                    <div className="similar-camp-card">
                      <h3 data-testid="similar-camp-name">{similarCamp.campgroundName}</h3>
                      <p>{similarCamp.city}, {similarCamp.state}</p>
                      <p>{decodeType(similarCamp.campgroundType)}</p>
                      </div>
                  </Link>
                ))
              ) : (
                <p>Loading similar campgrounds...</p>
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
