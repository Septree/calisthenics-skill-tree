'use client'

import Link from 'next/link';
import { theme } from './theme';
import { useAuth } from './AuthContext';
import { useExercises } from './useExercises';
import { useUserProgress } from './useProgress';
import { indexById, effectiveCompletedSet, goalPathSet, skillState } from './progression';

// Phase 2 — turns a skill's detail page into a guide: where this skill sits on
// YOUR path, whether it's your next step toward your goal, what's blocking it,
// and what it unlocks. Client island (needs the signed-in user's progress + goal).
export default function ExerciseGuidance({ exerciseId }) {
  const { user, goalId } = useAuth();
  const { exercises } = useExercises();
  const { ids: completed, loaded } = useUserProgress(user?.id);

  // Wait for both the exercise list and progress before deciding what to say.
  if (exercises.length === 0 || !loaded) return null;

  const byId = indexById(exercises);
  const doneSet = effectiveCompletedSet(completed, byId);
  const goalPath = goalPathSet(goalId, byId);
  const state = skillState(exerciseId, doneSet, byId, goalPath);

  const goal = goalId != null ? byId.get(goalId) : null;
  const onGoalPath = goalPath.has(exerciseId);

  // Direct prerequisites not yet (effectively) complete — the actionable blockers.
  const ex = byId.get(exerciseId);
  const missing = (ex?.prerequisites || [])
    .filter((pid) => !doneSet.has(pid))
    .map((pid) => byId.get(pid))
    .filter(Boolean);

  // Skills this one directly unlocks (this is a prerequisite of theirs).
  const unlocks = exercises.filter((e) => (e.prerequisites || []).includes(exerciseId));

  const base = {
    borderRadius: '0.75rem',
    padding: '1rem 1.25rem',
    border: `1px solid ${theme.border.default}`,
  };

  // Logged-out: a gentle nudge, no per-user state to show.
  if (!user) {
    return (
      <div className="reveal-up" style={{ ...base, backgroundColor: theme.background.secondary }}>
        <p style={{ color: theme.text.secondary }}>
          <Link href="/login" style={{ color: theme.accent.primary }} className="font-semibold hover:underline">Log in</Link>
          {' '}to see where this skill sits on your path and what to train next.
        </p>
      </div>
    );
  }

  const linkList = (skills) =>
    skills.map((s, i) => (
      <span key={s.id}>
        {i > 0 && ', '}
        <Link href={`/exercises/${s.id}`} className="font-semibold hover:underline" style={{ color: theme.accent.primary }}>
          {s.name}
        </Link>
      </span>
    ));

  // Pick the banner by state.
  let accent = theme.accent.primary;
  let bg = theme.background.secondary;
  let title;
  let body;

  if (state === 'completed') {
    accent = theme.accent.success;
    bg = `${theme.accent.success}14`;
    title = '✓ You’ve completed this skill';
    body = unlocks.length > 0
      ? <>It unlocks {linkList(unlocks)}.</>
      : <>Nice work — this is a leaf skill on the tree.</>;
  } else if (state === 'in_progress') {
    accent = theme.accent.primary;
    bg = `${theme.accent.primary}14`;
    title = goal ? `🎯 Your next step toward ${goal.name}` : '🎯 Train this next';
    body = <>Prerequisites met and it’s on your goal path — this is the highest-value thing to train right now.</>;
  } else if (state === 'available') {
    accent = theme.accent.primary;
    title = 'Ready to train';
    body = goal
      ? <>Prerequisites met. This isn’t on your path to <strong style={{ color: theme.text.secondary }}>{goal.name}</strong>, but you can train it any time.</>
      : <>Prerequisites met — you can start this now. <Link href="/tree" className="hover:underline" style={{ color: theme.accent.primary }}>Set a goal</Link> to get a guided path.</>;
  } else {
    // locked
    accent = theme.text.muted;
    title = '🔒 Locked';
    body = missing.length > 0
      ? <>First complete {linkList(missing)}{onGoalPath && goal ? <> on your way to {goal.name}</> : null}.</>
      : <>Complete its prerequisites first.</>;
  }

  return (
    <div className="reveal-up" style={{ ...base, backgroundColor: bg, borderColor: `${accent}55` }}>
      <p className="text-sm font-bold mb-1" style={{ color: accent }}>{title}</p>
      <p className="text-sm leading-relaxed" style={{ color: theme.text.secondary }}>{body}</p>
    </div>
  );
}
