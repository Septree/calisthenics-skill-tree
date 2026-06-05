'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebase';
import { getUserName, setUserName } from './db-helpers';

// create context
const AuthContext = createContext({});

// hook to use auth context
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profileName, setProfileName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // prefer the user's chosen name; fall back to the email handle
        const name = await getUserName(u.uid);
        setProfileName(name || u.email.split('@')[0]);
      } else {
        setProfileName('');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // sign in with Google; seed the display name from the Google profile on first sign-in
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    try {
      const existing = await getUserName(result.user.uid);
      if (!existing && result.user.displayName) {
        await setUserName(result.user.uid, result.user.displayName);
        setProfileName(result.user.displayName);
      }
    } catch {
      // non-fatal — name can still be set later in the profile
    }
    return result;
  };

  // update the user's chosen display name
  const saveName = async (name) => {
    if (!user) return;
    const trimmed = name.trim();
    await setUserName(user.uid, trimmed);
    setProfileName(trimmed || user.email.split('@')[0]);
  };

  // logout function
  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profileName, loading, logout, saveName, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}
