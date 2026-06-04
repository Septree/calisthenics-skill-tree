'use client'

import { useState, useEffect } from 'react';
import { exercises as builtInExercises } from './exercises-data';
import { getCustomExercises, getExerciseOverrides } from './db-helpers';

// Hybrid data source: the built-in exercises render immediately, then any
// admin-created exercises (Firestore) + admin position overrides are merged in.
export function useExercises() {
  const [exercises, setExercises] = useState(builtInExercises);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getCustomExercises(), getExerciseOverrides()])
      .then(([custom, overrides]) => {
        if (!active) return;
        // Apply any admin-set position override (keyed by exercise id).
        const applyOverride = (ex) =>
          overrides[ex.id] ? { ...ex, position: { ...ex.position, ...overrides[ex.id] } } : ex;
        setExercises([...builtInExercises.map(applyOverride), ...custom.map(applyOverride)]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

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
