'use client'

import { useState, useEffect } from 'react';
import { getCustomExercises } from './db-helpers';

// Session-level cache so the exercises fetch happens once, not on every page.
let _cache = null;
let _inflight = null;

export function invalidateExercisesCache() {
  _cache = null;
  _inflight = null;
}

// All skills come from the DB now (no built-ins in code).
export function useExercises() {
  const [exercises, setExercises] = useState(_cache || []);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) {
      setExercises(_cache);
      setLoading(false);
      return;
    }
    let active = true;
    if (!_inflight) {
      _inflight = getCustomExercises()
        .then((list) => {
          _cache = list;
          return list;
        })
        .finally(() => {
          _inflight = null;
        });
    }
    _inflight.then((list) => {
      if (active) {
        setExercises(list);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return { exercises, loading };
}

// Distinct categories present in a given exercise list.
export function getCategoriesFrom(list) {
  return [...new Set(list.map((ex) => ex.category).filter(Boolean))];
}

// Completing a skill implies its (transitive) prerequisites are complete too.
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
