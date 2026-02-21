import './globals.css'

export const metadata = {
  title: 'Calisthenics Skill Tree',
  description: 'This is a way to level up your calisthenics skills by gamifying the process',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* MINIMALIST NAVIGATION */}
        <nav className="bg-[#27272e] border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-14">
              {/* Logo/Title */}
              <a href="/" className="text-white font-semibold text-lg hover:text-gray-300 transition">
                Skill Tree
              </a>
              
              {/* Navigation Links */}
              <div className="flex gap-8 text-sm">
                <a href="/" className="text-gray-300 hover:text-white transition">
                  Home
                </a>
                <a href="/exercises" className="text-gray-300 hover:text-white transition">
                  Exercises
                </a>
                <a href="/profile" className="text-gray-300 hover:text-white transition">
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