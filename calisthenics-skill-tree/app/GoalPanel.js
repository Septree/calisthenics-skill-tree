'use client'

import { useState } from 'react';
import Link from 'next/link';
import { theme } from './theme';
import { useAuth } from './AuthContext';
import { useExercises } from './useExercises';
import ExerciseIcon from './ExerciseIcon';
import {
  indexById,
  effectiveCompletedSet,
  goalProgress,
  recommendedNext,
} from './progression';

// The goal hub: shows the user's active goal with progress + recommended next
// step, or a CTA to choose one. `completedIds` comes from the caller (which has
// already loaded progress) so we don't refetch.
export default function GoalPanel({ completedIds = [] }) {
  const { user, goalId, setGoal } = useAuth();
  const { exercises } = useExercises();
  const [pickerOpen, setPickerOpen] = useState(false);

  const card = {
    backgroundColor: theme.background.secondary,
    border: `1px solid ${theme.border.default}`,
  };

  // Logged-out: a gentle nudge, no goal machinery.
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-5 rounded-xl text-center reveal-up" style={card}>
        <p style={{ color: theme.text.secondary }}>
          <Link href="/login" style={{ color: theme.accent.primary }} className="font-semibold hover:underline">
            Log in
          </Link>{' '}
          to choose a goal and get a guided path.
        </p>
      </div>
    );
  }

  const byId = indexById(exercises);
  const doneSet = effectiveCompletedSet(completedIds, byId);
  const goal = goalId != null ? byId.get(goalId) : null;
  const goalSkills = exercises.filter((e) => e.isGoal);

  const picker = pickerOpen && (
    <GoalPickerModal
      goalSkills={goalSkills}
      currentGoalId={goalId}
      onPick={(id) => {
        setGoal(id);
        setPickerOpen(false);
      }}
      onClose={() => setPickerOpen(false)}
    />
  );

  // No goal yet → invitation.
  if (!goal) {
    return (
      <>
        <div className="max-w-2xl mx-auto p-6 rounded-xl text-center reveal-up" style={card}>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: theme.accent.primary }}>
            Your journey
          </p>
          <h2 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
            Pick a goal to chase
          </h2>
          <p className="mb-5" style={{ color: theme.text.tertiary }}>
            Choose a milestone skill and we&rsquo;ll light up your path and tell you what to train next.
          </p>
          <button
            onClick={() => setPickerOpen(true)}
            className="px-6 py-3 rounded-lg font-semibold cursor-pointer transition hover:opacity-90"
            style={{ backgroundColor: theme.accent.primary, color: '#04201f' }}
          >
            Choose your goal
          </button>
        </div>
        {picker}
      </>
    );
  }

  // Goal set → progress + next steps.
  const { completed, total, pct } = goalProgress(goalId, doneSet, byId);
  const nextIds = recommendedNext(goalId, doneSet, byId);
  const nextSkills = nextIds.map((id) => byId.get(id)).filter(Boolean);
  const reached = doneSet.has(goalId);

  return (
    <>
      <div className="max-w-2xl mx-auto p-6 rounded-xl reveal-up" style={card}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-widest" style={{ color: theme.accent.primary }}>
            Current goal
          </p>
          <div className="flex gap-3 text-sm">
            <button onClick={() => setPickerOpen(true)} className="cursor-pointer hover:underline" style={{ color: theme.text.tertiary }}>
              Change
            </button>
            <button onClick={() => setGoal(null)} className="cursor-pointer hover:underline" style={{ color: theme.text.muted }}>
              Clear
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: theme.background.tertiary, border: `2px solid ${theme.accent.primary}` }}
          >
            <ExerciseIcon src={goal.icon} name={goal.name} className="w-full h-full object-contain" />
          </div>
          <div className="flex-1">
            <Link href={`/exercises/${goal.id}`} className="text-2xl font-bold hover:underline" style={{ color: theme.text.primary }}>
              {goal.name}
            </Link>
            <p className="text-sm" style={{ color: theme.text.tertiary }}>
              {reached ? 'Goal reached — pick your next challenge!' : `${completed} of ${total} skills on your path`}
            </p>
          </div>
          <div className="text-3xl font-bold" style={{ color: theme.accent.primary }}>
            {pct}%
          </div>
        </div>

        {/* progress bar */}
        <div className="w-full rounded-full h-2.5 mb-5" style={{ backgroundColor: theme.border.dark }}>
          <div
            className="h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: reached ? theme.accent.success : theme.accent.primary }}
          />
        </div>

        {/* recommended next step */}
        {!reached && nextSkills.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: theme.text.tertiary }}>
              Train next
            </p>
            <div className="flex flex-wrap gap-2">
              {nextSkills.map((s) => (
                <Link
                  key={s.id}
                  href={`/exercises/${s.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
                  style={{ backgroundColor: theme.background.tertiary, color: theme.accent.primary, border: `1px solid ${theme.accent.primary}55` }}
                >
                  <span className="cc-pulse-dot w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent.primary }} />
                  {s.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      {picker}
    </>
  );
}

function GoalPickerModal({ goalSkills, currentGoalId, onPick, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Choose a goal"
    >
      <div
        className="w-full max-w-lg rounded-xl p-6 max-h-[80vh] overflow-y-auto"
        style={{ backgroundColor: theme.background.secondary, border: `1px solid ${theme.border.default}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: theme.text.primary }}>
            Choose your goal
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-2xl leading-none cursor-pointer" style={{ color: theme.text.tertiary }}>
            ×
          </button>
        </div>

        {goalSkills.length === 0 ? (
          <p style={{ color: theme.text.tertiary }}>
            No goals are available yet. The marquee skills will appear here once they&rsquo;re set up.
          </p>
        ) : (
          <div className="space-y-2">
            {goalSkills.map((s) => {
              const active = s.id === currentGoalId;
              return (
                <button
                  key={s.id}
                  onClick={() => onPick(s.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left cursor-pointer transition hover:opacity-90"
                  style={{
                    backgroundColor: theme.background.tertiary,
                    border: `1px solid ${active ? theme.accent.primary : theme.border.default}`,
                  }}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.background.secondary }}>
                    <ExerciseIcon src={s.icon} name={s.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: theme.text.primary }}>{s.name}</p>
                    <p className="text-xs" style={{ color: theme.text.tertiary }}>{s.difficulty} · {s.category}</p>
                  </div>
                  {active && <span className="text-sm font-semibold" style={{ color: theme.accent.primary }}>Current</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
