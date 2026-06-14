'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../supabase/client';
import { theme } from '../theme';
import GoogleSignInButton from '../GoogleSignInButton';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    // The DB trigger creates the profile row using this name.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name.trim() } },
    });

    if (error) {
      const m = (error.message || '').toLowerCase();
      if (m.includes('already') || m.includes('registered')) setError('An account with this email already exists.');
      else if (m.includes('valid') && m.includes('email')) setError('Please enter a valid email address.');
      else if (m.includes('password')) setError('Password should be at least 6 characters.');
      else setError('Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    if (data.session) {
      // signed in immediately (email confirmation disabled) → onboard the new user
      router.push('/onboarding');
      router.refresh();
    } else {
      // email confirmation is on — no session yet
      setNotice('Account created! Check your email to confirm, then log in.');
      setLoading(false);
    }
  };
  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: theme.background.primary }}
    >
      <div
        className="w-full max-w-md p-8 rounded-lg reveal-up"
        style={{
          backgroundColor: theme.background.secondary,
          border: `1px solid ${theme.border.default}`
        }}
      >
        {/* Header */}
        <h1 
          className="text-3xl font-bold text-center mb-2"
          style={{ color: theme.text.primary }}
        >
          Create Account
        </h1>
        <p
          className="text-center mb-8"
          style={{ color: theme.text.tertiary }}
        >
          Sign up to track your calisthenics progress
        </p>

        <GoogleSignInButton next="/onboarding" />

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ backgroundColor: theme.border.default }} />
          <span className="text-xs uppercase tracking-wide" style={{ color: theme.text.tertiary }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: theme.border.default }} />
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup}>
          {/* Name Input */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium"
              style={{ color: theme.text.secondary }}
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg"
              style={{
                backgroundColor: theme.background.tertiary,
                border: `1px solid ${theme.border.default}`,
                color: theme.text.primary,
              }}
              placeholder="What should we call you?"
            />
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium"
              style={{ color: theme.text.secondary }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg"
              style={{
                backgroundColor: theme.background.tertiary,
                border: `1px solid ${theme.border.default}`,
                color: theme.text.primary,
              }}
              placeholder="your@email.com"
            />
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium"
              style={{ color: theme.text.secondary }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg"
              style={{
                backgroundColor: theme.background.tertiary,
                border: `1px solid ${theme.border.default}`,
                color: theme.text.primary,
              }}
              placeholder="At least 6 characters"
            />
          </div>

          {/* Success / confirm-email notice */}
          {notice && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.12)',
                color: theme.accent.success,
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}
            >
              {notice}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold transition hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: theme.accent.primary,
              color: 'white'
            }}
          >
            {loading ? 'Creating Account...' : 'Sign Up' }
          </button>
        </form>

        {/* Link to Login */}
        <p 
          className="text-center mt-6 text-sm"
          style={{ color: theme.text.tertiary }}
        >
          Already have an account?{' '}
          <Link
            href="/login"
            style={{ color: theme.accent.primary }}
            className="font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}