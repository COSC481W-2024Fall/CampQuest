import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const saveState = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const loadState = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
};

const CampList = () => {
    const [camps, setCamp] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const campsPerPage = 12;

    const campgroundTypeList = [
        { code: 'cp', label: 'County Park' },
        { code: 'coe', label: 'Corps of Engineers' },
        { code: 'np', label: 'National Park' },
        { code: 'nf', label: 'National Forest' },
        { code: 'sp', label: 'State Park' },
        { code: 'pp', label: 'Provincial Park' },
        { code: 'rv', label: 'RV Park' },
        { code: 'bml', label: 'Bureau of Land Management' },
    ];

    const amenitiesList = [
        { code: 'nh', label: 'No Hookups' },
        { code: 'e', label: 'Electric' },
        { code: 'we', label: 'Water & Electric' },
        { code: 'wes', label: 'Water, Electric & Sewer' },
        { code: 'dp', label: 'Dump' },
        { code: 'ft', label: 'Flush Toilets' },
        { code: 'vt', label: 'Vault Toilets' },
        { code: 'dw', label: 'Drinking Water' },
        { code: 'sh', label: 'Showers' },
        { code: 'rs', label: 'Accepts Reservations' },
        { code: 'pa', label: 'Pets Allowed' },
    ];

    const fetchCamps = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/camps`, {
                params: {
                    amenities: selectedAmenities.join(','),
                    types: selectedTypes.join(','),
                    page,
                    limit: campsPerPage,
                },
            });
            setCamp(response.data.campgrounds || []);
            setTotalPages(response.data.totalPages || 1);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching campgrounds:', error);
            setCamp([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const savedSearchTerm = loadState('searchTerm', '');
        const savedAmenities = loadState('selectedAmenities', []);
        const savedTypes = loadState('selectedTypes', []);
        const savedPage = loadState('currentPage', 1);

        setSearchTerm(savedSearchTerm);
        setSelectedAmenities(savedAmenities);
        setSelectedTypes(savedTypes);
        fetchCamps(savedPage);
    }, []);

    useEffect(() => {
        saveState('searchTerm', searchTerm);
        saveState('selectedAmenities', selectedAmenities);
        saveState('selectedTypes', selectedTypes);
        saveState('currentPage', currentPage);
    }, [searchTerm, selectedAmenities, selectedTypes, currentPage]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchCamps(1);
    };

    const handleFilterChange = (value, setter) => {
        setter(prev => (prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]));
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedAmenities([]);
        setSelectedTypes([]);
        setCurrentPage(1);
        fetchCamps(1);
    };

    const nextPage = () => currentPage < totalPages && fetchCamps(currentPage + 1);
    const prevPage = () => currentPage > 1 && fetchCamps(currentPage - 1);

    return (
        <div className="camp-list">
            <form onSubmit={handleSearchSubmit}>
                <input
                    type="text"
                    placeholder="Search camps by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>

            <div className="filters">
                <DropdownCheckbox
                    label="Amenities"
                    options={amenitiesList}
                    selected={selectedAmenities}
                    setSelected={setSelectedAmenities}
                />
                <DropdownCheckbox
                    label="Campground Types"
                    options={campgroundTypeList}
                    selected={selectedTypes}
                    setSelected={setSelectedTypes}
                />
                <button onClick={clearFilters}>Clear Filters</button>
            </div>

            {loading ? (
                <p>Loading camps...</p>
            ) : (
                <div className="camp-cards-container">
                    {camps.length > 0 ? (
                        camps.map((camp) => (
                            <Link to={`/view/${camp._id}`} key={camp._id}>
                                <div className="camp-card">
                                    <h2>{camp.campgroundName}</h2>
                                    <p>{camp.city}, {camp.state}</p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p>No camps found</p>
                    )}
                </div>
            )}

            <div className="pagination">
                <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
                <span>{currentPage} / {totalPages}</span>
                <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
            </div>
        </div>
    );
};

const DropdownCheckbox = ({ label, options, selected, setSelected }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="dropdown">
            <button onClick={() => setOpen(!open)}>
                {label} {selected.length > 0 && `(${selected.length})`}
            </button>
            {open && (
                <div className="dropdown-menu">
                    {options.map(option => (
                        <label key={option.code}>
                            <input
                                type="checkbox"
                                value={option.code}
                                checked={selected.includes(option.code)}
                                onChange={() => setSelected(prev => prev.includes(option.code)
                                    ? prev.filter(item => item !== option.code)
                                    : [...prev, option.code]
                                )}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CampList;
