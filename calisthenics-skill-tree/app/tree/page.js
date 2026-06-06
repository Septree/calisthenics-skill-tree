'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { theme } from '../theme';
import { useExercises, getEffectiveCompleted } from '../useExercises';
import ExerciseIcon from '../ExerciseIcon';
import CheckMark from '../CheckMark';
import { useAuth } from '../AuthContext';
import { getUserProgress } from '../db-helpers';
import { getQuoteOfTheDay } from '../quotes-data';

const NODE = 80;        // node diameter
const RADIUS = NODE / 2;
const PAD = 80;         // breathing room around the whole graph

export default function TreePage() {
  const [hoveredExercise, setHoveredExercise] = useState(null);
  const { exercises } = useExercises();
  const { user } = useAuth();
  const [completedExercises, setCompletedExercises] = useState([]);
  const [, setIsLoadingProgress] = useState(true);
  const quote = getQuoteOfTheDay();
  // completing a skill implies its prerequisites are complete too
  const effectiveCompleted = getEffectiveCompleted(completedExercises, exercises);

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

  // --- Auto-fit the canvas to every node's position (any direction, incl. negatives) ---
  const lefts = exercises.map((e) => e.position?.left ?? 0);
  const tops = exercises.map((e) => e.position?.top ?? 0);
  const minLeft = Math.min(0, ...lefts);
  const maxLeft = Math.max(0, ...lefts);
  const minTop = Math.min(0, ...tops);
  const maxTop = Math.max(0, ...tops);
  // shift everything so the left/top-most node sits PAD inside the canvas
  const offsetX = PAD - minLeft;
  const offsetY = PAD - minTop;
  const canvasWidth = maxLeft - minLeft + NODE + PAD * 2;
  const canvasHeight = Math.max(600, maxTop - minTop + NODE + PAD * 2);

  const posOf = (ex) => ({
    left: (ex.position?.left ?? 0) + offsetX,
    top: (ex.position?.top ?? 0) + offsetY,
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background.primary }}>
      {/* INTRO TEXT */}
      <div className="text-center pt-12 pb-4 reveal-up">
        <h1 className="text-4xl font-bold mb-2" style={{ color: theme.text.primary }}>
          Calisthenics Skill Tree
        </h1>
        <p className="text-lg mb-6" style={{ color: theme.text.tertiary }}>
          Master your body, one move at a time
        </p>

        {/* QUOTE OF THE DAY */}
        <div
          className="max-w-2xl mx-auto p-6 rounded-lg mb-6"
          style={{ backgroundColor: theme.background.secondary, border: `1px solid ${theme.border.default}` }}
        >
          {quote ? (
            <>
              <p className="text-sm uppercase tracking-wide mb-3" style={{ color: theme.text.tertiary }}>
                Quote of the Day
              </p>
              <p className="text-lg italic mb-3" style={{ color: theme.text.primary }}>
                "{quote.quote}"
              </p>
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                — {quote.author}
              </p>
            </>
          ) : (
            <p style={{ color: theme.text.tertiary }}>No quote available</p>
          )}
        </div>
      </div>

      {/* SKILL TREE CANVAS — scrolls if larger than the viewport, auto-sized to fit all nodes */}
      <div className="w-full overflow-x-auto pb-12">
        <div className="relative mx-auto" style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}>

          {/* SVG LINES */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {exercises.map((exercise) => {
              const ex = posOf(exercise);
              return (exercise.prerequisites || []).map((prereqId) => {
                const prereq = exercises.find((e) => e.id === prereqId);
                if (!prereq) return null;
                const pr = posOf(prereq);

                const prereqCenterX = pr.left + RADIUS;
                const prereqCenterY = pr.top + RADIUS;
                const exerciseCenterX = ex.left + RADIUS;
                const exerciseCenterY = ex.top + RADIUS;

                const angle = Math.atan2(exerciseCenterY - prereqCenterY, exerciseCenterX - prereqCenterX);

                return (
                  <line
                    key={`${exercise.id}-${prereqId}`}
                    x1={prereqCenterX + Math.cos(angle) * RADIUS}
                    y1={prereqCenterY + Math.sin(angle) * RADIUS}
                    x2={exerciseCenterX - Math.cos(angle) * RADIUS}
                    y2={exerciseCenterY - Math.sin(angle) * RADIUS}
                    stroke={theme.node.line}
                    strokeWidth="2"
                  />
                );
              });
            })}
          </svg>

          {/* NODES */}
          {exercises.map((exercise) => {
            const pos = posOf(exercise);
            const isDone = effectiveCompleted.includes(exercise.id);
            return (
              <div key={exercise.id} className="absolute" style={{ top: `${pos.top}px`, left: `${pos.left}px` }}>
                <Link
                  href={`/exercises/${exercise.id}`}
                  aria-label={`${exercise.name}, ${exercise.difficulty}${isDone ? ', completed' : ''}`}
                  className="rounded-full transition-transform duration-200 hover:scale-110 cursor-pointer bg-transparent relative flex items-center justify-center"
                  style={{
                    width: '80px',
                    height: '80px',
                    border: `2px solid ${theme.node.border}`,
                    opacity: isDone ? 1 : 0.5,
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
                  onFocus={() => setHoveredExercise(exercise)}
                  onBlur={() => setHoveredExercise(null)}
                >
                  <div className="w-full h-full flex items-center justify-center p-2 relative">
                    <ExerciseIcon
                      src={exercise.icon}
                      name={exercise.name}
                      className="w-full h-full object-contain"
                      style={{ fontSize: '1.25rem' }}
                    />

                    {isDone && (
                      <div
                        className="absolute top-0 right-0 w-6 h-6 rounded-full flex items-center justify-center animate-pop"
                        style={{
                          backgroundColor: theme.accent.success,
                          boxShadow: `0 0 0 2px ${theme.background.primary}`,
                        }}
                      >
                        <CheckMark size={16} ring="#ffffff" check="#ffffff" draw={false} strokeWidth={5} />
                      </div>
                    )}
                  </div>
                </Link>

                {/* HOVER BOX */}
                {hoveredExercise?.id === exercise.id && (
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none z-10"
                    style={{ bottom: '90px', animation: 'slideUp 0.15s ease-out' }}
                  >
                    <div
                      className="rounded-lg px-4 py-2 shadow-xl whitespace-nowrap"
                      style={{ backgroundColor: theme.hoverBox.background, border: `1px solid ${theme.hoverBox.border}` }}
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
