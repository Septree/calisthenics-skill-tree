// SELF-HOSTED QUOTES
// Replaces the external API-Ninjas Quotes call (which leaked a billable key to
// the browser). Curated motivational quotes; getQuoteOfTheDay() picks one
// deterministically per calendar day so it's stable across renders/reloads.

export const quotes = [
  { quote: "The body achieves what the mind believes.", author: "Napoleon Hill" },
  { quote: "Strength does not come from the physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi" },
  { quote: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { quote: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { quote: "Success isn't always about greatness. It's about consistency.", author: "Dwayne Johnson" },
  { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { quote: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
  { quote: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { quote: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { quote: "It never gets easier, you just get stronger.", author: "Unknown" },
  { quote: "Your only limit is you. Master your body, one move at a time.", author: "Unknown" },
  { quote: "Fall in love with the process and the results will come.", author: "Eric Thomas" },
  { quote: "Motivation gets you started. Habit keeps you going.", author: "Jim Ryun" },
  { quote: "A one-arm pull-up starts with a single dead hang.", author: "Unknown" },
  { quote: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
];

// Deterministic "quote of the day": same quote for everyone on a given date,
// rotates daily. Uses days-since-epoch so it advances exactly once per day.
export function getQuoteOfTheDay(date = new Date()) {
  const dayIndex = Math.floor(date.getTime() / 86_400_000); // ms per day
  return quotes[dayIndex % quotes.length];
}
