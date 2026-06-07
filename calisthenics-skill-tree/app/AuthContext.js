'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabase/client';
import { getUserName, setUserName } from './db-helpers';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profileName, setProfileName] = useState('');
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

  // Resolve the display name whenever the user changes.
  useEffect(() => {
    let active = true;
    if (user) {
      getUserName(user.id).then((name) => {
        if (active) setProfileName(name || user.user_metadata?.name || user.email.split('@')[0]);
      });
    } else {
      setProfileName('');
    }
    return () => {
      active = false;
    };
  }, [user]);

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/tree` },
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
    <AuthContext.Provider value={{ user, profileName, loading, logout, saveName, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}
