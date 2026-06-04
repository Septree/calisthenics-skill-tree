# Project Understanding — Calisthenics Skill Tree

> Phase 1 recon (read-only). Authored after reading every file in `app/`.
> Owner-confirmed: this is a **portfolio / course project**, and the
> skill-tree-with-prerequisites flow is the intended core.

## Detected stack
| Area | Detail |
|------|--------|
| Framework | **Next.js 16.1.6**, App Router, every page is a client component (`'use client'`) |
| UI runtime | **React 19.2.3** |
| Styling | **Tailwind CSS v4** (`@tailwindcss/postcss`) + an inline JS token object (`app/theme.js`) |
| Backend | **Firebase 12.10.0** — Auth (email/password) + Firestore, all accessed **client-side** |
| External APIs | YouTube Data API v3 (video search) · API-Ninjas Quotes *(to be replaced with a local list)* |
| Tooling | npm · ESLint (next config). **No tests, no CI, no TypeScript.** |
| Design skill | `.claude/skills/ui-ux-pro-max/` present and ready for Phase 3 |

## Folder map
```
app/
  layout.js            root layout + inline Navigation (client)
  page.js              home: skill-tree graph (SVG edges + absolute-positioned nodes) + quote of the day
  AuthContext.js       React context wrapping onAuthStateChanged
  firebase.js          Firebase init (config from NEXT_PUBLIC_* env)
  db-helpers.js        Firestore reads/writes for users/{uid}.completedExercises
  exercises-data.js    hardcoded exercise list + helper selectors
  theme.js             centralized color tokens
  globals.css          tailwind import + leftover default light-theme vars
  login/ signup/       auth forms
  profile/             progress dashboard (overall + per-category bars)
  exercises/           grid list + [id] detail (YouTube embed, mark-complete, placeholder instructions)
public/icons/          exercise PNG icons
```

## What this product is for
A **gamified calisthenics progression tracker**. The home page renders a *skill tree*:
each exercise is a node, prerequisite relationships are drawn as SVG edges, completed
nodes light up with a green checkmark while incomplete ones are dimmed. Users can sign up,
browse all exercises, open a detail page with an auto-fetched YouTube tutorial, mark a move
complete, and see overall + per-category progress bars fill on their profile.

**Who the user is:** a beginner-to-intermediate bodyweight-fitness enthusiast who wants a
visual, game-like path from easy regressions to hard skills (push-ups → muscle-up).

**Core flows**
1. **Auth** — signup / login (email+password) → redirect home.
2. **Explore** — home skill tree or `/exercises` grid → exercise detail.
3. **Learn** — detail page embeds a YouTube tutorial fetched by exercise name.
4. **Track** — "Mark as Complete" toggles `users/{uid}.completedExercises` in Firestore.
5. **Review** — `/profile` shows completion count, overall %, and per-category bars.

## Current quality / polish level: **4 / 10**
**Strengths**
- Clean separation: centralized `theme.js` tokens + `exercises-data.js` single source of truth.
- Working auth with a tidy `AuthContext`; real Firestore-backed progress that persists.
- Genuinely appealing skill-tree concept with hover tooltips and completion checkmarks.
- Thoughtful loading / empty states for the video and quote sections.

**Gaps**
- Only **6 exercises**; exercise #7 is commented out yet still referenced as a prerequisite of the muscle-up.
- Exercise detail "instructions" are all placeholder *"Instructions will be added here"*.
- Navigation uses `window.location.href` and raw `<a href>` → full-page reloads/flashes instead of Next routing.
- **Billable API keys shipped to the browser** (`NEXT_PUBLIC_YOUTUBE_API_KEY`, `NEXT_PUBLIC_QUOTES_API_KEY`).
- Firestore authorization can't be verified — Security Rules aren't in the repo; client trusts `user.uid` (IDOR risk).
- Skill tree uses fixed-pixel positions → not responsive; overflows on mobile.
- No accessibility work (color-only state, no focus styles, decorative-vs-meaningful images, contrast).
- Repeated progress-loading `useEffect` copy-pasted across 3 files; per-render uncached YouTube fetch; no `next/image`; dead light-theme CSS vars in `globals.css`.

## Top 8 improvement opportunities (ranked by impact)
1. **Stop shipping billable API keys to the browser** — move YouTube behind a Next route handler; **replace the Quotes API with a local quote list** (eliminates that key entirely). *(Security + cost)*
2. **Lock down Firestore** — author/verify Security Rules so a user can only read/write their own `users/{uid}` doc. *(Security)*
3. **Fill in real exercise content** — replace the 4 placeholder instruction blocks; expand the tree; fix the muscle-up's dangling prereq on exercise #7. *(Core value)*
4. **Use Next.js routing** — `<Link>` / `useRouter` instead of `window.location.href` to kill reloads and flashes. *(UX + perf)*
5. **Protect authed routes & fix the profile flash** — gate on the `loading` state instead of briefly rendering "Please Sign In". *(UX)*
6. **Make the skill tree responsive** — scale/scroll the fixed-position graph; audit every page at small breakpoints. *(UX)*
7. **Accessibility** — focus styles, non-color completion cues, aria/landmarks, contrast on muted text. *(a11y)*
8. **Performance & code health** — `next/image` for icons, dedupe progress loading into a `useProgress` hook, cache the YouTube fetch, drop dead CSS. *(Code health)*

## Engagement bar (owner-confirmed)
Portfolio / course project → prioritize **visible polish and a clean demo**, fix security
**pragmatically** (no heavy backend/infra buildout), keep changes incremental and low-risk.
Every visual decision in Phase 3 will be offered as labeled A/B/C options sourced from the
`ui-ux-pro-max` skill, with a recommendation, before any styling is changed.
