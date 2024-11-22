import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewForm from './ReviewForm';
import './ReviewList.css';

const ReviewList = ({ campgroundId }) => {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/camps/${campgroundId}/reviews?page=${currentPage}`)
      .then(response => {
        setReviews(response.data.reviews);
        setTotalPages(response.data.totalPages);
      })
      .catch(error => setError(error.response?.data?.message || 'Error fetching updated reviews.'));
  }, [campgroundId, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleReviewSubmitted = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/camps/${campgroundId}/reviews?page=${currentPage}`)
    .then(response => {
      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
    })
    .catch(error => setError(error.response?.data?.message || 'Error fetching updated reviews.'));
  };
  
  return (
    <div className="review-list">
      {error && <p className="error-message">{error}</p>}
      <ReviewForm campgroundId={campgroundId} onReviewSubmitted={handleReviewSubmitted} />
      {reviews.map(review => (
        <div key={review.campgroundId} className="review">
          <p>{review.content}</p>
        </div>
      ))}
      <div className="pagination">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            disabled={currentPage === index + 1}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;