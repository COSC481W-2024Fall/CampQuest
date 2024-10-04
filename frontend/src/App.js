import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CampgroundList from './CampgroundLists';


const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/campgrounds">Campgrounds</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/campgrounds" element={<CampgroundList />} />
        </Routes>
      </div>
    </Router>
  );
};

// Home Component
const Home = () => (
  <div>
    <h2>Welcome to the Campground Finder</h2>
    <p>Find and explore various campgrounds near you.</p>
  </div>
);

export default App;
