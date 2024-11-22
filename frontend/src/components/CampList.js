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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const campsPerPage = 12;
  const [selectedStates, setSelectedStates] = useState([]);

  const statesList = [
    { code: 'AL', label: 'Alabama' },
    { code: 'AK', label: 'Alaska' },
    { code: 'AZ', label: 'Arizona' },
    { code: 'AR', label: 'Arkansas' },
    { code: 'CA', label: 'California' },
    // Add all states as needed
  ];
  const campgroundTypeList = [
    { code: 'CP', label: 'County Park' },
    { code: 'COE', label: 'Corps of Engineers' },
    { code: 'NP', label: 'National Park' },
    { code: 'NF', label: 'National Forest' },
    { code: 'SP', label: 'State Park' },
    { code: 'PP', label: 'Provincial Park' },
    { code: 'RV', label: 'RV Park' },
    { code: 'BML', label: 'Bureau of Land Management' }
  ];

  const amenitiesList = [
    { code: 'NH', label: 'No Hookups' },
    { code: 'E', label: 'Electric' },
    { code: 'WE', label: 'Water & Electric' },
    { code: 'WES', label: 'Water, Electric & Sewer' },
    { code: 'DP', label: 'Dump' },
    { code: 'ND', label: 'No Dump' },
    { code: 'FT', label: 'Flush Toilets' },
    { code: 'VT', label: 'Vault Toilets' },
    { code: 'PT', label: 'Pit Toilets' },
    { code: 'NT', label: 'No Toilets' },
    { code: 'DW', label: 'Drinking Water' },
    { code: 'NW', label: 'No Drinking Water' },
    { code: 'SH', label: 'Showers' },
    { code: 'NS', label: 'No Showers' },
    { code: 'RS', label: 'Accepts Reservations' },
    { code: 'NR', label: 'No Reservations' },
    { code: 'PA', label: 'Pets Allowed' },
    { code: 'NP', label: 'No Pets Allowed' },
    { code: 'L$', label: 'Free or Under $12' }
  ];

  const fetchCamps = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/camps`, {
        params: {
          q: searchTerm,
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
      console.log('Error fetching campgrounds:', error);
      setCamp([]);
      setLoading(false);
    }
  };

  // Fetch camps on initial load and when filters/search terms change
  useEffect(() => {
    setSearchTerm(loadState('searchTerm', ""));
    setSelectedAmenities(loadState('selectedAmenities', []));
    setSelectedTypes(loadState('selectedTypes', []));
    setCurrentPage(loadState('currentPage', 1));
}, []);

useEffect(() => {
    fetchCamps(currentPage);
}, [searchTerm, selectedAmenities, selectedTypes, currentPage]);
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
      fetchCamps(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      fetchCamps(currentPage - 1);
    }
  };
  useEffect(() => {
    saveState('searchTerm', searchTerm);
    saveState('selectedAmenities', selectedAmenities);
    saveState('selectedTypes', selectedTypes);
    saveState('currentPage', currentPage);
}, [searchTerm, selectedAmenities, selectedTypes, currentPage]);

  const DropdownCheckbox = ({ label, options, selected, setSelected }) => {
    const [open, setOpen] = useState(false);

    return (
      <div className="dropdown-checkbox">
        <button
          className="dropdown-button"
          onClick={() => setOpen(!open)}
        >
          {label} {selected.length > 0 && `(${selected.length})`}
        </button>
        {open && (
          <div 
            className="dropdown-menu" 
            onBlur={() => setOpen(false)}
            tabIndex={0}
          >
            {options.map(option => (
              <label key={option.code} className="dropdown-item">
                <input
                  type="checkbox"
                  value={option.code}
                  checked={selected.includes(option.code)}
                  onChange={() => handleFilterChange(option.code, setSelected)}
                />
                {option.label}
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="camp-list">
      {/* Search Input */}
      <form onSubmit={e => { e.preventDefault(); fetchCamps(1); }}>
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
        <DropdownCheckbox
          label="Filter by Amenities"
          options={amenitiesList}
          selected={selectedAmenities}
          setSelected={setSelectedAmenities}
        />
        <DropdownCheckbox
          label="Filter by Campground Types"
          options={campgroundTypeList}
          selected={selectedTypes}
          setSelected={setSelectedTypes}
        />
        <button
          className="clear-filters"
          onClick={() => {
            setSearchTerm("");
            setSelectedAmenities([]);
            setSelectedTypes([]);
            setSelectedStates([]);
            setCurrentPage(1);
            saveState('searchTerm', "");
            saveState('selectedAmenities', []);
            saveState('selectedTypes', []);
            saveState('selectedStates', []);
            fetchCamps(1);
          }}
        >
          Clear Filters
        </button>
      </div>
      <br />
  
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
                      City: {camp.city} | State: {camp.state} | Type: {campgroundTypeList.find(type => type.code === camp.campgroundType)?.label || camp.campgroundType}
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