'use client'

import { useState, useEffect } from 'react';
import { exercises as builtInExercises } from './exercises-data';
import { getCustomExercises, getExerciseOverrides, getVideoOverrides } from './db-helpers';

// Session-level cache so the Firestore fetch happens once, not on every page
// navigation. This is what made admin-added skills feel slow — each page was
// re-fetching them. After the first load, subsequent pages render instantly.
let _cache = null;        // { custom, overrides }
let _inflight = null;     // shared in-flight promise

// Call after any admin mutation so the next page load picks up fresh data.
export function invalidateExercisesCache() {
  _cache = null;
  _inflight = null;
}

// Hybrid data source: built-ins render immediately; admin-created exercises
// (Firestore) + position overrides are merged in once (and cached).
export function useExercises() {
  const [snapshot, setSnapshot] = useState(_cache);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) {
      setSnapshot(_cache);
      setLoading(false);
      return;
    }
    let active = true;
    if (!_inflight) {
      _inflight = Promise.all([getCustomExercises(), getExerciseOverrides(), getVideoOverrides()])
        .then(([custom, overrides, videos]) => {
          _cache = { custom, overrides, videos };
          return _cache;
        })
        .finally(() => {
          _inflight = null;
        });
    }
    _inflight.then((c) => {
      if (active) {
        setSnapshot(c);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const custom = snapshot?.custom ?? [];
  const overrides = snapshot?.overrides ?? {};
  const videos = snapshot?.videos ?? {};
  const applyOverride = (ex) => {
    const position = overrides[ex.id] ? { ...ex.position, ...overrides[ex.id] } : ex.position;
    const videoId = videos[ex.id] ?? ex.videoId ?? null;
    return { ...ex, position, videoId };
  };
  const exercises = [...builtInExercises.map(applyOverride), ...custom.map(applyOverride)];

  return { exercises, loading };
}

// Next numeric id for a brand-new exercise (built-ins use 1..n).
export function getNextExerciseId(list) {
  return list.reduce((max, ex) => Math.max(max, ex.id || 0), 0) + 1;
}

// Distinct categories present in a given exercise list.
export function getCategoriesFrom(list) {
  return [...new Set(list.map((ex) => ex.category).filter(Boolean))];
}

// Completing a skill implies you've completed everything it builds on. Expand a
// list of explicitly-completed ids to include all (transitive) prerequisites.
export function getEffectiveCompleted(completedIds, exercises) {
  const byId = new Map(exercises.map((e) => [e.id, e]));
  const done = new Set(completedIds);
  const stack = [...completedIds];
  while (stack.length) {
    const ex = byId.get(stack.pop());
    if (!ex) continue;
    for (const prereqId of ex.prerequisites || []) {
      if (!done.has(prereqId)) {
        done.add(prereqId);
        stack.push(prereqId);
      }
    }
  }
  return [...done];
}
