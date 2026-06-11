import { describe, it, expect } from 'vitest';
import {
  indexById,
  effectiveCompletedSet,
  goalPathSet,
  baseState,
  skillState,
  recommendedNext,
  goalProgress,
} from './progression';

// Graph:  A → B → C (the goal),  A → D (off the goal path)
const exercises = [
  { id: 1, name: 'A', prerequisites: [] },
  { id: 2, name: 'B', prerequisites: [1] },
  { id: 3, name: 'C', prerequisites: [2] }, // goal
  { id: 4, name: 'D', prerequisites: [1] },
];
const byId = indexById(exercises);
const GOAL = 3;

describe('effectiveCompletedSet', () => {
  it('marks transitive prerequisites complete', () => {
    const done = effectiveCompletedSet([3], byId);
    expect([...done].sort()).toEqual([1, 2, 3]); // C done ⇒ B, A done
  });
  it('is empty for no progress', () => {
    expect(effectiveCompletedSet([], byId).size).toBe(0);
  });
});

describe('goalPathSet', () => {
  it('is the goal plus its transitive prerequisites', () => {
    expect([...goalPathSet(GOAL, byId)].sort()).toEqual([1, 2, 3]); // excludes D
  });
  it('is empty for an unknown goal', () => {
    expect(goalPathSet(999, byId).size).toBe(0);
    expect(goalPathSet(null, byId).size).toBe(0);
  });
});

describe('baseState', () => {
  it('locks a skill whose prerequisites are unmet', () => {
    expect(baseState(3, new Set(), byId)).toBe('locked');
  });
  it('unlocks a skill with no prerequisites', () => {
    expect(baseState(1, new Set(), byId)).toBe('available');
  });
  it('reports completed skills', () => {
    expect(baseState(1, new Set([1]), byId)).toBe('completed');
  });
});

describe('skillState (goal-aware)', () => {
  it('marks an on-path available skill as in_progress', () => {
    const done = effectiveCompletedSet([1], byId); // A done
    const path = goalPathSet(GOAL, byId);
    expect(skillState(2, done, byId, path)).toBe('in_progress'); // B: available + on path
  });
  it('leaves an off-path available skill as plain available', () => {
    const done = effectiveCompletedSet([1], byId);
    const path = goalPathSet(GOAL, byId);
    expect(skillState(4, done, byId, path)).toBe('available'); // D: available, not on path
  });
});

describe('recommendedNext', () => {
  it('returns the unlocked frontier on the goal path', () => {
    expect(recommendedNext(GOAL, new Set(), byId)).toEqual([1]); // only A is unlocked
    expect(recommendedNext(GOAL, effectiveCompletedSet([1], byId), byId)).toEqual([2]); // now B
  });
  it('returns nothing once the goal is reached', () => {
    expect(recommendedNext(GOAL, effectiveCompletedSet([3], byId), byId)).toEqual([]);
  });
});

describe('goalProgress', () => {
  it('is 0% with no progress', () => {
    expect(goalProgress(GOAL, new Set(), byId)).toEqual({ completed: 0, total: 3, pct: 0 });
  });
  it('counts transitive completion', () => {
    expect(goalProgress(GOAL, effectiveCompletedSet([1], byId), byId).pct).toBe(33);
  });
  it('is 100% when the goal is complete', () => {
    expect(goalProgress(GOAL, effectiveCompletedSet([3], byId), byId).pct).toBe(100);
  });
});
