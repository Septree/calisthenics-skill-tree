'use client'

import { theme } from '../theme';
import { exercises } from '../exercises-data';

export default function ExercisesPage() {
  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: theme.background.primary }}
    >
      {/* PAGE HEADER */}
      <div 
        className="border-b"
        style={{ 
          backgroundColor: theme.background.secondary,
          borderColor: theme.border.default 
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: theme.text.primary }}
          >
            All Exercises
          </h1>
          <p style={{ color: theme.text.tertiary }}>
            Browse all {exercises.length} exercises in the skill tree
          </p>
        </div>
      </div>

      {/* EXERCISES GRID */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* LOOP THROUGH EACH EXERCISE */}
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="rounded-lg p-6 transition-all duration-200"
              style={{
                backgroundColor: theme.background.secondary,
                border: `1px solid ${theme.border.default}`,
              }}
            >
              {/* EXERCISE ICON */}
              <div className="flex justify-center mb-4">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center p-3"
                  style={{ 
                    backgroundColor: theme.background.tertiary,
                    border: `2px solid ${theme.border.light}`
                  }}
                >
                  <img 
                    src={exercise.icon}
                    alt={exercise.name}
                    className="w-full h-full object-contain"
                    style={{ filter: 'brightness(1.2)' }}
                  />
                </div>
              </div>

              {/* EXERCISE NAME */}
              <h3 
                className="text-lg font-bold text-center mb-2"
                style={{ color: theme.text.primary }}
              >
                {exercise.name}
              </h3>

              {/* DIFFICULTY BADGE */}
              <div className="flex justify-center mb-3">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: theme.hoverBox.badge.background,
                    color: theme.hoverBox.badge.text,
                    border: `1px solid ${theme.hoverBox.badge.border}`
                  }}
                >
                  {exercise.difficulty}
                </span>
              </div>

              {/* CATEGORY TAG */}
              <div className="flex justify-center mb-3">
                <span 
                  className="text-xs uppercase tracking-wide"
                  style={{ color: theme.text.tertiary }}
                >
                  {exercise.category}
                </span>
              </div>

              {/* SUMMARY */}
              <p 
                className="text-sm text-center line-clamp-2"
                style={{ color: theme.text.secondary }}
              >
                {exercise.summary}
              </p>
            </div>
          ))}

        </div>

        {/* BACK BUTTON */}
        <div className="mt-8">
          <a 
            href="/"
            className="block w-full text-center py-4 rounded-lg font-semibold transition hover:opacity-90"
            style={{ 
              backgroundColor: theme.background.tertiary,
              color: theme.accent.primary,
            }}
          >
            Back to Skill Tree
          </a>
        </div>
      </div>
    </div>
  );
}