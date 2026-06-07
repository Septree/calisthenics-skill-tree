import { supabase } from './supabase/client';
import { rowToExercise, exerciseToRow } from './exercise-map';

// ---- progress (completions table) ----
export async function getUserProgress(userId) {
  const { data, error } = await supabase.from('completions').select('exercise_id').eq('user_id', userId);
  if (error) {
    console.error('Error getting user progress:', error);
    return [];
  }
  return data.map((r) => r.exercise_id);
}

export async function markExerciseComplete(userId, exerciseId) {
  const { error } = await supabase.from('completions').insert({ user_id: userId, exercise_id: exerciseId });
  if (error && error.code !== '23505') {
    // 23505 = already completed (unique violation) → treat as success
    console.error('Error marking exercise complete:', error);
    return false;
  }
  return true;
}

export async function markExerciseIncomplete(userId, exerciseId) {
  const { error } = await supabase
    .from('completions')
    .delete()
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId);
  if (error) {
    console.error('Error marking exercise incomplete:', error);
    return false;
  }
  return true;
}

export function isExerciseCompleted(completedExercises, exerciseId) {
  return completedExercises.includes(exerciseId);
}

// ---- display name (profiles table) ----
export async function getUserName(userId) {
  const { data, error } = await supabase.from('profiles').select('name').eq('id', userId).maybeSingle();
  if (error) {
    console.error('Error getting user name:', error);
    return '';
  }
  return data?.name || '';
}

export async function setUserName(userId, name) {
  const { error } = await supabase.from('profiles').upsert({ id: userId, name });
  if (error) console.error('Error setting user name:', error);
}

// ---- exercises (all skills live in the DB now) ----
export async function getCustomExercises() {
  const { data, error } = await supabase.from('exercises').select('*').order('id');
  if (error) {
    console.error('Error getting exercises:', error);
    return [];
  }
  return data.map(rowToExercise);
}

export async function addCustomExercise(data) {
  const { data: row, error } = await supabase
    .from('exercises')
    .insert(exerciseToRow(data))
    .select('id')
    .single();
  if (error) throw error;
  return row.id;
}

export async function updateCustomExercise(id, data) {
  const { error } = await supabase.from('exercises').update(exerciseToRow(data)).eq('id', id);
  if (error) throw error;
}

export async function deleteCustomExercise(id) {
  const { error } = await supabase.from('exercises').delete().eq('id', id);
  if (error) throw error;
}

// ---- image upload (Supabase Storage; takes a compressed Blob) ----
export async function uploadExerciseImage(blob) {
  const type = blob.type || 'image/png';
  const ext = (type.split('/')[1] || 'png').replace('jpeg', 'jpg');
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('exercise-images').upload(path, blob, { contentType: type });
  if (error) throw error;
  return supabase.storage.from('exercise-images').getPublicUrl(path).data.publicUrl;
}
