'use client'

import { theme } from '../../theme';
import { getExerciseById } from '../../exercises-data';
import { use } from 'react';    
//this was a bit complicated, but since it was outside the scope of the project i did use some ai help to assist with the logic here
export default function ExerciseDetailPage({ params }) {
  // get exercise ID from URL
  const unwrappedParams = use(params);
  const exerciseId = parseInt(unwrappedParams.id);
  
  // find the exercise
  const exercise = getExerciseById(exerciseId);

  // if exercise not found, show error
  if (!exercise) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.background.primary }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: theme.text.primary }}>
            Exercise Not Found
          </h1>
          <a 
            href="/exercises"
            className="inline-block px-6 py-3 rounded-lg font-semibold transition hover:opacity-90"
            style={{ 
              backgroundColor: theme.accent.primary,
              color: 'white'
            }}
          >
            Back to All Exercises
          </a>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: theme.background.primary }}
    >
      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* LEFT COLUMN - Exercise Info */}
          <div>
            {/* Icon and Header */}
            <div className="flex items-center gap-6 mb-6">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center p-4 flex-shrink-0"
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

              <div className="flex-1">
                <h1 
                  className="text-3xl font-bold mb-3"
                  style={{ color: theme.text.primary }}
                >
                  {exercise.name}
                </h1>
                
                <div className="flex gap-3">
                  {/* Difficulty Badge */}
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: theme.hoverBox.badge.background,
                      color: theme.hoverBox.badge.text,
                      border: `1px solid ${theme.hoverBox.badge.border}`
                    }}
                  >
                    {exercise.difficulty}
                  </span>

                  {/* Category Badge */}
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-semibold uppercase"
                    style={{
                      backgroundColor: theme.background.tertiary,
                      color: theme.text.secondary,
                      border: `1px solid ${theme.border.default}`
                    }}
                  >
                    {exercise.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div 
              className="rounded-lg p-6"
              style={{ 
                backgroundColor: theme.background.secondary,
                border: `1px solid ${theme.border.default}`
              }}
            >
              <h2 
                className="text-xl font-bold mb-3"
                style={{ color: theme.text.primary }}
              >
                About This Exercise
              </h2>
              <p 
                className="text-base leading-relaxed"
                style={{ color: theme.text.secondary }}
              >
                {exercise.summary}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN - Video */}
          <div>
            <div 
              className="rounded-lg p-6"
              style={{ 
                backgroundColor: theme.background.secondary,
                border: `1px solid ${theme.border.default}`
              }}
            >
              <h2 
                className="text-xl font-bold mb-4"
                style={{ color: theme.text.primary }}
              >
                Video Tutorial
              </h2>
              
              {/* Temporary placeholder for now*/}
              <div 
                className="w-full rounded-lg flex items-center justify-center"
                style={{ 
                  backgroundColor: theme.background.tertiary,
                  border: `2px dashed ${theme.border.default}`,
                  aspectRatio: '16/9'  // this is youtube aspect ratio
                }}
              >
                <div className="text-center px-4">
                  <div 
                    className="text-6xl mb-3"
                    style={{ color: theme.text.tertiary, opacity: 0.3 }}
                  >
                  </div>
                  <p style={{ color: theme.text.tertiary }}>
                    Video coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INSTRUCTIONS SECTION */}
        <div 
          className="rounded-lg p-6 mb-8"
          style={{ 
            backgroundColor: theme.background.secondary,
            border: `1px solid ${theme.border.default}`
          }}
        >
          <h2 
            className="text-xl font-bold mb-4"
            style={{ color: theme.text.primary }}
          >
            How to Perform
          </h2>
          
          {/* Step-by-Step */}
          <div className="mb-6">
            <h3 
              className="text-lg font-semibold mb-3"
              style={{ color: theme.text.primary }}
            >
              Step-by-Step Instructions
            </h3>
            <p style={{ color: theme.text.tertiary }}>
              Instructions will be added here
            </p>
          </div>

          {/* Common Mistakes */}
          <div className="mb-6">
            <h3 
              className="text-lg font-semibold mb-3"
              style={{ color: theme.text.primary }}
            >
              Common Mistakes to Avoid
            </h3>
            <p style={{ color: theme.text.tertiary }}>
              Instructions will be added here
            </p>
          </div>

          {/* Pro Tips */}
          <div className="mb-6">
            <h3 
              className="text-lg font-semibold mb-3"
              style={{ color: theme.text.primary }}
            >
              Pro Tips
            </h3>
            <p style={{ color: theme.text.tertiary }}>
              Instructions will be added here
            </p>
          </div>

          {/* Form Cues */}
          <div>
            <h3 
              className="text-lg font-semibold mb-3"
              style={{ color: theme.text.primary }}
            >
              Form Cues
            </h3>
            <p style={{ color: theme.text.tertiary }}>
              Instructions will be added here
            </p>
          </div>
        </div>

        {/* BACK BUTTON */}
        <div>
          <a 
            href="/exercises"
            className="block w-full text-center py-4 rounded-lg font-semibold transition hover:opacity-90"
            style={{ 
              backgroundColor: theme.background.tertiary,
              color: theme.accent.primary,
            }}
          >
             Back to All Exercises
          </a>
        </div>

      </div>
    </div>
  );
}