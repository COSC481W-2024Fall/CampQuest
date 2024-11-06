import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const CampList = () => {
  const [camps, setCamps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const campsPerPage = 12;

  const API_URL = 'https://us-central1-campque-c9b14.cloudfunctions.net/campquest'; // Update the URL

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        setIsLoading(true);
        console.log('Attempting to fetch camps from:', `${API_URL}/camps`);
        
        const response = await axios.get(`${API_URL}/camps`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });
        
        console.log('Response received:', response);

        if (!response.data) {
          throw new Error('No data received from server');
        }

        const campsData = Array.isArray(response.data) ? response.data : [];
        console.log('Processed camps data:', campsData);
        
        setCamps(campsData);
        setError(null);
      } catch (error) {
        console.error('Detailed fetch error:', error);
        setError(`Failed to load camps: ${error.message}`);
        setCamps([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCamps();
  }, []);

  // Filter camps based on search term
  const filteredCamps = camps.filter(camp =>
    camp.campgroundName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastCamp = currentPage * campsPerPage;
  const indexOfFirstCamp = indexOfLastCamp - campsPerPage;
  const currentCamps = filteredCamps.slice(indexOfFirstCamp, indexOfLastCamp);

  // Change page
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredCamps.length / campsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

return (
  <div className="camp-list">

    {/* Search input */}
    <input className="searchText"
      type="text"
      placeholder="Search camps by name..."
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
    />
    
    <div className="camp-cards-container">
      {currentCamps.length > 0 ? (
        currentCamps.map(camp => (
          <Link to = {"/view/" + camp._id} >
          <div key={camp._id} className="camp-card">
            <div className="camp-info">
            <h2 className="camp-title">{camp.campgroundName}</h2>
            <h4 className="camp-cord">City: {camp.city} | State: {camp.state} | Type: {camp.campgroundType}</h4>
              <div className="camp-actions">
                View
              </div>
            </div>
          </div>
          </Link>
        ))
      ) : (
        <p>No camps available</p>
      )}
    </div>

    {/* Pagination */}
    <div className="pagination">
      <button onClick={prevPage} disabled={currentPage === 1}>&lt;</button>
      <span> Page {currentPage} of {Math.ceil(filteredCamps.length / campsPerPage)} </span>
      <button onClick={nextPage} disabled={currentPage === Math.ceil(filteredCamps.length / campsPerPage)}>&gt;</button>
    </div>
  </div>
);


};

export default CampList;