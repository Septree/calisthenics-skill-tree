'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabase/client';
import { getUserName, setUserName, getProfileGoal, setProfileGoal } from './db-helpers';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profileName, setProfileName] = useState('');
  const [goalId, setGoalId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track the auth session. Keep this callback synchronous (no awaited Supabase
  // calls inside) to avoid the onAuthStateChange deadlock; fetch the name below.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Resolve the display name + active goal whenever the user changes.
  useEffect(() => {
    let active = true;
    if (user) {
      getUserName(user.id).then((name) => {
        if (active) setProfileName(name || user.user_metadata?.name || user.email.split('@')[0]);
      });
      getProfileGoal(user.id).then((id) => {
        if (active) setGoalId(id);
      });
    } else {
      setProfileName('');
      setGoalId(null);
    }
    return () => {
      active = false;
    };
  }, [user]);

  // Set (or clear, with null) the user's active goal.
  const setGoal = async (exerciseId) => {
    if (!user) return;
    setGoalId(exerciseId); // optimistic
    await setProfileGoal(user.id, exerciseId);
  };

  const loginWithGoogle = async (next = '/tree') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) throw error;
    // browser redirects to Google; the callback route finishes sign-in
  };

  const saveName = async (name) => {
    if (!user) return;
    const trimmed = name.trim();
    await setUserName(user.id, trimmed);
    setProfileName(trimmed || user.email.split('@')[0]);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, profileName, goalId, setGoal, loading, logout, saveName, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}
