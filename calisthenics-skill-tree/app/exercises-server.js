import { supabaseStatic } from './supabase/static';
import { rowToExercise } from './exercise-map';

// Server-side data for an exercise page. Reads from Supabase (public-read), so
// pages can prerender for SEO. Returns the exercise + the full list (for
// prerequisite / "unlocks" links).
export async function getExercisePageData(id) {
  const numId = parseInt(id);
  const { data, error } = await supabaseStatic.from('exercises').select('*');
  if (error || !data) {
    return { exercise: null, all: [] };
  }
  const all = data.map(rowToExercise);
  return { exercise: all.find((e) => e.id === numId) || null, all };
}

// Static params for every exercise (prerendered for SEO/speed).
export async function exerciseStaticParams() {
  const { data, error } = await supabaseStatic.from('exercises').select('id');
  if (error || !data) return [];
  return data.map((r) => ({ id: String(r.id) }));
}
