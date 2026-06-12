'use client'

import Link from 'next/link';
import { theme } from './theme';
import { useExercises } from './useExercises';
import { indexById, historyEntries } from './progression';
import ExerciseIcon from './ExerciseIcon';

// Relative "x ago" label from an ISO timestamp.
function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const day = 86_400_000;
  if (diff < 0) return 'just now';
  if (diff < day) return 'today';
  if (diff < 2 * day) return 'yesterday';
  const days = Math.floor(diff / day);
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Phase 6 — a timeline of recently unlocked skills. `log` is the user's
// completion log (newest first, from getCompletionLog).
export default function ProgressHistory({ log = [], limit = 8 }) {
  const { exercises } = useExercises();
  const byId = indexById(exercises);
  const entries = historyEntries(log, byId);

  const card = {
    backgroundColor: theme.background.secondary,
    border: `1px solid ${theme.border.default}`,
  };

  return (
    <div className="rounded-lg p-6 reveal-up" style={{ ...card, animationDelay: '0.32s' }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold" style={{ color: theme.text.primary }}>
          Recently Unlocked
        </h2>
        {entries.length > 0 && (
          <span className="text-sm" style={{ color: theme.text.tertiary }}>
            {entries.length} skill{entries.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <p style={{ color: theme.text.tertiary }}>
          No skills completed yet — mark one complete to start your timeline.
        </p>
      ) : (
        <ol className="relative" style={{ borderLeft: `2px solid ${theme.border.dark}`, marginLeft: '8px' }}>
          {entries.slice(0, limit).map(({ exercise, completedAt }, i) => (
            <li key={`${exercise.id}-${i}`} className="relative pl-6 pb-5 last:pb-0">
              {/* timeline dot */}
              <span
                className="absolute rounded-full"
                style={{
                  left: '-7px',
                  top: '6px',
                  width: '12px',
                  height: '12px',
                  backgroundColor: theme.accent.success,
                  boxShadow: `0 0 0 3px ${theme.background.secondary}`,
                }}
                aria-hidden="true"
              />
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: theme.background.tertiary }}
                >
                  <ExerciseIcon src={exercise.icon} name={exercise.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/exercises/${exercise.id}`}
                    className="font-semibold hover:underline truncate block"
                    style={{ color: theme.text.primary }}
                  >
                    {exercise.name}
                  </Link>
                  <span className="text-xs" style={{ color: theme.text.tertiary }}>
                    {exercise.difficulty} · {relativeTime(completedAt)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
