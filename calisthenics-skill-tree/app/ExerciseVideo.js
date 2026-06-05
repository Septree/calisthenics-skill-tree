'use client'

import { useExercises } from './useExercises';
import Skeleton from './Skeleton';
import { theme } from './theme';

// Client island: looks up the (admin-set) YouTube video id for this skill and
// embeds it. Kept client-side so the video stays fresh without re-rendering the
// statically-generated page.
export default function ExerciseVideo({ exerciseId, name }) {
  const { exercises, loading } = useExercises();
  const ex = exercises.find((e) => e.id === exerciseId);
  const videoId = ex?.videoId;

  if (videoId) {
    return (
      <div className="w-full rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={`${name} video tutorial`}
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 'none' }}
        />
      </div>
    );
  }

  // still loading the data — show a shimmering placeholder
  if (loading && !ex) {
    return <Skeleton className="w-full" style={{ aspectRatio: '16/9' }} />;
  }

  return (
    <div
      className="w-full rounded-lg flex items-center justify-center"
      style={{
        backgroundColor: theme.background.tertiary,
        border: `2px dashed ${theme.border.default}`,
        aspectRatio: '16/9',
      }}
    >
      <p style={{ color: theme.text.tertiary }}>No video yet</p>
    </div>
  );
}
