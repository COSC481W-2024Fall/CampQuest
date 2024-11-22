import React, { useState } from 'react';
import axios from 'axios';
import './ReviewForm.css';

const ReviewForm = ({ campgroundId, onReviewSubmitted }) => {
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    axios.post(`${process.env.REACT_APP_API_URL}/camps/${campgroundId}/reviews`, { content: reviewText })
    .then(() => {
      onReviewSubmitted();
      setReviewText('');
    })
    .catch(error => setError(error.response?.data?.message || 'Error submitting review.'));
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      {error && <p className="error-message">{error}</p>} 
      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Leave a review..."
        required
      />
      <button type="submit" disabled={!reviewText.trim()}>Submit</button>
    </form>
  );
};

export default ReviewForm;