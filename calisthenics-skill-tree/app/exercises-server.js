import { exercises as builtInExercises } from './exercises-data';

// Server-side data for an exercise page. Built-ins come straight from code (so
// those pages prerender with no network). Custom skills are read from Firestore
// at request time (dynamic). Returns the exercise plus the full list so the page
// can render prerequisite / "unlocks" links.
export async function getExercisePageData(id) {
  const numId = parseInt(id);
  const builtin = builtInExercises.find((e) => e.id === numId);
  if (builtin) {
    return { exercise: builtin, all: builtInExercises };
  }

  try {
    const { db } = await import('./firebase');
    const { getDocs, collection } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'exercises'));
    const custom = snap.docs.map((d) => ({ _docId: d.id, ...d.data() }));
    const all = [...builtInExercises, ...custom];
    return { exercise: all.find((e) => e.id === numId) || null, all };
  } catch {
    return { exercise: null, all: builtInExercises };
  }
}

// Static params for built-in exercises (prerendered for SEO/speed).
export function builtInExerciseParams() {
  return builtInExercises.map((e) => ({ id: String(e.id) }));
}
