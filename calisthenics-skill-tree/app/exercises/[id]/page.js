'use client'

import { theme } from '../../theme';
import { getExerciseById } from '../../exercises-data';
import { use, useState, useEffect } from 'react';  
import { useAuth } from '../../AuthContext'; 
import { getUserProgress, markExerciseComplete, markExerciseIncomplete, isExerciseCompleted } from '../../db-helpers';

// this will fetch a YouTube video for the exercise we want
async function fetchYouTubeVideo(exerciseName) {
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const searchQuery = `${exerciseName} calisthenics tutorial form`;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=1&key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const videoId = data.items[0].id.videoId;
      return videoId;
    }
    return null;
  } catch (error) {
    console.error("YouTube API Error:", error);
    return null;
  }
}
//this was a bit complicated, but since it was outside the scope of the project i did use some ai help to assist with the logic here
export default function ExerciseDetailPage({ params }) {
  const unwrappedParams = use(params);
  const exerciseId = parseInt(unwrappedParams.id);
  const exercise = getExerciseById(exerciseId);

  // this state to store the YouTube video ID
  const [videoId, setVideoId] = useState(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  //progress state, check if this exercise is completed
  const { user } = useAuth();
  const [completedExercises, setCompletedExercises] = useState([]);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  // check if this exercise is completed
  const isCompleted = isExerciseCompleted(completedExercises, exerciseId);

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

  // toggle: if completed, mark incomplete. if incomplete, mark complete.
  if (isCompleted) {
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
    }
  }

  setIsMarkingComplete(false);
};

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
          <a 
            href="/exercises"
            className="inline-block px-6 py-3 rounded-lg font-semibold transition hover:opacity-90"
            style={{ 
              backgroundColor: theme.accent.primary,
              color: 'white'
            }}
          >
            Back to All Exercises
          </a>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: theme.background.primary }}
    >
      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* LEFT COLUMN - Exercise Info */}
          <div>
            {/* Icon and Header */}
            <div className="flex items-center gap-6 mb-6">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center p-4 flex-shrink-0"
                style={{ 
                  backgroundColor: theme.background.tertiary,
                  border: `2px solid ${theme.border.light}`
                }}
              >
                <img 
                  src={exercise.icon}
                  alt={exercise.name}
                  className="w-full h-full object-contain"
                  style={{ filter: 'brightness(1.2)' }}
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
                src={`https://www.youtube.com/embed/${videoId}`}
                title={`${exercise.name} Tutorial`}
                frameBorder="0"
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
          className="rounded-lg p-6 mb-8"
          style={{ 
            backgroundColor: theme.background.secondary,
            border: `1px solid ${theme.border.default}`
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
                disabled={isMarkingComplete}
                className="py-4 rounded-lg font-semibold transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isCompleted ? theme.accent.success : theme.accent.primary,
                  color: 'white'
                }}
              >
                {isMarkingComplete ? 'Saving...' : isCompleted ? '✓ Completed (Click to Undo)' : 'Mark as Complete'}
              </button>
            )}
            
            {/* Back Button */}
            <a 
              href="/exercises"
              className="block text-center py-4 rounded-lg font-semibold transition hover:opacity-90"
              style={{ 
                backgroundColor: theme.background.tertiary,
                color: theme.text.primary,
                border: `1px solid ${theme.border.default}`
              }}
            >
               Back to All Exercises
            </a>
          </div>

      </div>
    </div>
  );
}