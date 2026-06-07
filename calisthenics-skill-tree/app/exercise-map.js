// Pure mappers between the Supabase `exercises` row and the app's exercise shape.
// No imports → safe in both client and server modules.

export function rowToExercise(r) {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    difficulty: r.difficulty,
    summary: r.summary || '',
    icon: r.icon || '',
    videoId: r.video_id || '',
    position: { left: r.position_left ?? 0, top: r.position_top ?? 0 },
    prerequisites: r.prerequisites || [],
    instructions: r.instructions || [],
    mistakes: r.mistakes || [],
    tips: r.tips || [],
  };
}

export function exerciseToRow(d) {
  return {
    name: d.name,
    category: d.category,
    difficulty: d.difficulty,
    summary: d.summary || '',
    icon: d.icon || '',
    video_id: d.videoId || '',
    position_left: d.position?.left ?? 0,
    position_top: d.position?.top ?? 0,
    prerequisites: d.prerequisites || [],
    instructions: d.instructions || [],
    mistakes: d.mistakes || [],
    tips: d.tips || [],
  };
}
