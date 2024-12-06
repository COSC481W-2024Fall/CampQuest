import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import ImageCache from '../util/imageCache';
const saveState = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const loadState = (key, defaultValue) => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
};

const CampList = () => {
  const [camps, setCamp] = useState([]);
  const [campImages, setCampImages] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const campsPerPage = 12;

  const statesList = [
    { code: 'AL', label: 'Alabama' },
    { code: 'AK', label: 'Alaska' },
    { code: 'AZ', label: 'Arizona' },
    { code: 'AR', label: 'Arkansas' },
    { code: 'CA', label: 'California' },
    { code: 'CO', label: 'Colorado' },
    { code: 'CT', label: 'Connecticut' },
    { code: 'DE', label: 'Delaware' },
    { code: 'FL', label: 'Florida' },
    { code: 'GA', label: 'Georgia' },
    { code: 'HI', label: 'Hawaii' },
    { code: 'ID', label: 'Idaho' },
    { code: 'IL', label: 'Illinois' },
    { code: 'IN', label: 'Indiana' },
    { code: 'IA', label: 'Iowa' },
    { code: 'KS', label: 'Kansas' },
    { code: 'KY', label: 'Kentucky' },
    { code: 'LA', label: 'Louisiana' },
    { code: 'ME', label: 'Maine' },
    { code: 'MD', label: 'Maryland' },
    { code: 'MA', label: 'Massachusetts' },
    { code: 'MI', label: 'Michigan' },
    { code: 'MN', label: 'Minnesota' },
    { code: 'MS', label: 'Mississippi' },
    { code: 'MO', label: 'Missouri' },
    { code: 'MT', label: 'Montana' },
    { code: 'NE', label: 'Nebraska' },
    { code: 'NV', label: 'Nevada' },
    { code: 'NH', label: 'New Hampshire' },
    { code: 'NJ', label: 'New Jersey' },
    { code: 'NM', label: 'New Mexico' },
    { code: 'NY', label: 'New York' },
    { code: 'NC', label: 'North Carolina' },
    { code: 'ND', label: 'North Dakota' },
    { code: 'OH', label: 'Ohio' },
    { code: 'OK', label: 'Oklahoma' },
    { code: 'OR', label: 'Oregon' },
    { code: 'PA', label: 'Pennsylvania' },
    { code: 'RI', label: 'Rhode Island' },
    { code: 'SC', label: 'South Carolina' },
    { code: 'SD', label: 'South Dakota' },
    { code: 'TN', label: 'Tennessee' },
    { code: 'TX', label: 'Texas' },
    { code: 'UT', label: 'Utah' },
    { code: 'VT', label: 'Vermont' },
    { code: 'VA', label: 'Virginia' },
    { code: 'WA', label: 'Washington' },
    { code: 'WV', label: 'West Virginia' },
    { code: 'WI', label: 'Wisconsin' },
    { code: 'WY', label: 'Wyoming' },
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
    { code: '23ft', label: '23 Feet Max RV Length' },
    { code: "40ft", label: '40 Feet Max RV Length'},
    { code: "45ft", label: '45 Feet Max RV Length'},
    { code: "50ft", label: '50 Feet Max RV Length'},
    { code: "60ft", label: '60 Feet Max RV Length'},
    { code: "100ft", label: '100 Feet Max RV Length'},
    { code: 'DP', label: 'Dump Station' },
    { code: 'ND', label: 'No Dump Station' },
    { code: 'FT', label: 'Flush Toilets' },
    { code: 'VT', label: 'Vault Toilets' },
    { code: 'PT', label: 'Pit Toilets' },
    { code: 'NT', label: 'No Toilets' },
    { code: 'FTVT', label: 'Flush and Vault Toilets' },
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

  const handleSearchFormSubmit = (event) => {
    event.preventDefault();

    const searchValue = event.target.search.value.trim();

    if (searchValue !== searchTerm) {
      setSearchTerm(searchValue)
    }
  }

  const fetchCampImage = async (campName, campState) => {
    const cacheKey = `${campName},${campState}`;
    
    if (ImageCache.has(cacheKey)) {
      return ImageCache.get(cacheKey);
    }
  
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/camps/image`, {
        params: { query: `${campName}, ${campState} campground` }
      });
  
      const imageUrl = response.data.imageUrl;
      if (imageUrl) {
        ImageCache.set(cacheKey, imageUrl); // Cache the fetched URL
      }
      return imageUrl;
    } catch (error) {
      console.error('Error fetching camp image:', error);
      return null;
    }
  };
  
  
  // In your fetchCamps method, update the image fetching logic
  const fetchCamps = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/camps`, {
        params: {
          q: searchTerm,
          amenities: selectedAmenities.join(','),
          types: selectedTypes.join(','),
          states: selectedStates.join(','),
          page,
          limit: campsPerPage
        }
      });
  
      const campgrounds = Array.isArray(response.data.campgrounds) ? response.data.campgrounds : [];
      setCamp(campgrounds);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(page);
  
      // Fetch images for each campground
      const imagePromises = campgrounds.map(async (camp) => {
        const imageUrl = await fetchCampImage(camp.campgroundName, camp.state);
        return { [camp._id]: imageUrl };
      });
  
      const imageResults = await Promise.all(imagePromises);
      const imagesMap = imageResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setCampImages(imagesMap);
    } catch (error) {
      console.error('Error fetching campgrounds:', error);
      setCamp([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    setSearchTerm(loadState('searchTerm', ""));
    setSelectedAmenities(loadState('selectedAmenities', []));
    setSelectedTypes(loadState('selectedTypes', []));
    setCurrentPage(loadState('currentPage', 1));
  }, []);

  useEffect(() => {
    fetchCamps(currentPage);
  }, [searchTerm, selectedAmenities, selectedTypes, currentPage, selectedStates]);

  useEffect(() => {
    saveState('searchTerm', searchTerm);
    saveState('selectedAmenities', selectedAmenities);
    saveState('selectedTypes', selectedTypes);
    saveState('currentPage', currentPage);
  }, [searchTerm, selectedAmenities, selectedTypes, currentPage]);

  const handleFilterChange = (value, setter) => {
    setter(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
  };

  const changePage = (direction) => {
    const newPage = currentPage + direction;
    if (newPage > 0 && newPage <= totalPages) {
      fetchCamps(newPage);
    }
  };

  const DropdownCheckbox = ({ label, options, selected, setSelected }) => {
    const [open, setOpen] = useState(false);

    return (
      <div className="dropdown-checkbox">
        <button className="dropdown-button" onClick={() => setOpen(!open)}>
          {label} {selected.length > 0 && `(${selected.length})`}
        </button>
        {open && (
          <div className="dropdown-menu" onBlur={() => setOpen(false)} tabIndex={0}>
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
      <form onSubmit={handleSearchFormSubmit}>
        <input
          className="searchText"
          type="text"
          name="search"
          placeholder="Search camps by name..."
          defaultValue={searchTerm}
        />
        <button type="submit">Search</button>
      </form>

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
        <DropdownCheckbox
          label="Filter by State"
          options={statesList}
          selected={selectedStates}
          setSelected={setSelectedStates}
        />
        <button
          className="clear-filters"
          onClick={() => {
            setSearchTerm("");
            setSelectedAmenities([]);
            setSelectedTypes([]);
            setCurrentPage(1);
            saveState('searchTerm', "");
            saveState('selectedAmenities', []);
            saveState('selectedTypes', []);
            fetchCamps(1);
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
            camps.map(camp => {
              const campImage = campImages[camp._id] || 
                `https://random.imagecdn.app/v1/image?width=300&height=200&category=nature&format=image&unique=${camp._id}`;

              return (
                <Link to={`/view/${camp._id}`} key={camp._id}>
                  <div className="camp-card"
                    style={{
                      backgroundImage: `url(${campImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}>
                    <div className="camp-info">
                      <h2 className="camp-title">{camp.campgroundName}</h2>
                      <h4 className="camp-cord">
                        City: {camp.city} | State: {camp.state} | Type: {campgroundTypeList.find(type => type.code === camp.campgroundType)?.label || camp.campgroundType}
                      </h4>
                    </div>
                  </div>
                </Link>
              )
            })
          ) : (
            <p>No camps available</p>
          )}
        </div>
      )}

      <div className="pagination">
        <button onClick={() => changePage(-1)} disabled={currentPage === 1}>
          &lt;
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => changePage(1)} disabled={currentPage === totalPages}>
          &gt;
        </button>
      </div>
    </div>
  );
};

export default CampList;
