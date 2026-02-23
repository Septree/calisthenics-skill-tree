'use client'

import { useState, useMemo } from 'react';
import { theme } from './theme'; 
import { exercises } from './exercises-data';  
export default function Home() {
  const [hoveredExercise, setHoveredExercise] = useState(null);  

  // Calculate container height
  const containerHeight = Math.max(
    800,
    ...exercises.map(ex => ex.position.top + 180)
  );

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: theme.background.primary }}>
      {/* INTRO TEXT */}
      <div className="text-center pt-12 pb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: theme.text.primary }}>
          Calisthenics Skill Tree
        </h1>
        <p className="text-lg" style={{ color: theme.text.tertiary }}>
          Master your body, one move at a time
        </p>
      </div>

      {/* SKILL TREE CONTAINER */}
      <div className="relative max-w-6xl mx-auto pb-12" style={{ minHeight: `${containerHeight}px` }}>
        
        {/* SVG LINES */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {exercises.map((exercise) => {
            return exercise.prerequisites.map((prereqId) => {
              const prereq = exercises.find(e => e.id === prereqId);
              if (!prereq) return null;

              const nodeRadius = 40;
              const prereqCenterX = prereq.position.left + nodeRadius;
              const prereqCenterY = prereq.position.top + nodeRadius;
              const exerciseCenterX = exercise.position.left + nodeRadius;
              const exerciseCenterY = exercise.position.top + nodeRadius;
              
              const dx = exerciseCenterX - prereqCenterX;
              const dy = exerciseCenterY - prereqCenterY;
              const angle = Math.atan2(dy, dx);
              
              const prereqX = prereqCenterX + Math.cos(angle) * nodeRadius;
              const prereqY = prereqCenterY + Math.sin(angle) * nodeRadius;
              const exerciseX = exerciseCenterX - Math.cos(angle) * nodeRadius;
              const exerciseY = exerciseCenterY - Math.sin(angle) * nodeRadius;
              
              return (
                <line
                  key={`${exercise.id}-${prereqId}`}
                  x1={prereqX}
                  y1={prereqY}
                  x2={exerciseX}
                  y2={exerciseY}
                  stroke={theme.node.line}
                  strokeWidth="2"
                />
              );
            });
          })}
        </svg>

        {/* NODES */}
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className="absolute"
            style={{
              top: `${exercise.position.top}px`,
              left: `${exercise.position.left}px`,
            }}
          >
            <button
              className="rounded-full transition-all duration-200 hover:scale-110 cursor-pointer bg-transparent relative"
              style={{
                width: '80px',
                height: '80px',
                border: `2px solid ${theme.node.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = `2px solid ${theme.node.borderHover}`;
                setHoveredExercise(exercise);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = `2px solid ${theme.node.border}`;
                setHoveredExercise(null);
              }}
            >
              <div className="w-full h-full flex items-center justify-center p-2">
                <img 
                  src={exercise.icon}
                  alt={exercise.name}
                  className="w-full h-full object-contain"
                  style={{ filter: 'brightness(1.2)' }}
                />
              </div>
            </button>

            {/* HOVER BOX */}
            {hoveredExercise?.id === exercise.id && (
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none"
                style={{
                  bottom: '90px',
                  animation: 'slideUp 0.15s ease-out',
                }}
              >
                <div 
                  className="rounded-lg px-4 py-2 shadow-xl whitespace-nowrap"
                  style={{
                    backgroundColor: theme.hoverBox.background,
                    border: `1px solid ${theme.hoverBox.border}`,
                  }}
                >
                  <div className="text-sm font-semibold mb-1" style={{ color: theme.text.primary }}>
                    {exercise.name}
                  </div>
                  
                  <div className="text-xs">
                    <span 
                      className="px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: theme.hoverBox.badge.background,
                        color: theme.hoverBox.badge.text,
                        border: `1px solid ${theme.hoverBox.badge.border}`,
                      }}
                    >
                      {exercise.difficulty}
                    </span>
                  </div>

                  {/* Arrow */}
                  <div 
                    className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0"
                    style={{
                      bottom: '-6px',
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: `6px solid ${theme.hoverBox.background}`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}