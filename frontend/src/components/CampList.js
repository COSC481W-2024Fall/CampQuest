import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const saveState = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const loadState = (key, defaultValue) => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
};

const CampList = () => {
  const [camps, setCamp] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState(loadState('searchTerm', ""));
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState(loadState('selectedAmenities', []));
  const [selectedTypes, setSelectedTypes] = useState(loadState('selectedTypes', []));
  const [loading, setLoading] = useState(true);
  const campsPerPage = 12;

  const fetchCamps = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/camps`, {
        params: {
          q: search,
          amenities: selectedAmenities.join(','),
          types: selectedTypes.join(','),
          page,
          limit: campsPerPage
        }
      });

      const campgrounds = Array.isArray(response.data.campgrounds) ? response.data.campgrounds : [];
      setCamp(campgrounds);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(page);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching campgrounds:', error);
      setCamp([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps(currentPage, submittedSearchTerm);
  }, [currentPage, submittedSearchTerm, selectedAmenities, selectedTypes]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSubmittedSearchTerm(searchTerm);
    setCurrentPage(1);
    saveState('searchTerm', searchTerm);
  };

  const handleFilterChange = (value, setter) => {
    setter(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      }
      return [...prev, value];
    });
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

  useEffect(() => {
    saveState('selectedAmenities', selectedAmenities);
    saveState('selectedTypes', selectedTypes);
    saveState('currentPage', currentPage);
  }, [selectedAmenities, selectedTypes, currentPage]);

  return (
    <div className="camp-list">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit}>
        <input
          className="searchText"
          type="text"
          placeholder="Search camps by name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
  
      {/* Filters */}
      <div className="filters">
        {/* Add DropdownCheckbox components for filters */}
        <button
          className="clear-filters"
          onClick={() => {
            setSearchTerm("");
            setSubmittedSearchTerm("");
            setSelectedAmenities([]);
            setSelectedTypes([]);
            setCurrentPage(1);
            saveState('searchTerm', "");
            saveState('selectedAmenities', []);
            saveState('selectedTypes', []);
            fetchCamps(1, "");
          }}
        >
          Clear Filters
        </button>
      </div>
  
      {loading ? (
        <p>Loading camps...</p>
      ) : (
        <div className="camp-cards-container">
          {camps.length > 0 ? (
            camps.map(camp => (
              <Link to={`/view/${camp._id}`} key={camp._id}>
                <div className="camp-card">
                  <div className="camp-info">
                    <h2 className="camp-title">{camp.campgroundName}</h2>
                    <h4 className="camp-cord">
                      City: {camp.city} | State: {camp.state}
                    </h4>
                    <div className="camp-actions">View</div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p>No camps available</p>
          )}
        </div>
      )}
  
      {/* Pagination */}
      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1}>
          &lt;
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>
          &gt;
        </button>
      </div>
    </div>
  );
};

export default CampList;
