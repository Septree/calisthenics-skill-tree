'use client'

import { theme } from './theme';
import { useExercises } from './useExercises';
import { evaluateAchievements } from './achievements';

function earnedDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Phase 7 — achievements grid on the profile. `log` is the user's completion
// log (from getCompletionLog); earned badges show their unlock date, locked
// ones dim with a "x / y" progress hint.
export default function AchievementsPanel({ log = [] }) {
  const { exercises } = useExercises();
  const achievements = evaluateAchievements(log, exercises);
  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <div
      className="rounded-lg p-6 reveal-up"
      style={{ backgroundColor: theme.background.secondary, border: `1px solid ${theme.border.default}`, animationDelay: '0.36s' }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold" style={{ color: theme.text.primary }}>Achievements</h2>
        <span className="text-sm" style={{ color: theme.text.tertiary }}>
          {earnedCount} / {achievements.length}
        </span>
      </div>

      {achievements.length === 0 ? (
        <p style={{ color: theme.text.tertiary }}>Achievements will appear here as skills get added.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {achievements.map((a) => (
            <div
              key={a.id}
              title={a.description}
              className="rounded-lg p-4 flex flex-col items-center text-center"
              style={{
                backgroundColor: theme.background.tertiary,
                border: `1px solid ${a.earned ? '#fbbf2455' : theme.border.dark}`,
                opacity: a.earned ? 1 : 0.55,
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                style={{
                  fontSize: 26,
                  background: a.earned ? 'radial-gradient(circle at 35% 30%, #fbbf24 0%, #f59e0b 70%)' : theme.background.secondary,
                  boxShadow: a.earned ? '0 0 14px #fbbf2466' : 'none',
                  filter: a.earned ? 'none' : 'grayscale(1)',
                }}
                aria-hidden="true"
              >
                {a.glyph}
              </div>
              <p className="text-sm font-semibold leading-tight" style={{ color: theme.text.primary }}>{a.name}</p>
              <p className="text-xs mt-1" style={{ color: theme.text.tertiary }}>
                {a.earned
                  ? (a.at ? earnedDate(a.at) : 'Unlocked')
                  : `${a.progress.current} / ${a.progress.target}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
