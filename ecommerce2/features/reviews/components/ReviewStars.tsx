'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface ReviewStarsProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
}

export function ReviewStars({
  rating,
  onRatingChange,
  interactive = false,
}: ReviewStarsProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, idx) => {
        const starValue = idx + 1;
        const isFilled = starValue <= rating;

        return (
          <button
            key={idx}
            type="button"
            disabled={!interactive}
            onClick={() => onRatingChange && onRatingChange(starValue)}
            className={`p-0.5 rounded-sm transition-transform duration-150 ${
              interactive ? 'cursor-pointer hover:scale-115 active:scale-95 disabled:cursor-not-allowed' : ''
            }`}
          >
            <Star
              className={`w-5 h-5 ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-200 fill-transparent'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
