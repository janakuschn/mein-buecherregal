// ZIEL-PFAD: src/components/Books/StarRating.jsx
import React from 'react'
import rating1 from '../../assets/ratings/rating-1.png'
import rating2 from '../../assets/ratings/rating-2.png'
import rating3 from '../../assets/ratings/rating-3.png'
import rating4 from '../../assets/ratings/rating-4.png'
import rating5 from '../../assets/ratings/rating-5.png'

export const RATING_IMAGES = [rating1, rating2, rating3, rating4, rating5]

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
          <img src={RATING_IMAGES[star - 1]} alt={`${star} Sterne`} className="star-icon" />
        </span>
      ))}
    </div>
  )
}
