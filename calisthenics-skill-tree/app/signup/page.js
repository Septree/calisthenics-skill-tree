'use client'

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { theme } from '../theme';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // create user account
      await createUserWithEmailAndPassword(auth, email, password);
      // redirect to home page on success
      window.location.href = '/';
    } catch (error) {
      // show error message
      setError(error.message);
      setLoading(false);
    }
  };
  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: theme.background.primary }}
    >
      <div 
        className="w-full max-w-md p-8 rounded-lg"
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

        {/* Signup Form */}
        <form onSubmit={handleSignup}>
          {/* Email Input */}
          <div className="mb-4">
            <label 
              className="block mb-2 text-sm font-medium"
              style={{ color: theme.text.secondary }}
            >
              Email
            </label>
            <input
              type="email"
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
              className="block mb-2 text-sm font-medium"
              style={{ color: theme.text.secondary }}
            >
              Password
            </label>
            <input
              type="password"
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
          <a 
            href="/login"
            style={{ color: theme.accent.primary }}
            className="font-medium hover:underline"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}