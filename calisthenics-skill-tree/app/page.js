'use client'

import { useState, useEffect} from 'react';
import { theme } from './theme'; 
import { exercises } from './exercises-data';
import { useAuth } from './AuthContext';   
import { getUserProgress } from './db-helpers';
export default function Home() {
  const [hoveredExercise, setHoveredExercise] = useState(null);  
  const { user } = useAuth();
  const [completedExercises, setCompletedExercises] = useState([]);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [quote, setQuote] = useState(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);
  // calculate container height
  const containerHeight = Math.max(
    800,
    ...exercises.map(ex => ex.position.top + 180)
  );

  // load user progress
  useEffect(() => {
    if (user) {
      getUserProgress(user.uid).then((progress) => {
        setCompletedExercises(progress);
        setIsLoadingProgress(false);
      });
    } else {
      setIsLoadingProgress(false);
    }
  }, [user]);

  useEffect(() => {
  const fetchQuote = async () => {
    try {
      const response = await fetch('https://api.api-ninjas.com/v1/quotes', {
        headers: { 
          'X-Api-Key': process.env.NEXT_PUBLIC_QUOTES_API_KEY 
        }
      });
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        setQuote(data[0]);
      }
      
      setIsLoadingQuote(false);
    } catch (error) {
      console.error('Error fetching quote:', error);
      setIsLoadingQuote(false);
    }
  };

  fetchQuote();
}, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: theme.background.primary }}>
  {/* INTRO TEXT */}
  <div className="text-center pt-12 pb-4">
    <h1 className="text-4xl font-bold mb-2" style={{ color: theme.text.primary }}>
      Calisthenics Skill Tree
    </h1>
    <p className="text-lg mb-6" style={{ color: theme.text.tertiary }}>
      Master your body, one move at a time
    </p>

    {/* QUOTE OF THE DAY */}
    <div 
      className="max-w-2xl mx-auto p-6 rounded-lg mb-6"
      style={{ 
        backgroundColor: theme.background.secondary,
        border: `1px solid ${theme.border.default}`
      }}
    >
      {isLoadingQuote ? (
        <p style={{ color: theme.text.tertiary }}>Loading quote...</p>
      ) : quote ? (
        <>
          <p 
            className="text-sm uppercase tracking-wide mb-3"
            style={{ color: theme.text.tertiary }}
          >
            Quote of the Day
          </p>
          <p 
            className="text-lg italic mb-3"
            style={{ color: theme.text.primary }}
          >
            "{quote.quote}"
          </p>
          <p 
            className="text-sm"
            style={{ color: theme.text.secondary }}
          >
            — {quote.author}
          </p>
        </>
      ) : (
        <p style={{ color: theme.text.tertiary }}>No quote available</p>
      )}
    </div>
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
          <a
            href={`/exercises/${exercise.id}`}
              className="rounded-full transition-all duration-200 hover:scale-110 cursor-pointer bg-transparent relative flex items-center justify-center"
              style={{
                width: '80px',
                height: '80px',
                border: `2px solid ${theme.node.border}`,
                opacity: completedExercises.includes(exercise.id) ? 1 : 0.5,
                display: 'block',
                textDecoration: 'none',
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
              <div className="w-full h-full flex items-center justify-center p-2 relative">
                <img 
                  src={exercise.icon}
                  alt={exercise.name}
                  className="w-full h-full object-contain"
                  style={{ filter: 'brightness(1.2)' }}
                />
                
                {/* Checkmark for completed exercises */}
                {completedExercises.includes(exercise.id) && (
                  <div 
                    className="absolute top-0 right-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: theme.accent.success,
                      color: 'white'
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
            </a>

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