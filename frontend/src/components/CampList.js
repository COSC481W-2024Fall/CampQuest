import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const CampList = () => {
  const [camps, setCamp] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const campsPerPage = 12;

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

  const fetchCamps = async (page = 1, term = "") => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/camps/search`, {
        params: {
          q: term,
          page,
          limit: campsPerPage,
        },
      });
      const campgrounds = Array.isArray(response.data.campgrounds) ? response.data.campgrounds : [];
      setCamp(campgrounds);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching campgrounds:', error);
      setCamp([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch camps when `submittedSearchTerm` or `currentPage` changes
  useEffect(() => {
    fetchCamps(currentPage, submittedSearchTerm);
  }, [submittedSearchTerm, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSubmittedSearchTerm(searchTerm); // Trigger search with the submitted term
    setCurrentPage(1); // Reset to first page
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
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
      <form onSubmit={handleSearchSubmit}>
        <input
          className="searchText"
          type="text"
          placeholder="Search camps by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Update search term
        />
        <button type="submit">Search</button>
      </form>

      {loading ? (
        <p>Loading camps...</p>
      ) : (
        <div className="camp-cards-container">
          {camps.length > 0 ? (
            camps.map((camp) => {
              const decodedType = campgroundTypeMap[camp.campgroundType] || camp.campgroundType;
              return (
                <Link to={`/view/${camp._id}`} key={camp._id}>
                  <div className="camp-card">
                    <div className="camp-info">
                      <h2 className="camp-title">{camp.campgroundName}</h2>
                      <h4 className="camp-cord">
                        City: {camp.city} | State: {camp.state} | Type: {decodedType}
                      </h4>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <p>No camps available</p>
          )}
        </div>
      )}

      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1}>
          &lt;
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>
          &gt;
        </button>
      </div>
    </div>
  );
};

export default CampList;
