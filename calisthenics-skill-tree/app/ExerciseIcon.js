'use client'

import { useState } from 'react';
import { theme } from './theme';

// Renders an exercise image, falling back to the exercise's initials on a
// teal disc if the image is missing or fails to load (e.g. an admin-added
// exercise without an icon yet).
export default function ExerciseIcon({ src, name, className = '', style = {} }) {
  const [errored, setErrored] = useState(false);

  const initials = (name || '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  if (!src || errored) {
    return (
      <div
        className={`flex items-center justify-center font-bold ${className}`}
        style={{
          backgroundColor: theme.accent.primary,
          color: '#04201f',
          borderRadius: '9999px',
          ...style,
        }}
        aria-hidden="true"
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setErrored(true)}
      className={className}
      style={{ filter: 'brightness(1.2)', ...style }}
    />
  );
}
