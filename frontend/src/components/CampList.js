import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const CampList = () => {
  const [camps, setCamp] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");  // New state for search
  const campsPerPage = 12;

  // Fetch campgrounds from backend
  useEffect(() => {
    axios.get('http://localhost:5000/camps/')
      .then(response => {
        setCamp(response.data);
      })
      .catch((error) => {
        console.log('Error fetching campgrounds:', error);
      });
  }, []);

  // Filter camps based on search term
  const filteredCamps = camps.filter(camp =>
    camp.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h2 className="camp-title">{camp.name}</h2>
                <h4 className="camp-cord">City: {camp.city} | State: {camp.state} | Type: {camp.type}</h4>
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
}

export default CampList;
