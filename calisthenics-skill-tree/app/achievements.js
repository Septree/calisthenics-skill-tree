// Achievements (Phase 7) — derived entirely from the user's completions, no
// schema. Three families: skill-count milestones (counted from ACTUAL marks so
// transitive prereqs can't game them), difficulty-tier mastery and per-goal
// signature trophies (effective completion, consistent with the rest of the app).
import { indexById, effectiveCompletedSet, TIER_ORDER } from './progression';

const COUNT_TIERS = [
  { id: 'count-1', threshold: 1, name: 'First Step', glyph: '🌱', description: 'Complete your first skill' },
  { id: 'count-5', threshold: 5, name: 'Getting Strong', glyph: '⭐', description: 'Complete 5 skills' },
  { id: 'count-10', threshold: 10, name: 'Dedicated', glyph: '🔥', description: 'Complete 10 skills' },
  { id: 'count-25', threshold: 25, name: 'Beast Mode', glyph: '💪', description: 'Complete 25 skills' },
];

const TIER_GLYPH = { Beginner: '🥉', Intermediate: '🥈', Advanced: '🥇' };

// Build the full descriptor list for a given skill set. Each descriptor carries
// a `test(effSet, actualSet, byId)` predicate and a `progress(effSet, actualSet)`
// for the locked-state "3 / 5" display. `tone` drives the badge colour family.
export function buildAchievements(exercises) {
  const list = [];

  for (const c of COUNT_TIERS) {
    list.push({
      id: c.id,
      name: c.name,
      description: c.description,
      glyph: c.glyph,
      tone: 'count',
      test: (_eff, actual) => actual.size >= c.threshold,
      progress: (_eff, actual) => ({ current: Math.min(actual.size, c.threshold), target: c.threshold }),
    });
  }

  for (const tier of TIER_ORDER) {
    const inTier = exercises.filter((e) => (e.difficulty || 'Beginner') === tier);
    if (inTier.length === 0) continue;
    const ids = inTier.map((e) => e.id);
    list.push({
      id: `tier-${tier.toLowerCase()}`,
      name: `${tier} Complete`,
      description: `Complete every ${tier} skill`,
      glyph: TIER_GLYPH[tier] || '🎖️',
      tone: 'tier',
      test: (eff) => ids.every((id) => eff.has(id)),
      progress: (eff) => ({ current: ids.filter((id) => eff.has(id)).length, target: ids.length }),
    });
  }

  for (const goal of exercises.filter((e) => e.isGoal)) {
    list.push({
      id: `goal-${goal.id}`,
      name: `Achieved: ${goal.name}`,
      description: `Reach the ${goal.name} milestone`,
      glyph: '🏆',
      tone: 'signature',
      test: (eff) => eff.has(goal.id),
      progress: (eff) => ({ current: eff.has(goal.id) ? 1 : 0, target: 1 }),
    });
  }

  return list;
}

// Set of achievement ids currently earned given the ACTUAL completed ids. Used
// for the live unlock diff (before vs after a mark-complete) — no dates needed.
export function earnedIdsFor(actualIds, exercises) {
  const byId = indexById(exercises);
  const actual = new Set(actualIds || []);
  const eff = effectiveCompletedSet(actualIds, byId);
  const earned = new Set();
  for (const a of buildAchievements(exercises)) {
    if (a.test(eff, actual, byId)) earned.add(a.id);
  }
  return earned;
}

// Full evaluation for the profile grid. Replays the completion log in
// chronological order so each earned achievement gets the timestamp of the
// completion that unlocked it. `log` = [{ exerciseId, completedAt }] (any order).
export function evaluateAchievements(log, exercises) {
  const byId = indexById(exercises);
  const achievements = buildAchievements(exercises);
  const earnedAt = new Map(); // achievement id -> ISO timestamp

  const chronological = [...(log || [])].sort(
    (a, b) => new Date(a.completedAt) - new Date(b.completedAt),
  );

  const actualIds = [];
  for (const entry of chronological) {
    actualIds.push(entry.exerciseId);
    const actual = new Set(actualIds);
    const eff = effectiveCompletedSet(actualIds, byId);
    for (const a of achievements) {
      if (!earnedAt.has(a.id) && a.test(eff, actual, byId)) {
        earnedAt.set(a.id, entry.completedAt);
      }
    }
  }

  // Final sets for the locked-state progress display.
  const finalActual = new Set(actualIds);
  const finalEff = effectiveCompletedSet(actualIds, byId);

  return achievements.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    glyph: a.glyph,
    tone: a.tone,
    earned: earnedAt.has(a.id),
    at: earnedAt.get(a.id) || null,
    progress: a.progress(finalEff, finalActual),
  }));
}
