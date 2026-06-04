# Roadmap — making Calisthenics Skill Tree a real, monetizable app

Grounded in the current codebase (Next.js + Firebase, hybrid Firestore exercises,
admin CRUD, progress tracking). Ordered by leverage.

## 1. Biggest gaps to fix first (these block everything else)
- **Real exercise content.** Detail pages still show "Instructions will be added here."
  This is the core value and the main SEO asset. Add steps, common mistakes, progressions,
  rep/set targets per skill. → Move these fields into the exercise model + admin form.
- **Cache YouTube lookups.** `/api/youtube` does a *search* per detail view. The YouTube
  Data API free quota is ~10,000 units/day and **each search costs 100 units → ~100 views/day
  total**. Store the resolved `videoId` on the exercise doc once, reuse it. Without this,
  the video feature breaks under any real traffic.
- **Per-page SEO/metadata.** Pages are all client components with no metadata. Exercise
  pages ("how to do a muscle-up") are prime organic-search targets — convert them to
  server components with `generateMetadata` + HowTo structured data.
- **Mobile nav.** The top nav has many links; it will crowd on small screens. Add a
  hamburger/drawer.

## 2. Instrument it — you can't grow what you can't measure
Add analytics (Vercel Analytics + PostHog or Firebase Analytics) and track:
- **Activation:** % of signups who complete ≥1 skill (target the "aha" moment).
- **Retention:** D1 / D7 / D30 return rate; weekly active users.
- **Engagement:** skills completed per user, session length, detail-page views.
- **Funnel:** landing → signup → first completion (find the drop-off).
- **Tech health:** YouTube quota usage, Firestore read counts, error rate.

## 3. Known technical risks / debt
- **base64 images live inside Firestore docs** → every exercise read ships the image bytes.
  Fine now; at scale move images to Vercel Blob or an image CDN and store just a URL.
- **No shared data layer** — each page refetches exercises + progress. Add SWR/React Query
  or a context to dedupe and cache.
- **`/api/youtube` has no rate limiting** — add a simple guard if traffic grows.
- **Single hardcoded admin** in rules — fine for now; move to a custom claim or `admins`
  collection if you add more staff.
- **No tests / error boundaries** — add a few smoke tests + a root error boundary.
- **Deploy gate:** Firestore rules must be published (exercises + meta + users). Confirm the
  live DB is not in open "test mode."

## 4. Product features that drive retention
- More skills + branches (push/pull/legs/core + named skills: handstand, planche, front
  lever, pistol squat) with real progression chains.
- **Streaks, XP, levels, badges** — you already have the tree; reward consistency.
- **Workout/session logging** (reps/sets/time) and a "today's workout" suggestion based on
  unlocked-but-incomplete skills.
- **Progress history + charts** over time (great use of the design skill's chart data).
- Light social: shareable progress cards, friends, leaderboards.

## 5. Monetization (recommended: freemium subscription)
The free skill tree is a strong hook. Sell depth on top.
- **Free:** tree, basic completion tracking, 1 video per skill.
- **Pro (~$5–8/mo):** structured programs ("Muscle-up in 8 weeks"), custom routines,
  detailed stats/history, advanced skill paths, no ads.
- **Add-ons:** one-time program purchases; affiliate links for gear (rings, bands, bars —
  this audience buys equipment); later, a coach/form-check marketplace; B2B white-label for gyms.

### Tech to support payments (works on Vercel)
- **Stripe Checkout + Customer Portal.** Handle the webhook in a Next route handler using
  **firebase-admin** (server-side service account) to write subscription status to Firestore.
- Gate Pro features in Firestore rules + UI by a `subscription` flag on the user doc.
- Transactional email (welcome / re-engagement) via Resend or Postmark.

## 6. Quick wins (low effort, high polish)
- OG/social share image for the landing.
- Testimonials + a short demo GIF on the landing.
- Empty states ("no skills completed yet — start here").
- Loading skeletons on the tree/list.
- A real favicon + PWA manifest (installable "app" feel).
