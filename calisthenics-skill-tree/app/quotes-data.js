










// quotes data
// if you're reading this Hi. like this story <3

export const quotes = [
  { quote: "What's a man who cant even keep promises he made to himself...", author: "Unknown"},
  { quote: "Death is not the enemy, a wasted life is.", author: "Marcus Aurelius"},
  { quote: "To be a star you must burn.", author: "Unknown" },
  { quote: "The body achieves what the mind believes.", author: "Napoleon Hill" },
  { quote: "Strength does not come from the physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi" },
  { quote: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { quote: "Discipline will never betray you.", author: "Jocko Willink" },
  { quote: "Never give up on something you think about everyday.", author: "Winston Churchill" },
  { quote: "All limitations are self-imposed.", author: "David Goggins"},
  { quote: "WHO IS GOING TO CARRY THE BOATS???", author: "David Goggins" },
  { quote: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
  { quote: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { quote: "It never gets easier, you just get stronger.", author: "Unknown" },
];

// quote timer
export function getQuoteOfTheDay(date = new Date()) {
  const dayIndex = Math.floor(date.getTime() / 86_400_000); // ms per day
  return quotes[dayIndex % quotes.length];
}
