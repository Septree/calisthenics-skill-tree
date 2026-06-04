'use client'

import Link from 'next/link';
import { theme } from '../../theme';
import { useExercises, getEffectiveCompleted } from '../../useExercises';
import ExerciseIcon from '../../ExerciseIcon';
import { use, useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { getUserProgress, markExerciseComplete, markExerciseIncomplete, isExerciseCompleted } from '../../db-helpers';

// Fetch a YouTube video for the exercise via our server route, so the API key
// stays on the server and never reaches the browser bundle.
async function fetchYouTubeVideo(exerciseName) {
  try {
    const response = await fetch(`/api/youtube?name=${encodeURIComponent(exerciseName)}`);
    const data = await response.json();
    return data.videoId ?? null;
  } catch (error) {
    console.error("YouTube fetch error:", error);
    return null;
  }
}
//this was a bit complicated, but since it was outside the scope of the project i did use some ai help to assist with the logic here
export default function ExerciseDetailPage({ params }) {
  const unwrappedParams = use(params);
  const exerciseId = parseInt(unwrappedParams.id);
  const { exercises, loading: exercisesLoading } = useExercises();
  const exercise = exercises.find((e) => e.id === exerciseId);

  // this state to store the YouTube video ID
  const [videoId, setVideoId] = useState(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  //progress state, check if this exercise is completed
  const { user } = useAuth();
  const [completedExercises, setCompletedExercises] = useState([]);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  // drives the celebratory animation right after marking complete
  const [justCompleted, setJustCompleted] = useState(false);

  // actual = explicitly marked here; effective = also true if a later skill that
  // depends on this one is complete (completing a skill completes its prereqs).
  const isActual = isExerciseCompleted(completedExercises, exerciseId);
  const effectiveCompleted = getEffectiveCompleted(completedExercises, exercises);
  const isCompleted = effectiveCompleted.includes(exerciseId);
  const derivedOnly = isCompleted && !isActual;

  // now we will fetch YouTube video when it loads
  useEffect(() => {
    if (exercise) {
      fetchYouTubeVideo(exercise.name).then((id) => {
        setVideoId(id);
        setIsLoadingVideo(false);
      });
    }
  }, [exercise]);
  useEffect(() => { // load user progress
  if (user) {
    getUserProgress(user.uid).then((progress) => {
      setCompletedExercises(progress);
      setIsLoadingProgress(false);
    });
  } else {
    setIsLoadingProgress(false);
  }
}, [user]);
// this function to mark exercise as complete
const handleMarkComplete = async () => {
  if (!user) {
    alert('Please sign in to track progress');
    return;
  }

  setIsMarkingComplete(true);

  // toggle based on what's explicitly stored for THIS skill
  if (isActual) {
    const success = await markExerciseIncomplete(user.uid, exerciseId);
    if (success) {
      // remove from local state
      setCompletedExercises(completedExercises.filter(id => id !== exerciseId));
    }
  } else {
    const success = await markExerciseComplete(user.uid, exerciseId);
    if (success) {
      // add to local state
      setCompletedExercises([...completedExercises, exerciseId]);
      // fire the celebration animation
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 1400);
    }
  }

  setIsMarkingComplete(false);
};

  // still loading the merged exercise list — wait before deciding "not found"
  if (!exercise && exercisesLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.background.primary }}
      >
        <p style={{ color: theme.text.tertiary }}>Loading exercise...</p>
      </div>
    );
  }

  // if exercise not found, show error
  if (!exercise) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.background.primary }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: theme.text.primary }}>
            Exercise Not Found
          </h1>
          <Link
            href="/exercises"
            className="inline-block px-6 py-3 rounded-lg font-semibold transition hover:opacity-90"
            style={{
              backgroundColor: theme.accent.primary,
              color: 'white'
            }}
          >
            Back to All Exercises
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.background.primary }}
    >
      {/* CELEBRATION OVERLAY — shows briefly after marking complete */}
      {justCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div className="relative">
            {/* radiating burst rays */}
            {[...Array(8)].map((_, i) => (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 w-2 h-16 rounded-full animate-burst-ray"
                style={{
                  backgroundColor: theme.accent.success,
                  transform: `rotate(${i * 45}deg) translateY(-40px)`,
                  transformOrigin: 'center top',
                }}
              />
            ))}
            {/* center badge */}
            <div
              className="relative w-28 h-28 rounded-full flex items-center justify-center text-5xl font-bold animate-celebrate"
              style={{ backgroundColor: theme.accent.success, color: 'white' }}
            >
              ✓
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 reveal-up">
          
          {/* LEFT COLUMN - Exercise Info */}
          <div>
            {/* Icon and Header */}
            <div className="flex items-center gap-6 mb-6">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center p-4 flex-shrink-0 overflow-hidden"
                style={{
                  backgroundColor: theme.background.tertiary,
                  border: `2px solid ${theme.border.light}`
                }}
              >
                <ExerciseIcon
                  src={exercise.icon}
                  name={exercise.name}
                  className="w-full h-full object-contain"
                  style={{ fontSize: '1.75rem' }}
                />
              </div>

              <div className="flex-1">
                <h1 
                  className="text-3xl font-bold mb-3"
                  style={{ color: theme.text.primary }}
                >
                  {exercise.name}
                </h1>
                
                <div className="flex gap-3">
                  {/* Difficulty Badge */}
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: theme.hoverBox.badge.background,
                      color: theme.hoverBox.badge.text,
                      border: `1px solid ${theme.hoverBox.badge.border}`
                    }}
                  >
                    {exercise.difficulty}
                  </span>

                  {/* Category Badge */}
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-semibold uppercase"
                    style={{
                      backgroundColor: theme.background.tertiary,
                      color: theme.text.secondary,
                      border: `1px solid ${theme.border.default}`
                    }}
                  >
                    {exercise.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div 
              className="rounded-lg p-6"
              style={{ 
                backgroundColor: theme.background.secondary,
                border: `1px solid ${theme.border.default}`
              }}
            >
              <h2 
                className="text-xl font-bold mb-3"
                style={{ color: theme.text.primary }}
              >
                About This Exercise
              </h2>
              <p 
                className="text-base leading-relaxed"
                style={{ color: theme.text.secondary }}
              >
                {exercise.summary}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN - Video */}
          <div>
            <div 
              className="rounded-lg p-6"
              style={{ 
                backgroundColor: theme.background.secondary,
                border: `1px solid ${theme.border.default}`
              }}
            >
              <h2 
                className="text-xl font-bold mb-4"
                style={{ color: theme.text.primary }}
              >
                Video Tutorial
              </h2>
              
          {/* Video Section - Shows real YouTube video or loading state */}
          {isLoadingVideo ? (
            // LOADING STATE
            <div 
              className="w-full rounded-lg flex items-center justify-center"
              style={{ 
                backgroundColor: theme.background.tertiary,
                border: `2px dashed ${theme.border.default}`,
                aspectRatio: '16/9'
              }}
            >
              <div className="text-center px-4">
                <p style={{ color: theme.text.tertiary }}>
                  Loading video...
                </p>
              </div>
            </div>
          ) : videoId ? (
            // VIDEO FOUND - Embed YouTube video
            <div 
              className="w-full rounded-lg overflow-hidden"
              style={{ aspectRatio: '16/9' }}
            >
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title={`${exercise.name} video tutorial`}
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: 'none' }}
              />
            </div>
          ) : (
            // NO VIDEO FOUND
            <div 
              className="w-full rounded-lg flex items-center justify-center"
              style={{ 
                backgroundColor: theme.background.tertiary,
                border: `2px dashed ${theme.border.default}`,
                aspectRatio: '16/9'
              }}
            >
              <div className="text-center px-4">
                <p style={{ color: theme.text.tertiary }}>
                  No video found
                </p>
              </div>
            </div>
          )}
            </div>
          </div>
        </div>

        {/* INSTRUCTIONS SECTION */}
        <div
          className="rounded-lg p-6 mb-8 reveal-up"
          style={{
            backgroundColor: theme.background.secondary,
            border: `1px solid ${theme.border.default}`,
            animationDelay: '0.08s',
          }}
        >
          <h2 
            className="text-xl font-bold mb-4"
            style={{ color: theme.text.primary }}
          >
            How to Perform
          </h2>
          
          {/* Step-by-Step */}
          <div className="mb-6">
            <h3 
              className="text-lg font-semibold mb-3"
              style={{ color: theme.text.primary }}
            >
              Step-by-Step Instructions
            </h3>
            <p style={{ color: theme.text.tertiary }}>
              Instructions will be added here
            </p>
          </div>

          {/* Common Mistakes */}
          <div className="mb-6">
            <h3 
              className="text-lg font-semibold mb-3"
              style={{ color: theme.text.primary }}
            >
              Common Mistakes to Avoid
            </h3>
            <p style={{ color: theme.text.tertiary }}>
              Instructions will be added here
            </p>
          </div>

          {/* Pro Tips */}
          <div className="mb-6">
            <h3 
              className="text-lg font-semibold mb-3"
              style={{ color: theme.text.primary }}
            >
              Pro Tips
            </h3>
            <p style={{ color: theme.text.tertiary }}>
              Instructions will be added here
            </p>
          </div>

          {/* Form Cues */}
          <div>
            <h3 
              className="text-lg font-semibold mb-3"
              style={{ color: theme.text.primary }}
            >
              Form Cues
            </h3>
            <p style={{ color: theme.text.tertiary }}>
              Instructions will be added here
            </p>
          </div>
        </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* mark as complete button */}
            {user && (
              <button
                onClick={handleMarkComplete}
                disabled={isMarkingComplete || derivedOnly}
                title={derivedOnly ? 'Completed automatically because a skill that requires it is complete.' : undefined}
                className={`py-4 rounded-lg font-semibold transition hover:opacity-90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${justCompleted ? 'animate-celebrate' : ''}`}
                style={{
                  backgroundColor: isCompleted ? theme.accent.success : theme.accent.primary,
                  color: 'white',
                  boxShadow: justCompleted ? `0 0 24px ${theme.accent.success}` : 'none',
                }}
              >
                {isMarkingComplete
                  ? 'Saving...'
                  : derivedOnly
                  ? '✓ Completed (via a later skill)'
                  : isActual
                  ? '✓ Completed — tap to undo'
                  : 'Mark as Complete'}
              </button>
            )}
            
            {/* Back Button */}
            <Link
              href="/exercises"
              className="flex items-center justify-center py-4 rounded-lg font-semibold transition hover:opacity-90"
              style={{
                backgroundColor: theme.background.tertiary,
                color: theme.text.primary,
                border: `1px solid ${theme.border.default}`
              }}
            >
              Back to All Exercises
            </Link>
          </div>

      </div>
    </div>
  );
}