'use client'

import { useState, useEffect } from 'react';
import { getCustomExercises } from './db-helpers';
import { indexById, effectiveCompletedSet } from './progression';

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

// Completing a skill implies its (transitive) prerequisites are complete too.
// Array-returning convenience wrapper over the shared engine (single source of
// truth for the prerequisite walk lives in progression.js).
export function getEffectiveCompleted(completedIds, exercises) {
  return [...effectiveCompletedSet(completedIds, indexById(exercises))];
}
