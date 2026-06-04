'use client'

import { useState, useEffect } from 'react';
import { exercises as builtInExercises } from './exercises-data';
import { getCustomExercises } from './db-helpers';

// Hybrid data source: the built-in exercises render immediately, then any
// admin-created exercises from Firestore are merged in once they load.
export function useExercises() {
  const [exercises, setExercises] = useState(builtInExercises);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getCustomExercises()
      .then((custom) => {
        if (!active) return;
        setExercises([...builtInExercises, ...custom]);
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
