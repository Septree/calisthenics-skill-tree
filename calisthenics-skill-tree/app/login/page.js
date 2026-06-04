'use client'
//similar code as signup, just for signing in instead
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { theme } from '../theme';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // sign in user
      await signInWithEmailAndPassword(auth, email, password);
      // redirect to home page on success
      router.push('/');
    } catch (error) {
      // Generic message for all credential errors so we don't reveal whether an
      // email is registered (prevents user enumeration). Keep rate-limit hint useful.
      if (error.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment and try again.');
      } else if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-email'
      ) {
        setError('Invalid email or password');
      } else {
        setError('Something went wrong. Please try again.');
      }
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
          Welcome Back
        </h1>
        <p 
          className="text-center mb-8"
          style={{ color: theme.text.tertiary }}
        >
          Log in to continue tracking your progress
        </p>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg"
              style={{
                backgroundColor: theme.background.tertiary,
                border: `1px solid ${theme.border.default}`,
                color: theme.text.primary,
              }}
              placeholder="Enter your password"
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
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Link to Signup */}
        <p 
          className="text-center mt-6 text-sm"
          style={{ color: theme.text.tertiary }}
        >
          Don't have an account?{' '}
          <Link
            href="/signup"
            style={{ color: theme.accent.primary }}
            className="font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
} 