'use client'

import './globals.css'
import Link from 'next/link'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import { theme } from './theme'
import { AuthProvider, useAuth } from './AuthContext'

// Athletic type pairing: condensed display for headings, Barlow for body.
const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
});
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

function Navigation() {
  const { user, logout } = useAuth();
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
            <Link href="/exercises" className={linkBase} style={{ color: theme.text.secondary }}>
              Exercises
            </Link>
            <Link href="/welcome" className={linkBase} style={{ color: theme.text.secondary }}>
              Welcome
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
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  className={`cursor-pointer ${linkBase}`}
                  style={{ color: theme.text.secondary }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/signup"
                className="text-center px-4 py-2 rounded-lg font-semibold transition-opacity hover:opacity-90 focus-visible:opacity-100"
                style={{
                  backgroundColor: theme.button.background,
                  color: theme.accent.primary,
                }}
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <head>
        <title>Calisthenics Skill Tree</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Master your body, one move at a time. A calisthenics skill tree to track your progress." />
      </head>
      <body>
        <AuthProvider>
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}