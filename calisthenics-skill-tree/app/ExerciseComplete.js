'use client'

import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useExercises, getEffectiveCompleted } from './useExercises';
import { useUserProgress, setProgressLocal } from './useProgress';
import { markExerciseComplete, markExerciseIncomplete } from './db-helpers';
import { earnedIdsFor, buildAchievements } from './achievements';
import { pushAchievementUnlocks } from './AchievementToast';
import { theme } from './theme';
import CheckMark from './CheckMark';

// Client island: the user-specific "mark complete" control + celebration.
export default function ExerciseComplete({ exerciseId }) {
  const { user } = useAuth();
  const { exercises } = useExercises();
  const { ids: completed } = useUserProgress(user?.id);
  const [marking, setMarking] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

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
      const ok = await markExerciseIncomplete(user.id, exerciseId);
      if (ok) setProgressLocal(completed.filter((i) => i !== exerciseId));
    } else {
      const before = earnedIdsFor(completed, exercises);
      const ok = await markExerciseComplete(user.id, exerciseId);
      if (ok) {
        const next = [...completed, exerciseId];
        setProgressLocal(next);
        setJustCompleted(true);
        setTimeout(() => setJustCompleted(false), 1600);
        // Fire the achievement celebration for any milestone this just crossed.
        const after = earnedIdsFor(next, exercises);
        const newIds = [...after].filter((id) => !before.has(id));
        if (newIds.length) {
          const unlocked = buildAchievements(exercises)
            .filter((a) => newIds.includes(a.id))
            .map((a) => ({ id: a.id, name: a.name, glyph: a.glyph }));
          pushAchievementUnlocks(unlocked);
        }
      }
    }
    setMarking(false);
  };

  return (
    <>
      {justCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
            {/* soft teal glow */}
            <div
              className="cc-glow absolute inset-0 rounded-full"
              style={{ background: `radial-gradient(circle, ${theme.accent.primary}55 0%, transparent 70%)` }}
            />
            {/* expanding ripple rings */}
            <span
              className="cc-ripple absolute rounded-full"
              style={{ width: 112, height: 112, border: `2px solid ${theme.accent.primary}` }}
            />
            <span
              className="cc-ripple absolute rounded-full"
              style={{ width: 112, height: 112, border: `2px solid ${theme.accent.success}`, animationDelay: '0.35s' }}
            />
            {/* elevated disc with the drawing check */}
            <div
              className="relative rounded-full flex items-center justify-center"
              style={{
                width: 112,
                height: 112,
                backgroundColor: theme.background.secondary,
                boxShadow: `0 0 30px ${theme.accent.primary}66`,
              }}
            >
              <CheckMark size={84} ring={theme.accent.primary} check={theme.accent.success} draw />
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
          boxShadow: justCompleted ? `0 0 24px ${theme.accent.primary}` : 'none',
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
