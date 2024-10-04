import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CampgroundList = () => {
  const [campgrounds, setCampgrounds] = useState([]);

  useEffect(() => {
    // Fetch the campgrounds from the backend
    axios.get('/api/campgrounds/')
      .then(response => {
        setCampgrounds(response.data);
      })
      .catch((error) => {
        console.log('Error fetching campgrounds: ', error);
      });
  }, []);

  return (
    <div>
      <h2>Campground List</h2>
      {campgrounds.length === 0 ? (
        <p>No campgrounds available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Location</th>
              <th>Phone</th>
              <th>Type</th>
              <th>Elevation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {campgrounds.map(campground => (
              <tr key={campground._id}>
                <td>{campground._id}</td>
                <td>{campground.name}</td>
                <td>{`${campground.latitude}, ${campground.longitude}`}</td>
                <td>{campground.phone}</td>
                <td>{campground.type}</td>
                <td>{campground.elevation}</td>
                <td>
                  <button onClick={() => handleView(campground._id)}>View</button>
                  <button onClick={() => handleDelete(campground._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const handleView = (id) => {
  // Navigate to the detailed view for the campground (implement routing for this)
  console.log('View details for: ', id);
};

const handleDelete = (id) => {
  axios.delete(`/api/campgrounds/${id}`)
    .then(response => {
      console.log('Deleted: ', response.data);
      window.location.reload();  // Refresh the page to reflect changes
    })
    .catch(error => {
      console.log('Error deleting campground: ', error);
    });
};

export default CampgroundList;
