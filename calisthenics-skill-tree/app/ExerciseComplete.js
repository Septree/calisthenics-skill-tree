'use client'

import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useExercises, getEffectiveCompleted } from './useExercises';
import { getUserProgress, markExerciseComplete, markExerciseIncomplete } from './db-helpers';
import { theme } from './theme';

// Client island: the user-specific "mark complete" control + celebration.
export default function ExerciseComplete({ exerciseId }) {
  const { user } = useAuth();
  const { exercises } = useExercises();
  const [completed, setCompleted] = useState([]);
  const [marking, setMarking] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    if (user) getUserProgress(user.uid).then(setCompleted);
    else setCompleted([]);
  }, [user]);

  const isActual = completed.includes(exerciseId);
  const effective = getEffectiveCompleted(completed, exercises);
  const isCompleted = effective.includes(exerciseId);
  const derivedOnly = isCompleted && !isActual;

  const handleClick = async () => {
    if (!user) {
      alert('Please sign in to track progress');
      return;
    }
    setMarking(true);
    if (isActual) {
      const ok = await markExerciseIncomplete(user.uid, exerciseId);
      if (ok) setCompleted((c) => c.filter((i) => i !== exerciseId));
    } else {
      const ok = await markExerciseComplete(user.uid, exerciseId);
      if (ok) {
        setCompleted((c) => [...c, exerciseId]);
        setJustCompleted(true);
        setTimeout(() => setJustCompleted(false), 1400);
      }
    }
    setMarking(false);
  };

  return (
    <>
      {justCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div className="relative">
            {[...Array(8)].map((_, i) => (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 w-2 h-16 rounded-full animate-burst-ray"
                style={{
                  backgroundColor: theme.accent.success,
                  transform: `rotate(${i * 45}deg) translateY(-40px)`,
                  transformOrigin: 'center top',
                }}
              />
            ))}
            <div
              className="relative w-28 h-28 rounded-full flex items-center justify-center text-5xl font-bold animate-celebrate"
              style={{ backgroundColor: theme.accent.success, color: 'white' }}
            >
              ✓
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={marking || derivedOnly}
        title={derivedOnly ? 'Completed automatically because a skill that requires it is complete.' : undefined}
        className={`w-full py-4 rounded-lg font-semibold transition hover:opacity-90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${justCompleted ? 'animate-celebrate' : ''}`}
        style={{
          backgroundColor: isCompleted ? theme.accent.success : theme.accent.primary,
          color: 'white',
          boxShadow: justCompleted ? `0 0 24px ${theme.accent.success}` : 'none',
        }}
      >
        {marking
          ? 'Saving…'
          : derivedOnly
          ? '✓ Completed (via a later skill)'
          : isActual
          ? '✓ Completed — tap to undo'
          : 'Mark as Complete'}
      </button>
    </>
  );
}
