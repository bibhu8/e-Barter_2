// StarRating.jsx
import React from "react";

const StarRating = ({ rating, onChange }) => {
  const totalStars = 5;
  return (
    <div style={{ display: "inline-block" }}>
      {[...Array(totalStars)].map((_, i) => {
        const starValue = i + 1;
        return (
          <span
            key={starValue}
            style={{
              cursor: "pointer",
              color: starValue <= rating ? "gold" : "lightgray",
              fontSize: "1.5rem",
              marginRight: "3px",
            }}
            onClick={() => onChange(starValue)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
