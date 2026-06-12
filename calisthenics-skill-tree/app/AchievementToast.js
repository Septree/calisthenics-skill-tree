'use client'

import { useEffect, useState } from 'react';

// --- tiny pub/sub bus so any island (e.g. ExerciseComplete) can fire unlocks ---
let _listener = null;
const _buffer = [];

// items: [{ id, name, glyph }]
export function pushAchievementUnlocks(items) {
  if (!items || items.length === 0) return;
  if (_listener) _listener(items);
  else _buffer.push(...items); // mounted later → flush on subscribe
}

function subscribe(fn) {
  _listener = fn;
  if (fn && _buffer.length) fn(_buffer.splice(0));
  return () => {
    if (_listener === fn) _listener = null;
  };
}

const GOLD = '#fbbf24';
const GOLD_DEEP = '#f59e0b';

// Mounted once globally (in the root layout). Shows unlocked achievements one at
// a time with a gold medal celebration that's visually distinct from the teal
// skill-completion FX.
export default function AchievementToast() {
  const [queue, setQueue] = useState([]);

  useEffect(() => subscribe((items) => setQueue((q) => [...q, ...items])), []);

  // Show the head of the queue; auto-advance after the toast animation. The only
  // setState happens inside the timeout callback (async) — never synchronously.
  const current = queue[0] || null;
  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => setQueue((q) => q.slice(1)), 2600);
    return () => clearTimeout(t);
  }, [current]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-x-0 z-[60] flex justify-center pointer-events-none"
      style={{ top: '88px' }}
      role="status"
      aria-live="polite"
    >
      <div key={current.id} className="ach-toast flex flex-col items-center" style={{ width: 260 }}>
        {/* medal + ray burst */}
        <div className="relative flex items-center justify-center" style={{ width: 132, height: 132 }}>
          <div
            className="ach-rays absolute inset-0"
            aria-hidden="true"
            style={{
              background: `repeating-conic-gradient(${GOLD} 0deg 6deg, transparent 6deg 20deg)`,
              borderRadius: '9999px',
              maskImage: 'radial-gradient(circle, transparent 38%, #000 42%, transparent 72%)',
              WebkitMaskImage: 'radial-gradient(circle, transparent 38%, #000 42%, transparent 72%)',
            }}
          />
          <div
            className="ach-pop relative flex items-center justify-center overflow-hidden"
            style={{
              width: 92,
              height: 92,
              borderRadius: '9999px',
              background: `radial-gradient(circle at 35% 30%, ${GOLD} 0%, ${GOLD_DEEP} 70%)`,
              boxShadow: `0 0 26px ${GOLD}aa, inset 0 0 0 3px #ffffff44`,
              fontSize: 44,
            }}
          >
            <span aria-hidden="true">{current.glyph || '🏆'}</span>
            {/* shimmer sweep */}
            <span
              className="ach-shimmer absolute top-0 bottom-0"
              aria-hidden="true"
              style={{ left: 0, width: 36, background: 'linear-gradient(90deg, transparent, #ffffffaa, transparent)' }}
            />
          </div>
        </div>

        {/* label */}
        <div className="ach-rise mt-3 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: GOLD }}>
            Achievement Unlocked
          </p>
          <p className="text-lg font-bold leading-tight mt-0.5" style={{ color: '#f3f4f6' }}>
            {current.name}
          </p>
        </div>
      </div>
    </div>
  );
}
