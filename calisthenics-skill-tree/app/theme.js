// CENTRALIZED COLOR THEME
// Now, this file will the may way to test new color schemes and see if they are good

export const theme = {
  // Background Colors
  background: {
    primary: '#000000',      // Main background
    secondary: '#040404',    // Cards/sections background
    tertiary: '#0e0e12',     // Elevated elements
  },

  // Border Colors
  border: {
    default: '#4a4a52',      // Standard borders
    light: '#6a6a72',        // Lighter borders
    dark: '#2a2a32',         // Darker borders
  },

  // Text Colors
  text: {
    primary: '#f3f4f6',      // Main text (gray-100)
    secondary: '#d1d5db',    // Secondary text (gray-300)
    tertiary: '#9ca3af',     // alt text gray-400)
    muted: '#6b7280',        // Muted text (
  },

  // Accent Colors
  accent: {
    primary: '#09c0b7',      // Sexy Green
  },

  // Node Colors (Skill Tree)
  node: {
    border: 'rgba(255, 255, 255, 0.3)',
    borderHover: 'rgba(255, 255, 255, 0.6)',
    line: 'rgba(255, 255, 255, 0.1)',
  },

  // Hover Box
  hoverBox: {
    background: '#3a3a42',
    border: '#4a4a52',
    badge: {
      background: 'rgba(59, 130, 246, 0.2)',
      text: '#93c5fd',
      border: 'rgba(59, 130, 246, 0.3)',
    }
  }
};

// Helper function to get theme value
export const getTheme = (path) => {
  const keys = path.split('.');
  let value = theme;
  for (const key of keys) {
    value = value[key];
  }
  return value;
};