// Pure progression logic — the shared primitive behind goals, unlock states,
// next-step recommendations and progress metrics. No imports, so it runs
// unchanged in client components, server reads, and unit tests.

// id -> exercise lookup.
export function indexById(exercises) {
  return new Map((exercises || []).map((e) => [e.id, e]));
}

// Completing a skill implies its transitive prerequisites are complete too.
// Returns a Set of effectively-completed ids.
export function effectiveCompletedSet(completedIds, byId) {
  const done = new Set(completedIds || []);
  const stack = [...done];
  while (stack.length) {
    const ex = byId.get(stack.pop());
    if (!ex) continue;
    for (const p of ex.prerequisites || []) {
      if (!done.has(p)) {
        done.add(p);
        stack.push(p);
      }
    }
  }
  return done;
}

// Every id on the path to a goal: the goal itself + all transitive prerequisites.
export function goalPathSet(goalId, byId) {
  const path = new Set();
  if (goalId == null || !byId.has(goalId)) return path;
  const stack = [goalId];
  while (stack.length) {
    const id = stack.pop();
    if (path.has(id)) continue;
    path.add(id);
    const ex = byId.get(id);
    for (const p of ex?.prerequisites || []) stack.push(p);
  }
  return path;
}

// Base unlock state from completion alone: 'completed' | 'available' | 'locked'.
// `doneSet` must already be the EFFECTIVE completed set.
export function baseState(exerciseId, doneSet, byId) {
  if (doneSet.has(exerciseId)) return 'completed';
  const prereqs = byId.get(exerciseId)?.prerequisites || [];
  return prereqs.every((p) => doneSet.has(p)) ? 'available' : 'locked';
}

// Full 4-state, goal-aware. An available skill that sits on the active goal
// path is what the user should train now -> 'in_progress'. Without new
// per-skill progress data this is the meaningful reading of "in progress".
// Returns 'completed' | 'in_progress' | 'available' | 'locked'.
export function skillState(exerciseId, doneSet, byId, goalPath) {
  const s = baseState(exerciseId, doneSet, byId);
  if (s === 'available' && goalPath && goalPath.has(exerciseId)) return 'in_progress';
  return s;
}

// Recommended next skills toward a goal: on the goal path, unlocked, not done.
// Usually 1-2 skills — the current training frontier.
export function recommendedNext(goalId, doneSet, byId) {
  const next = [];
  for (const id of goalPathSet(goalId, byId)) {
    if (!doneSet.has(id) && baseState(id, doneSet, byId) === 'available') next.push(id);
  }
  return next;
}

// Progress toward a goal = completed-on-path / total-on-path.
export function goalProgress(goalId, doneSet, byId) {
  const path = goalPathSet(goalId, byId);
  if (path.size === 0) return { completed: 0, total: 0, pct: 0 };
  let completed = 0;
  for (const id of path) if (doneSet.has(id)) completed += 1;
  return { completed, total: path.size, pct: pct(completed, path.size) };
}

// ---- progression metrics (Phase 3) ----
const pct = (completed, total) => (total > 0 ? Math.round((completed / total) * 100) : 0);

// Overall completion across every skill.
export function overallProgress(exercises, doneSet) {
  let completed = 0;
  for (const e of exercises) if (doneSet.has(e.id)) completed += 1;
  return { completed, total: exercises.length, pct: pct(completed, exercises.length) };
}

// Generic "group by a field, count completed" → ordered [{ key, completed, total, pct }].
// `order` lists keys to surface first; any extras follow in first-seen order.
function groupProgress(exercises, doneSet, keyOf, order = []) {
  const groups = new Map();
  for (const e of exercises) {
    const k = keyOf(e);
    const g = groups.get(k) || { completed: 0, total: 0 };
    g.total += 1;
    if (doneSet.has(e.id)) g.completed += 1;
    groups.set(k, g);
  }
  const out = [];
  for (const k of order) {
    if (groups.has(k)) {
      const g = groups.get(k);
      out.push({ key: k, ...g, pct: pct(g.completed, g.total) });
      groups.delete(k);
    }
  }
  for (const [k, g] of groups) out.push({ key: k, ...g, pct: pct(g.completed, g.total) });
  return out;
}

export function categoryProgress(exercises, doneSet) {
  return groupProgress(exercises, doneSet, (e) => e.category || 'other');
}

export const TIER_ORDER = ['Beginner', 'Intermediate', 'Advanced'];
export function tierProgress(exercises, doneSet) {
  return groupProgress(exercises, doneSet, (e) => e.difficulty || 'Beginner', TIER_ORDER);
}
