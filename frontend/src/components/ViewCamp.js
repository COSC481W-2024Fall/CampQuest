import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useParams, Link } from 'react-router-dom';
import '../App.css';
import '../DetailsPage.css';
import ReviewList from './reviews/ReviewList';

const CampView = () => {
  console.log("hello from campview.")

  const { id } = useParams(); // Get the campground ID from the URL
  const [camp, setCamp] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [campsList, setCampList] = useState([]);

  //load camp from the database
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
    PA: 'Pets Aloowed',
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
    ?.split(' ')
    .map(code => amenitiesMap[code] || code)
    .join(', ');

  // Decode campground type
  const decodedType = campgroundTypeMap[camp?.campgroundType] || camp?.campgroundType;
  const mapContainerStyle = {
    width: '100%',
    height: '300px',
  };

  const center = camp ? {
    lat: parseFloat(camp.latitude),
    lng: parseFloat(camp.longitude)
  } : { lat: 0, lng: 0 }; // Fallback center

  //load campgrounds from the database
  useEffect(() => {
    axios.get('${process.env.REACT_APP_API_URL}/camps/')
      .then(response => {
        setCampList(response.data);
      })
      .catch((error) => {
        console.log('Error fetching similar campgrounds:', error);
      });
  }, []);  

//find similarity of all campsites
let similarCamps = findSimilar(camp, campsList);

//return html for the page
return(
    <div className="view-camp-container">
      {/* wait until camp details are loaded to display the camp */}
      {(camp)? (
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
              <p><strong>Campground Type:</strong> {camp.campgroundType}</p>
              <p><strong>Phone:</strong> {camp.phoneNumber}</p>
              <p><strong>Number of Sites:</strong> {camp.numSites}</p>
              <p><strong>Dates Open:</strong> {camp.datesOpen || 'N/A'}</p>
              <Link to={"/"}>Back</Link>
            </div>
          </div>

          {/* Review Section */}
          <div className="review-section">
            <h2>Leave a Review</h2>
            <ReviewList campgroundId={id} />
          </div>

        {/* Similar Campgrounds */}
        <div className = "similar-campgrounds">
          <h2> Similar Campgrounds </h2>
          <div className = "campgrounds">

          {/*render empty similar campgrounds until similar campgrounds are found (loaded)*/}

          { similarCamps[1] ?
          (  <>
            <Link to = {"/view/" + similarCamps[1]._id} ><div className = "camping-card">{similarCamps[1].campgroundName}</div></Link>
            <Link to = {"/view/" + similarCamps[2]._id} ><div className = "camping-card">{similarCamps[2].campgroundName}</div></Link>
            <Link to = {"/view/" + similarCamps[3]._id} ><div className = "camping-card">{similarCamps[3].campgroundName}</div></Link>
            <Link to = {"/view/" + similarCamps[4]._id} ><div className = "camping-card">{similarCamps[4].campgroundName}</div></Link>
          </>
          ) : (
            <>
            <div className = "camping-card">Loading Camp 1</div>
            <div className = "camping-card">Loading Camp 2</div>
            <div className = "camping-card">Loading Camp 3</div>
            <div className = "camping-card">Loading Camp 4</div>
            </>
          ) }
          </div>
        </div> 
        </> 
      ) : (
        <p>Loading camp details...</p>
      )}
      
    </div>
    );
  }
export default CampView;

//Find the similarity scores of all campgrounds, sort the camp list based on similarity.
function findSimilar(self, others){

  //map similarity onto the camp list
  let campSimilarity =  others.map( othr=> {
    //find distance between two camps
    let distance = computeDistance(self.latitude, self.longitude, othr.latitude, othr.longitude);
    let ammenityScore = computeAmmenities(self, othr)
    let similarScore = distance + ammenityScore*7.5
    return {_id: othr._id, campgroundName: othr.campgroundName, campgroundCode: othr.campgroundCode,longitude: 
      othr.longitude, latitude: othr.latitude, phoneNumber: othr.phoneNumber, campgroundType: othr.campgroundType,
      numSites: othr.numSites, datesOpen: othr.datesOpen, similarity: similarScore}
  });
  //then sort the camp list by similarity
  campSimilarity.sort((a, b) => a.similarity - b.similarity);
  return campSimilarity
}

//find ammenities score based on number of missing ammenities.
function computeAmmenities(self, other){
  let score = 0
  let campAmmenities = self.amenities.split(" ")

  if( other.amenities){
    let otherAmmenites = other.amenities.split(" ")
    let ammenityFound = false;

    for(let i = 0; i < campAmmenities.length; i++){
      ammenityFound = false;
      let ammenity = campAmmenities[i]
      for(let j =0; j < otherAmmenites.length; j++){
        if (ammenity == otherAmmenites[j]){
          ammenityFound = true
        }
      }
      if (!ammenityFound){
        score +=1
      }
    }
  }

  return score;
}

//compute the distance between two georaphical points.
function computeDistance(latCurr, longCurr, latCamp, longCamp){
  let dist= Math.acos((Math.sin(findRadians(latCurr)) * Math.sin(findRadians(latCamp))) + (Math.cos(findRadians(latCurr)) * Math.cos(findRadians(latCamp))) * (Math.cos(findRadians(longCamp) - findRadians(longCurr)))) * 6371
  return dist
}

// convert degrees to radians.
function findRadians(degrees)
{
  let rads = degrees *(Math.PI/180);
  return rads;
}

