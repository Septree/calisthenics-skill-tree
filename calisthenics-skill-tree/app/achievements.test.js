import { describe, it, expect } from 'vitest';
import { buildAchievements, earnedIdsFor, evaluateAchievements } from './achievements';

// A → B → C(goal). D, E, F are standalone Beginner skills for count tests.
const exercises = [
  { id: 1, difficulty: 'Beginner', prerequisites: [], isGoal: false },
  { id: 2, difficulty: 'Intermediate', prerequisites: [1], isGoal: false },
  { id: 3, difficulty: 'Advanced', prerequisites: [2], isGoal: true }, // goal
  { id: 4, difficulty: 'Beginner', prerequisites: [], isGoal: false },
  { id: 5, difficulty: 'Beginner', prerequisites: [], isGoal: false },
];

describe('buildAchievements', () => {
  it('includes count tiers, present difficulty tiers, and one signature per goal', () => {
    const ids = buildAchievements(exercises).map((a) => a.id);
    expect(ids).toContain('count-1');
    expect(ids).toContain('count-25');
    expect(ids).toContain('tier-beginner');
    expect(ids).toContain('tier-intermediate');
    expect(ids).toContain('tier-advanced');
    expect(ids).toContain('goal-3'); // signature for the is_goal skill
  });
});

describe('earnedIdsFor — counts use ACTUAL marks, not effective', () => {
  it('marking one advanced skill does NOT cheat the 5-count via prereqs', () => {
    // Completing id 3 effectively completes 1,2,3 — but only ONE actual mark.
    const earned = earnedIdsFor([3], exercises);
    expect(earned.has('count-1')).toBe(true);  // 1 actual mark
    expect(earned.has('count-5')).toBe(false); // only 1 actual mark, not 5
  });
  it('reaches 5-count only with 5 real marks', () => {
    expect(earnedIdsFor([1, 2, 3, 4, 5], exercises).has('count-5')).toBe(true);
  });
});

describe('earnedIdsFor — tier mastery uses effective completion', () => {
  it('advanced tier completes when the advanced skill is done', () => {
    const earned = earnedIdsFor([3], exercises);
    expect(earned.has('tier-advanced')).toBe(true);       // id 3 done
    expect(earned.has('tier-intermediate')).toBe(true);   // id 2 done via prereq
    expect(earned.has('tier-beginner')).toBe(false);      // ids 4 & 5 still missing
  });
  it('beginner tier needs every beginner skill (1, 4, 5)', () => {
    expect(earnedIdsFor([1, 4, 5], exercises).has('tier-beginner')).toBe(true);
  });
});

describe('earnedIdsFor — signature trophy', () => {
  it('unlocks when the goal skill is (effectively) complete', () => {
    expect(earnedIdsFor([3], exercises).has('goal-3')).toBe(true);
    expect(earnedIdsFor([1], exercises).has('goal-3')).toBe(false);
  });
});

describe('evaluateAchievements — earned dates via chronological replay', () => {
  it('stamps each achievement with the completion that unlocked it', () => {
    const log = [
      { exerciseId: 4, completedAt: '2026-06-10T00:00:00Z' },
      { exerciseId: 1, completedAt: '2026-06-11T00:00:00Z' },
      { exerciseId: 5, completedAt: '2026-06-12T00:00:00Z' }, // completes Beginner tier
    ];
    const result = evaluateAchievements(log, exercises);
    const first = result.find((a) => a.id === 'count-1');
    const begTier = result.find((a) => a.id === 'tier-beginner');

    expect(first.earned).toBe(true);
    expect(first.at).toBe('2026-06-10T00:00:00Z'); // earliest mark
    expect(begTier.earned).toBe(true);
    expect(begTier.at).toBe('2026-06-12T00:00:00Z'); // the mark that finished the tier
  });
  it('reports progress for locked achievements', () => {
    const result = evaluateAchievements([{ exerciseId: 4, completedAt: '2026-06-10T00:00:00Z' }], exercises);
    const five = result.find((a) => a.id === 'count-5');
    expect(five.earned).toBe(false);
    expect(five.progress).toEqual({ current: 1, target: 5 });
  });
});
