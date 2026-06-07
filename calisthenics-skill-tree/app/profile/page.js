'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Skeleton from '../Skeleton';
import { theme } from '../theme';
import { useExercises, getCategoriesFrom, getEffectiveCompleted } from '../useExercises';
import { useAuth } from '../AuthContext';
import { getUserProgress } from '../db-helpers';

export default function ProfilePage() {
  const { user, loading: authLoading, profileName, saveName } = useAuth();
  const { exercises } = useExercises();
  const [completedExercises, setCompletedExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // display-name editing
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);

  const handleSaveName = async () => {
    setSavingName(true);
    try {
      await saveName(nameDraft);
      setEditingName(false);
    } finally {
      setSavingName(false);
    }
  };
  // lets the progress bars animate from 0 to their value on mount
  const [barsReady, setBarsReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setBarsReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  // load user progress
  useEffect(() => {
    if (user) {
      getUserProgress(user.id).then((progress) => {
        setCompletedExercises(progress);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // completing a skill also counts its prerequisites as complete
  const effectiveCompleted = getEffectiveCompleted(completedExercises, exercises);

  // calculate real data
  const displayName = profileName || (user ? user.email.split('@')[0] : 'Guest');
  const userData = {
    name: displayName,
    initials: displayName.substring(0, 2).toUpperCase(),
    totalExercises: exercises.length,
    completedExercises: effectiveCompleted.length,
  };

  // calculate category progress with REAL data
  const categories = getCategoriesFrom(exercises);
  const categoryProgress = categories.map(cat => {
    const categoryExercises = exercises.filter(ex => ex.category === cat);
    const completedInCategory = categoryExercises.filter(ex =>
      effectiveCompleted.includes(ex.id)
    ).length;

    return {
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      completed: completedInCategory,  // real count!
      total: categoryExercises.length
    };
  });

  const overallProgress = userData.totalExercises > 0
    ? (userData.completedExercises / userData.totalExercises) * 100
    : 0;

  // Wait for Firebase auth to resolve before deciding what to show.
  // This prevents the brief "Please Sign In" flash on reload for logged-in users.
  if (authLoading || (user && isLoading)) {
    const card = { backgroundColor: theme.background.secondary, border: `1px solid ${theme.border.default}` };
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.background.primary }}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center gap-6 mb-12">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="rounded-lg p-6 mb-8" style={card}>
            <Skeleton className="h-12 w-24 mx-auto mb-2" />
            <Skeleton className="h-4 w-40 mx-auto" />
          </div>
          <div className="rounded-lg p-6 mb-8" style={card}>
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="rounded-lg p-6" style={card}>
            <Skeleton className="h-6 w-48 mb-6" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="mb-4">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // redirect if not logged in
  if (!user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.background.primary }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: theme.text.primary }}>
            Please Sign In
          </h1>
          <p className="mb-6" style={{ color: theme.text.tertiary }}>
            Sign in to view your progress
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded-lg font-semibold transition hover:opacity-90"
            style={{
              backgroundColor: theme.accent.primary,
              color: 'white'
            }}
          >
            Sign In
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
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* HEADER */}
        <div className="flex items-center gap-6 mb-12 reveal-up">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{ 
              backgroundColor: theme.background.tertiary,
              color: theme.text.primary 
            }}
          >
            {userData.initials}
          </div>

          <div className="flex-1">
            {editingName ? (
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  autoFocus
                  className="px-3 py-2 rounded-lg text-lg"
                  style={{
                    backgroundColor: theme.background.tertiary,
                    border: `1px solid ${theme.border.default}`,
                    color: theme.text.primary,
                  }}
                  placeholder="Your name"
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: theme.accent.primary, color: 'white' }}
                >
                  {savingName ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer hover:opacity-80"
                  style={{ color: theme.text.tertiary }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold" style={{ color: theme.text.primary }}>
                  {userData.name}
                </h1>
                <button
                  onClick={() => { setNameDraft(profileName); setEditingName(true); }}
                  className="text-sm cursor-pointer hover:underline"
                  style={{ color: theme.accent.primary }}
                >
                  Edit
                </button>
              </div>
            )}
            <p style={{ color: theme.text.tertiary }}>
              {userData.completedExercises} / {userData.totalExercises} exercises completed
            </p>
          </div>
        </div>

        {/* STATS CARD */}
        <div
          className="rounded-lg p-6 mb-8 reveal-up"
          style={{
            backgroundColor: theme.background.secondary,
            border: `1px solid ${theme.border.default}`,
            animationDelay: '0.08s',
          }}
        >
          <div className="text-center">
            <div 
              className="text-5xl font-bold mb-2"
              style={{ color: theme.accent.primary }}
            >
              {userData.completedExercises}
            </div>
            <div style={{ color: theme.text.tertiary }}>
              Exercises Completed
            </div>
          </div>
        </div>

        {/* OVERALL PROGRESS */}
        <div
          className="rounded-lg p-6 mb-8 reveal-up"
          style={{
            backgroundColor: theme.background.secondary,
            border: `1px solid ${theme.border.default}`,
            animationDelay: '0.16s',
          }}
        >
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: theme.text.primary }}
          >
            Overall Progress
          </h2>

          <div 
            className="flex justify-between text-sm mb-2"
            style={{ color: theme.text.tertiary }}
          >
            <span>Progress</span>
            <span>{userData.completedExercises} / {userData.totalExercises}</span>
          </div>

          <div 
            className="w-full rounded-full h-6"
            style={{ backgroundColor: theme.border.dark }}
          >
            <div
              className="h-6 rounded-full transition-all duration-700 flex items-center justify-center text-white text-xs font-semibold"
              style={{
                width: `${barsReady ? overallProgress : 0}%`,
                backgroundColor: theme.accent.primary
              }}
            >
              {overallProgress > 5 && `${overallProgress.toFixed(0)}%`}
            </div>
          </div>
        </div>

        {/* CATEGORY PROGRESS */}
        <div
          className="rounded-lg p-6 reveal-up"
          style={{
            animationDelay: '0.24s',
            backgroundColor: theme.background.secondary,
            border: `1px solid ${theme.border.default}`
          }}
        >
          <h2 
            className="text-xl font-bold mb-6"
            style={{ color: theme.text.primary }}
          >
            Progress by Category
          </h2>

          <div className="space-y-4">
            {categoryProgress.map((category, index) => {
              const percentage = (category.completed / category.total) * 100;

              return (
                <div key={index}>
                  <div 
                    className="flex justify-between text-sm mb-2"
                    style={{ color: theme.text.secondary }}
                  >
                    <span className="font-medium">{category.name}</span>
                    <span>{category.completed} / {category.total}</span>
                  </div>

                  <div 
                    className="w-full rounded-full h-3"
                    style={{ backgroundColor: theme.border.dark }}
                  >
                    <div
                      className="h-3 rounded-full transition-all duration-700"
                      style={{
                        width: `${barsReady ? percentage : 0}%`,
                        backgroundColor: theme.accent.primary
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BACK BUTTON */}
        <div className="mt-8">
          <Link
            href="/tree"
            className="block w-full text-center py-4 rounded-lg font-semibold transition hover:opacity-80"
            style={{
              backgroundColor: theme.background.tertiary,
              color: theme.accent.primary,
              border: `1px solid ${theme.border.default}`
            }}
          >
            Back to Skill Tree
          </Link>
        </div>

      </div>
    </div>
  );
}