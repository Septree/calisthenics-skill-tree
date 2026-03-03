'use client'

import { useState, useEffect } from 'react';
import { theme } from '../theme';
import { exercises, getCategories } from '../exercises-data';
import { useAuth } from '../AuthContext';
import { getUserProgress } from '../db-helpers';

export default function ProfilePage() {
  const { user } = useAuth();
  const [completedExercises, setCompletedExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // load user progress
  useEffect(() => {
    if (user) {
      getUserProgress(user.uid).then((progress) => {
        setCompletedExercises(progress);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // calculate real data
  const userData = {
    name: user ? user.email.split('@')[0] : "Guest",  // Username from email
    initials: user ? user.email.substring(0, 2).toUpperCase() : "GU",
    totalExercises: exercises.length,
    completedExercises: completedExercises.length,  // Real count!
  };

  // calculate category progress with REAL data
  const categories = getCategories();
  const categoryProgress = categories.map(cat => {
    const categoryExercises = exercises.filter(ex => ex.category === cat);
    const completedInCategory = categoryExercises.filter(ex => 
      completedExercises.includes(ex.id)
    ).length;

    return {
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      completed: completedInCategory,  // real count!
      total: categoryExercises.length
    };
  });

  const overallProgress = (userData.completedExercises / userData.totalExercises) * 100;

  // show loading state
  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.background.primary }}
      >
        <p style={{ color: theme.text.tertiary }}>Loading progress...</p>
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
          <a 
            href="/login"
            className="inline-block px-6 py-3 rounded-lg font-semibold transition hover:opacity-90"
            style={{ 
              backgroundColor: theme.accent.primary,
              color: 'white'
            }}
          >
            Sign In
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
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* HEADER */}
        <div className="flex items-center gap-6 mb-12">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{ 
              backgroundColor: theme.background.tertiary,
              color: theme.text.primary 
            }}
          >
            {userData.initials}
          </div>

          <div>
            <h1 
              className="text-3xl font-bold mb-1"
              style={{ color: theme.text.primary }}
            >
              {userData.name}
            </h1>
            <p style={{ color: theme.text.tertiary }}>
              {userData.completedExercises} / {userData.totalExercises} exercises completed
            </p>
          </div>
        </div>

        {/* STATS CARD */}
        <div 
          className="rounded-lg p-6 mb-8"
          style={{ 
            backgroundColor: theme.background.secondary,
            border: `1px solid ${theme.border.default}`
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
              className="h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-xs font-semibold"
              style={{ 
                width: `${overallProgress}%`,
                backgroundColor: theme.accent.primary 
              }}
            >
              {overallProgress > 5 && `${overallProgress.toFixed(0)}%`}
            </div>
          </div>
        </div>

        {/* CATEGORY PROGRESS */}
        <div 
          className="rounded-lg p-6"
          style={{ 
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
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
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
          <a 
            href="/"
            className="block w-full text-center py-4 rounded-lg font-semibold transition hover:opacity-80"
            style={{ 
              backgroundColor: theme.accent.tertiary,
              color: theme.accent.primary,
              border: `1px solid${theme.border.default}`
            }}
          >
            Back to Skill Tree
          </a>
        </div>

      </div>
    </div>
  );
}