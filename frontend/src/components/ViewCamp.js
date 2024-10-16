import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import '../App.css';

const CampView = () => {
  const { id } = useParams(); // Get the campground ID from the URL
  const [camp, setCamp] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/camps/${id}`)
      .then(response => {
        setCamp(response.data);
      })
      .catch((error) => {
        console.log('Error fetching campground details:', error);
      });
  }, [id]);

  return (
    <div className="camp-container">
      {camp ? (
        <div className="camp-details">
          <h1>{camp.name}</h1>
          <p><strong>Location:</strong> {camp.latitude}, {camp.longitude}</p>
          <p><strong>City:</strong> {camp.city}</p>
          <p><strong>State:</strong> {camp.state}</p>
          <p><strong>Campground Type:</strong> {camp.type}</p>
          <p><strong>Phone:</strong> {camp.phone}</p>
          <p><strong>Number of Sites:</strong> {camp.numSites}</p>
          <p><strong>Dates Open:</strong> {camp.datesOpen || 'N/A'}</p>
          <Link to={"/"}>Back</Link>
        </div>
      ) : (
        <p>Loading camp details...</p>
      )}
    </div>
  );
  
}

export default CampView;
