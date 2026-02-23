'use client'

import { theme } from '../theme';
import { exercises } from '../exercises-data';

export default function ProfilePage() {
  // TEST DATA - Placeholder data for testing
  const userData = {
    name: "Salman Aldakheel",           // Placeholder name
    initials: "SA",              // Placeholder initials
    totalExercises: exercises.length,          // TOTAL EXCERSICES (add logic here later to import from excersie data sheet you make later)
    completedExercises: 0,      
  };


  return (

  <div 
    className="min-h-screen"
    style={{ backgroundColor: theme.background.primary }}
  >
    <div className="max-w-4xl mx-auto px-6 py-12">
      
      {/* HEADER SECTION */}
      <div className="flex items-center gap-6 mb-12">
        
        {/* AVATAR ICON */}
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
          style={{ 
            backgroundColor: theme.background.tertiary,
            color: theme.text.primary 
          }}
        >
          {userData.initials}
        </div>

        {/* NAME*/}
        <div>
          <h1 
            className="text-3xl font-bold mb-1"
            style={{ color: theme.text.primary }}
          >
            {userData.name}
          </h1>
          <p style={{ color: theme.text.tertiary }}>
            {userData.completedExercises} / {userData.totalExercises} exercises completed
          </p>
        </div>
        {/* STATS*/}
        <div 
        className="rounded-lg p-6 mb-8"
        style={{ 
            backgroundColor: theme.background.secondary,
            border: `1px solid ${theme.border.default}`
        }}
        >
        <div className="text-center">
            {/* Big number showing completed exercises */}
            <div 
            className="text-5xl font-bold mb-2"
            style={{ color: theme.accent.primary }}
            >
            {userData.completedExercises}
            </div>
            {/* Label */}
            <div style={{ color: theme.text.tertiary }}>
            Exercises Completed
            </div>
        </div>
        {/* BACK BUTTON */}
<div className="mt-8">
  <a 
    href="/"
    className="block w-full text-center py-4 rounded-lg font-semibold transition hover:opacity-85"
    style={{ 
      backgroundColor: theme.background.tertiary,
      color: theme.text.primary
    }}
  >
    Skill Tree
  </a>
</div>
        </div>

      </div>

    </div>
  </div>
);

}