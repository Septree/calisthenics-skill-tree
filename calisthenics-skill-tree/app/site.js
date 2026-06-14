// Canonical site URL used for metadata, canonical tags, sitemap, robots, OG.
// Set NEXT_PUBLIC_SITE_URL in Vercel to your real domain for correct absolute URLs.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://calisthenics-skill-tree.vercel.app')
).replace(/\/$/, '');

export const SITE_NAME = 'Calisthenics Skill Tree';
export const SITE_TAGLINE = 'Master your body, one move at a time';
export const SITE_DESCRIPTION =
  'The skill tree from a video game, but for calisthenics. Unlock skills, track progress, and level up.';
