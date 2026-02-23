import './globals.css'
import { theme } from './theme' 

export const metadata = {
  title: 'Calisthenics Skill Tree',
  description: 'This is a way to level up your calisthenics skills by gamifying the process',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* MINIMALIST NAVIGATION */}
          <nav style={{ backgroundColor: theme.background.primary, borderBottom: `1px solid ${theme.border.dark}` }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-14">
              {/* Logo/Title */}
              <a href="/" className="font-semibold text-lg hover:opacity transition" style={{ color: theme.text.primary }}>
                Skill Tree
              </a>
              
              {/* Navigation Links */}
              <div className="flex gap-8 text-sm">
                <a href="/" className="hover:opacity-80 transition" style={{ color: theme.text.secondary }}>
                  Home
                </a>
                <a href="/exercises" className="hover:opacity-80 transition" style={{ color: theme.text.secondary }}>
                  Exercises
                </a>
                <a href="/profile" className="hover:opacity-80 transition" style={{ color: theme.text.secondary }}>
                  Profile
                </a>
              </div>
            </div>
          </div>
        </nav>
        
        {children}
      </body>
    </html>
  )
}