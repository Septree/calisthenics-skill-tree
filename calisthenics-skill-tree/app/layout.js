'use client'

import './globals.css'
import { theme } from './theme' 
import { AuthProvider, useAuth } from './AuthContext'

function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav style={{ backgroundColor: theme.background.primary, borderBottom: `1px solid ${theme.border.dark}` }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <a href="/" className="font-semibold text-lg hover:opacity-80 transition" style={{ color: theme.text.primary }}>
            Skill Tree
          </a>
          
          <div className="flex gap-8 text-sm items-center">
            <a href="/" className="hover:opacity-80 transition" style={{ color: theme.text.secondary }}>
              Home
            </a>
            <a href="/exercises" className="hover:opacity-80 transition" style={{ color: theme.text.secondary }}>
              Exercises
            </a>
            <a href="/profile" className="hover:opacity-80 transition" style={{ color: theme.text.secondary }}>
              Profile
            </a>
            
            {user ? (
              <>
                <span style={{ color: theme.text.tertiary }}>
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  className="hover:opacity-80 transition"
                  style={{ color: theme.text.secondary }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a 
                  href="/signup" 
                  className="block w-full text-center py-4 rounded-lg font-semibold transition hover:opacity-90"
                  style={{ 
                    backgroundColor: theme.button.background,
                    color: theme.accent.primary,
                  }}
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Calisthenics Skill Tree</title>
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