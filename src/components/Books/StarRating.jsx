// ZIEL-PFAD: src/components/Books/StarRating.jsx
import React from 'react'

export default function StarRating({ rating = 0, onChange, readOnly = false, size = 'normal' }) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <div className={`star-rating star-rating-${size} ${readOnly ? 'star-rating-readonly' : ''}`}>
      {stars.map((star) => (
        <span
          key={star}
          className={`star ${star <= rating ? 'star-filled' : 'star-empty'}`}
          onClick={() => !readOnly && onChange && onChange(star)}
        >
          ★
        </span>
      ))}
    </div>
  )
}
