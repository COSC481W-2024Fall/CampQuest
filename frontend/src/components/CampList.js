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

  // Use the correct Cloud Run URL
  const API_URL = 'https://app-4kzkpiof5q-uc.a.run.app';

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        setIsLoading(true);
        console.log('Attempting to fetch camps from:', `${API_URL}/camps`);
        
        const response = await axios.get(`${API_URL}/camps`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': window.location.origin // Add origin header
          },
          withCredentials: true
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
        console.error('Detailed fetch error:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        setError(`Failed to load camps: ${error.message}`);
        setCamps([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCamps();
  }, []);

  // Rest of your component code remains the same...
};

export default CampList;