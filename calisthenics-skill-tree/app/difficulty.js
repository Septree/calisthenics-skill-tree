// Color coding for difficulty badges (quick visual scanning).
export function difficultyStyle(difficulty) {
  const d = String(difficulty || '').toLowerCase();
  if (d === 'beginner') return { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', border: 'rgba(34,197,94,0.35)' };
  if (d === 'intermediate') return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.35)' };
  if (d === 'advanced') return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'rgba(239,68,68,0.35)' };
  return { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', border: 'rgba(148,163,184,0.35)' };
}
