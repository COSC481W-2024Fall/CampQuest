import React, { useState } from 'react';
import axios from 'axios';
import './ReviewForm.css';

const ReviewForm = ({ campgroundId, onReviewSubmitted }) => {
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true); // Disable the button during submission

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/camps/${campgroundId}/reviews`, {
        content: reviewText.trim(), // Trim to remove extra spaces
      });
      setReviewText(''); // Clear the textarea on success
      onReviewSubmitted(); // Refresh the review list
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting review.'); // Handle errors gracefully
    } finally {
      setIsSubmitting(false); // Re-enable the button
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      {error && <p className="error-message">{error}</p>} {/* Display error messages */}
      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Leave a review..."
        required
        aria-label="Review input"
      />
      <button
        type="submit"
        disabled={!reviewText.trim() || isSubmitting} // Disable if empty or submitting
        aria-label="Submit review"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default ReviewForm;
