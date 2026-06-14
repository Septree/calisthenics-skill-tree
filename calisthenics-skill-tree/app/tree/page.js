'use client'

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { theme } from '../theme';
import { useExercises } from '../useExercises';
import { indexById, effectiveCompletedSet, goalPathSet, skillState } from '../progression';
import ExerciseIcon from '../ExerciseIcon';
import CheckMark from '../CheckMark';
import GoalPanel from '../GoalPanel';
import { useAuth } from '../AuthContext';
import { getUserProgress } from '../db-helpers';
import { getQuoteOfTheDay } from '../quotes-data';

const NODE = 80;        // node diameter
const RADIUS = NODE / 2;
const PAD = 80;         // breathing room around the whole graph
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function TreePage() {
  const [hoveredExercise, setHoveredExercise] = useState(null);
  const { exercises, loading } = useExercises();
  const { user, goalId } = useAuth();
  const isAdmin = !!user && !!ADMIN_EMAIL && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const [completedExercises, setCompletedExercises] = useState([]);
  const [, setIsLoadingProgress] = useState(true);
  const quote = getQuoteOfTheDay();

  // Derive unlock states once: effective completion, the active goal's path, and
  // a per-skill state (locked / available / in_progress / completed).
  const byId = indexById(exercises);
  const doneSet = effectiveCompletedSet(completedExercises, byId);
  const goalPath = goalPathSet(goalId, byId);

  // load user progress
  useEffect(() => {
    if (user) {
      getUserProgress(user.id).then((progress) => {
        setCompletedExercises(progress);
        setIsLoadingProgress(false);
      });
    } else {
      setIsLoadingProgress(false);
    }
  }, [user]);

  // Progressive reveal: each node fades/pops in as it scrolls into view.
  const nodeRefs = useRef(new Map());
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('node-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    nodeRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [exercises]);

  // loading / empty states
  if (loading && exercises.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background.primary }}>
        <p style={{ color: theme.text.tertiary }}>Loading skill tree…</p>
      </div>
    );
  }
  if (exercises.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: theme.background.primary }}>
        <div className="text-center max-w-md reveal-up">
          <h1 className="text-3xl font-bold mb-3" style={{ color: theme.text.primary }}>The skill tree is being built</h1>
          <p className="mb-6" style={{ color: theme.text.tertiary }}>
            No skills have been added yet — check back soon!
          </p>
          {isAdmin && (
            <Link href="/admin" className="inline-block px-6 py-3 rounded-lg font-semibold transition hover:opacity-90" style={{ backgroundColor: theme.accent.primary, color: 'white' }}>
              Add your first skill
            </Link>
          )}
        </div>
      </div>
    );
  }

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

  // Connector lines, flattened and ordered base-first (nodes lower on screen
  // draw first) so on load the tree appears to "form itself" upward from its
  // roots — each line's draw-in is staggered in this order.
  const connectorLines = [];
  for (const exercise of exercises) {
    const ex = posOf(exercise);
    for (const prereqId of exercise.prerequisites || []) {
      const prereq = byId.get(prereqId);
      if (!prereq) continue;
      const pr = posOf(prereq);
      const prereqCenterX = pr.left + RADIUS;
      const prereqCenterY = pr.top + RADIUS;
      const exerciseCenterX = ex.left + RADIUS;
      const exerciseCenterY = ex.top + RADIUS;
      const angle = Math.atan2(exerciseCenterY - prereqCenterY, exerciseCenterX - prereqCenterX);
      connectorLines.push({
        key: `${exercise.id}-${prereqId}`,
        x1: prereqCenterX + Math.cos(angle) * RADIUS,
        y1: prereqCenterY + Math.sin(angle) * RADIUS,
        x2: exerciseCenterX - Math.cos(angle) * RADIUS,
        y2: exerciseCenterY - Math.sin(angle) * RADIUS,
        sortY: prereqCenterY,
      });
    }
  }
  connectorLines.sort((a, b) => b.sortY - a.sortY); // bottom of the tree first

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

        {/* GOAL HUB — pick a goal, see progress + what to train next */}
        <div className="px-4 mb-6">
          <GoalPanel completedIds={completedExercises} />
        </div>

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

          {/* SVG LINES — staggered, base-first draw-in so the tree forms itself */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connectorLines.map((ln, i) => (
              <line
                key={ln.key}
                className="line-draw"
                pathLength="1"
                x1={ln.x1}
                y1={ln.y1}
                x2={ln.x2}
                y2={ln.y2}
                stroke={theme.node.line}
                strokeWidth="2"
                style={{ animationDelay: `${Math.min(i * 55, 1800)}ms` }}
              />
            ))}
          </svg>

          {/* NODES */}
          {exercises.map((exercise) => {
            const pos = posOf(exercise);
            const state = skillState(exercise.id, doneSet, byId, goalPath);
            const isDone = state === 'completed';
            const isLocked = state === 'locked';
            const isNext = state === 'in_progress';
            // Border + glow per state. When a goal is active, dim skills that
            // aren't on its path so the journey stands out.
            const borderColor = isDone
              ? theme.accent.success
              : isNext
              ? theme.accent.primary
              : theme.node.border;
            const glow = isDone
              ? `0 0 16px ${theme.accent.success}88`
              : isNext
              ? `0 0 18px ${theme.accent.primary}aa`
              : 'none';
            const offPath = goalId != null && !goalPath.has(exercise.id) && !isDone;
            const opacity = isDone || isNext ? 1 : isLocked ? 0.3 : offPath ? 0.45 : 0.8;
            return (
              <div
                key={exercise.id}
                ref={(el) => {
                  if (el) nodeRefs.current.set(exercise.id, el);
                  else nodeRefs.current.delete(exercise.id);
                }}
                className="absolute node-reveal"
                style={{ top: `${pos.top}px`, left: `${pos.left}px` }}
              >
                <Link
                  href={`/exercises/${exercise.id}`}
                  aria-label={`${exercise.name}, ${exercise.difficulty}, ${state.replace('_', ' ')}`}
                  className={`rounded-full transition-transform duration-200 hover:scale-110 cursor-pointer bg-transparent relative flex items-center justify-center ${isNext ? 'cc-node-pulse' : ''}`}
                  style={{
                    width: '80px',
                    height: '80px',
                    border: `2px solid ${borderColor}`,
                    opacity,
                    boxShadow: glow,
                    textDecoration: 'none',
                    '--ring': `${theme.accent.primary}88`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border = `2px solid ${theme.node.borderHover}`;
                    setHoveredExercise(exercise);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = `2px solid ${borderColor}`;
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

                    {isLocked && (
                      <div
                        className="absolute top-0 right-0 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: theme.background.tertiary, boxShadow: `0 0 0 2px ${theme.background.primary}`, fontSize: '10px' }}
                        aria-hidden="true"
                      >
                        🔒
                      </div>
                    )}
                  </div>
                </Link>

                {/* Name label under the node — shown on touch where hover doesn't work */}
                <div
                  className="md:hidden absolute left-1/2 -translate-x-1/2 text-center text-xs leading-tight pointer-events-none"
                  style={{ top: '84px', width: '96px', color: theme.text.tertiary }}
                >
                  {exercise.name}
                </div>

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
