'use client'

import { useEffect, useState } from 'react';
import { getUserProgress } from './db-helpers';

// Shared client-side store for the signed-in user's completed-skill ids. Lets
// multiple islands on the same page (e.g. the detail page's "mark complete"
// button and its guidance banner) share ONE fetch and stay in sync live when
// completion changes. Mirrors the module-cache pattern in useExercises.
let _userId = null;
let _ids = null; // null = not loaded yet
let _inflight = null;
const _subs = new Set();

const emit = () => _subs.forEach((fn) => fn());

// Optimistic local update (call after a successful mark complete/incomplete).
export function setProgressLocal(ids) {
  _ids = ids;
  emit();
}

export function invalidateProgress() {
  _ids = null;
  _inflight = null;
  emit();
}

export function useUserProgress(userId) {
  const [, force] = useState(0);

  useEffect(() => {
    const rerender = () => force((n) => n + 1);
    _subs.add(rerender);

    if (!userId) {
      _userId = null;
      _ids = [];
    } else if (_userId !== userId) {
      // New (or first) user → (re)load.
      _userId = userId;
      _ids = null;
      _inflight = getUserProgress(userId).then((ids) => {
        _ids = ids;
        _inflight = null;
        emit();
      });
    } else if (_ids === null && !_inflight) {
      // Same user, cache was invalidated → reload.
      _inflight = getUserProgress(userId).then((ids) => {
        _ids = ids;
        _inflight = null;
        emit();
      });
    }

    return () => {
      _subs.delete(rerender);
    };
  }, [userId]);

  return { ids: _ids || [], loaded: _ids !== null };
}
