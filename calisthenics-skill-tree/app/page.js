'use client'

import { useState, useMemo } from 'react';

export default function Home() {
  // Removed: const [selectedExercise, setSelectedExercise] = useState(null);
  const [hoveredExercise, setHoveredExercise] = useState(null);  

  const exercises = [
    {
      id: 1,
      name: "Push-ups",
      icon: "/icons/pushup.png",  
      category: "push",
      difficulty: "Beginner",
      summary: "The fundamental upper body exercise. Builds chest, shoulders, and triceps.",
      prerequisites: [2]
    },
    {
      id: 2,
      name: "Knee Push-ups",
      icon: "/icons/knee-pushup.png",  // FIXED: Removed "public/"
      category: "push",
      difficulty: "Beginner",
      summary: "Modified push-up with knees on ground. Perfect for building strength.",
      prerequisites: [3]
    },
    {
      id: 3,
      name: "Incline Push-ups",
      icon: "/icons/incline-pushup.png",
      category: "push",
      difficulty: "Beginner",
      summary: "Push-ups with hands elevated. Great starting point for beginners.",
      prerequisites: []
    },
    {
      id: 4,
      name: "Pull-ups",
      icon: "/icons/pullup.png",
      category: "pull",
      difficulty: "Beginner",
      summary: "Essential back and arm exercise. Builds pulling strength.",
      prerequisites: [5]
    },
    {
      id: 5,
      name: "Dead Hang",
      icon: "/icons/dead-hang.png",  
      category: "pull",
      difficulty: "Beginner",
      summary: "Grip and shoulder stability foundation.",
      prerequisites: []
    },
    {
      id: 6,
      name: "Muscle-up",
      icon: "/icons/muscle-up.png", 
      category: "advanced",
      difficulty: "Advanced",
      summary: "Explosive pull-to-dip transition. Requires both pushing and pulling strength.",
      prerequisites: [1, 4]
    }
  ];

  // AUTO-CALCULATE POSITIONS
  const exercisesWithPositions = useMemo(() => {
    const categories = {};
    exercises.forEach(ex => {
      if (!categories[ex.category]) {
        categories[ex.category] = [];
      }
      categories[ex.category].push(ex);
    });

    const calculateLevel = (exerciseId, visited = new Set()) => {
      if (visited.has(exerciseId)) return 0;
      visited.add(exerciseId);
      
      const exercise = exercises.find(e => e.id === exerciseId);
      if (!exercise || exercise.prerequisites.length === 0) {
        return 0;
      }
      
      const prereqLevels = exercise.prerequisites.map(prereqId => 
        calculateLevel(prereqId, new Set(visited))
      );
      return Math.max(...prereqLevels) + 1;
    };

    const maxLevel = Math.max(...exercises.map(ex => calculateLevel(ex.id)));

    const positioned = [];
    const categoryKeys = Object.keys(categories);
    const horizontalSpacing = 250;
    const verticalSpacing = 180;
    const startX = 150;
    const startY = 100;

    categoryKeys.forEach((category, catIndex) => {
      const categoryExercises = categories[category];
      
      const sorted = categoryExercises.map(ex => ({
        ...ex,
        level: calculateLevel(ex.id)
      })).sort((a, b) => a.level - b.level);

      sorted.forEach((ex) => {
        const invertedLevel = maxLevel - ex.level;
        
        positioned.push({
          ...ex,
          position: {
            left: startX + (catIndex * horizontalSpacing),
            top: startY + (invertedLevel * verticalSpacing)
          }
        });
      });
    });

    return positioned;
  }, [exercises]);

  return (
    <div className="min-h-screen bg-[#27272e] relative overflow-hidden">
      {/* INTRO TEXT */}
      <div className="text-center pt-12 pb-8">
        <h1 className="text-4xl font-bold text-gray-100 mb-2">
          Calisthenics Skill Tree
        </h1>
        <p className="text-gray-400 text-lg">
          Master your body, one move at a time
        </p>
      </div>

      {/* SKILL TREE CONTAINER */}
      <div className="relative min-h-[700px] max-w-6xl mx-auto pb-12">
        
        {/* SVG FOR CONNECTING LINES */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {exercisesWithPositions.map((exercise) => {
            return exercise.prerequisites.map((prereqId) => {
              const prereq = exercisesWithPositions.find(e => e.id === prereqId);
              if (!prereq) return null;

              const nodeRadius = 40;
              
              return (
                <line
                  key={`${exercise.id}-${prereqId}`}
                  x1={prereq.position.left + nodeRadius}
                  y1={prereq.position.top + nodeRadius * 2}
                  x2={exercise.position.left + nodeRadius}
                  y2={exercise.position.top}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="2"
                />
              );
            });
          })}
        </svg>

        {/* EXERCISE NODES */}
        {exercisesWithPositions.map((exercise) => (
          <div
            key={exercise.id}
            className="absolute"
            style={{
              top: `${exercise.position.top}px`,
              left: `${exercise.position.left}px`,
            }}
          >
            {/* THE NODE (Circle Button) */}
            <button
              // onClick removed - will add later when you want popup functionality
              className="rounded-full transition-all duration-200 hover:scale-110 cursor-pointer bg-transparent relative"
              style={{
                width: '80px',
                height: '80px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.6)';
                setHoveredExercise(exercise);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.3)';
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

            {/* HOVER BOX - Appears above node when hovering */}
            {hoveredExercise?.id === exercise.id && (
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none"
                style={{
                  bottom: '90px',
                  animation: 'slideUp 0.15s ease-out',
                }}
              >
                <div className="bg-[#3a3a42] border border-gray-600 rounded-lg px-4 py-2 shadow-xl whitespace-nowrap">
                  {/* Exercise Name */}
                  <div className="text-sm font-semibold text-gray-100 mb-1">
                    {exercise.name}
                  </div>
                  
                  {/* Difficulty Badge */}
                  <div className="text-xs">
                    <span className="bg-blue-500 bg-opacity-20 text-blue-300 px-2 py-0.5 rounded border border-blue-500 border-opacity-30">
                      {exercise.difficulty}
                    </span>
                  </div>

                  {/* Little arrow pointing down to the node */}
                  <div 
                    className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0"
                    style={{
                      bottom: '-6px',
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '6px solid #3a3a42',
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