'use client'

import Link from 'next/link'
import { theme } from './theme'
import { useAuth } from './AuthContext'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function Navigation() {
  const { user, profileName, logout } = useAuth();
  const isAdmin = !!user && !!ADMIN_EMAIL && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const linkBase = 'rounded-sm px-1 transition-opacity hover:opacity-80 focus-visible:opacity-100';

  return (
    <nav style={{ backgroundColor: theme.background.primary, borderBottom: `1px solid ${theme.border.dark}` }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className={`font-semibold text-lg ${linkBase}`} style={{ color: theme.text.primary }}>
            Skill Tree
          </Link>

          <div className="flex gap-6 text-sm items-center">
            <Link href="/" className={linkBase} style={{ color: theme.text.secondary }}>
              Home
            </Link>
            <Link href="/tree" className={linkBase} style={{ color: theme.text.secondary }}>
              Skill Tree
            </Link>
            <Link href="/exercises" className={linkBase} style={{ color: theme.text.secondary }}>
              Exercises
            </Link>
            <Link href="/profile" className={linkBase} style={{ color: theme.text.secondary }}>
              Profile
            </Link>
            {isAdmin && (
              <Link href="/admin" className={linkBase} style={{ color: theme.accent.primary }}>
                Admin
              </Link>
            )}

            {user ? (
              <>
                <span className="hidden sm:inline" style={{ color: theme.text.tertiary }}>
                  Hi, {profileName || 'there'}
                </span>
                <button
                  onClick={logout}
                  className="cursor-pointer px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90 focus-visible:opacity-100"
                  style={{ border: `1px solid ${theme.border.default}`, color: theme.text.secondary }}
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className={`cursor-pointer ${linkBase}`}
                  style={{ color: theme.text.secondary }}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="text-center px-4 py-2 rounded-lg font-semibold transition-opacity hover:opacity-90 focus-visible:opacity-100"
                  style={{ backgroundColor: theme.accent.primary, color: 'white' }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
