# Security Audit — Calisthenics Skill Tree

> Phase 2, **read-only report — nothing has been changed.** Severity scale:
> Critical / High / Medium / Low / Informational. Each finding lists the exact
> `file:line`, the risk, and a concrete fix (with a pragmatic "portfolio-bar"
> option where a full fix would mean real infra).
>
> Bar: portfolio / course project — fixes favor minimal, low-risk changes.

## Summary table
| # | Severity | Finding | Location |
|---|----------|---------|----------|
| 1 | 🔴 Critical | Billable **YouTube API key** shipped to the browser | `app/exercises/[id]/page.js:11` |
| 2 | 🔴 Critical | `protobufjs` arbitrary-code-execution CVE (transitive via Firebase) | `package-lock.json` (deps) |
| 3 | 🟠 High | Billable **Quotes API key** shipped to the browser | `app/page.js:38` |
| 4 | 🟠 High | **No Firestore Security Rules in repo** → unverifiable authz / IDOR | `app/db-helpers.js` (all) |
| 5 | 🟡 Medium | Login error messages enable **user enumeration** | `app/login/page.js:26-33` |
| 6 | 🟡 Medium | Raw `error.message` leaked to users on signup | `app/signup/page.js:26` |
| 7 | 🟡 Medium | Authorization is client-side only (mark-complete / profile) | `app/exercises/[id]/page.js:68`, `app/profile/page.js` |
| 8 | 🟢 Low | Unencoded query interpolated into YouTube API URL | `app/exercises/[id]/page.js:13` |
| 9 | 🟢 Low | `postcss` XSS CVE (build-time) | `package-lock.json` (devDeps) |
| 10 | 🟢 Low | No security headers / CSP | `next.config.mjs` |
| 11 | 🔵 Info | Firebase web config in `NEXT_PUBLIC_*` (expected, not a leak) | `app/firebase.js:8-13` |
| 12 | 🔵 Info | YouTube iframe embed isn't privacy-hardened | `app/exercises/[id]/page.js:247-256` |

---

## 🔴 Critical

### 1. Billable YouTube API key exposed in the client bundle
- **Where:** `app/exercises/[id]/page.js:11` — `const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;` used in a `fetch` that runs in the browser.
- **Risk:** Any `NEXT_PUBLIC_*` var is inlined into the JavaScript served to every visitor. The key is trivially extractable from the network tab or JS bundle, and the YouTube Data API is **quota-limited and billable** — a third party can drain your quota or rack up cost, and get your project's API access suspended.
- **Fix (proper):** Move the fetch server-side — a Next **Route Handler** `app/api/youtube/route.js` that reads a non-public `YOUTUBE_API_KEY` (no `NEXT_PUBLIC_` prefix) and returns just the `videoId`. The client calls `/api/youtube?name=...`.
- **Fix (portfolio-minimal, do both ideally):** In Google Cloud Console, **restrict the key** to the YouTube Data API only + add HTTP-referrer restrictions to your deploy domain. This caps abuse even if the key leaks. Cheap and fast.

### 2. `protobufjs` critical CVE (transitive dependency via Firebase)
- **Where:** dependency tree under `firebase` (`npm audit`: arbitrary code execution / prototype pollution, GHSA-xq3m-2v4x-88gg and others).
- **Risk:** Known critical CVE in a shipped dependency.
- **Fix:** `npm audit fix` (non-breaking — patches within range). Re-run `npm audit` to confirm 0 critical/high. Commit the updated lockfile.

---

## 🟠 High

### 3. Billable Quotes API key exposed in the client bundle
- **Where:** `app/page.js:38` — `'X-Api-Key': process.env.NEXT_PUBLIC_QUOTES_API_KEY` in a browser `fetch`.
- **Risk:** Same exposure class as #1; the API-Ninjas key is readable by anyone.
- **Fix:** **Already planned — replace the API call with a self-hosted quote list** (`app/quotes-data.js` + a deterministic "quote of the day" picker). This deletes the key and the external dependency entirely. Then remove `NEXT_PUBLIC_QUOTES_API_KEY` from `.env.local`.

### 4. No Firestore Security Rules in the repo → unverifiable authorization (IDOR)
- **Where:** `app/db-helpers.js` — every read/write (`getUserProgress`, `markExerciseComplete`, `markExerciseIncomplete`) hits Firestore directly from the client using a client-supplied `userId`. No `firestore.rules` / `firebase.json` exists in the repo.
- **Risk:** All access control depends on Firestore rules we can't see. If the database is in **test mode / open rules** (the common default), any user — or any unauthenticated client — can read or overwrite **any** `users/{uid}` document by passing a different uid. That's a textbook Insecure Direct Object Reference plus arbitrary data tampering.
- **Fix:** Author least-privilege rules and keep them in the repo:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{db}/documents {
      match /users/{uid} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
  ```
  Add a `firebase.json` referencing it and deploy. **Action needed from you:** confirm the current rules in the Firebase console so we know whether this is live-exposed or already locked.

---

## 🟡 Medium

### 5. Login flow enables user enumeration
- **Where:** `app/login/page.js:26-33` — distinct messages for `auth/user-not-found` ("No account found with this email") vs `auth/wrong-password` ("Incorrect password").
- **Risk:** An attacker can probe which emails have accounts. (Modern Firebase often collapses these into `auth/invalid-credential`, which the code also handles — but the explicit branches still leak when returned.)
- **Fix:** Use one generic message for both: *"Invalid email or password."* Keep `auth/too-many-requests` informative.

### 6. Raw `error.message` surfaced to the user on signup
- **Where:** `app/signup/page.js:26` — `setError(error.message)` (and the `else` fallback at `login/page.js:33`).
- **Risk:** Surfaces Firebase-internal wording / error codes to end users; poor UX and minor information disclosure.
- **Fix:** Map known `error.code`s to friendly copy; fall back to a generic *"Something went wrong, please try again."*

### 7. Authorization enforced only on the client
- **Where:** `app/exercises/[id]/page.js:68` (`if (!user) alert(...)`) and `app/profile/page.js` (renders gated content after a client check).
- **Risk:** Client checks are cosmetic — they protect UX, not data. Real enforcement must live in Firestore rules (#4). Listed separately so it's tracked, but the fix is #4.
- **Fix:** Covered by #4. No standalone server exists to add middleware to; rules are the enforcement layer.

---

## 🟢 Low

### 8. Unencoded string interpolated into the YouTube API URL
- **Where:** `app/exercises/[id]/page.js:13` — `q=${searchQuery}` built from the exercise name without `encodeURIComponent`.
- **Risk:** Low today (exercise names are static and developer-controlled), but it's improper URL construction that breaks on special characters and is a bad habit if names ever become user-supplied.
- **Fix:** `encodeURIComponent(searchQuery)`. Naturally resolved when this moves into the server route (#1).

### 9. `postcss` XSS CVE (build-time dependency)
- **Where:** devDependency tree (`npm audit`: GHSA-qx2v-qp2m-jg93, moderate).
- **Fix:** Bundled into the dependency refresh; note the full fix bumps Next to 16.2.x (`npm audit fix --force` / deliberate upgrade). Build-time only, so lower urgency.

### 10. No security headers / CSP
- **Where:** `next.config.mjs` is empty.
- **Risk:** Missing defense-in-depth (`X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy`).
- **Fix (optional for portfolio):** Add a `headers()` block with sensible defaults. Note a CSP must allow the YouTube embed frame.

---

## 🔵 Informational (no action required, but worth knowing)

### 11. Firebase web config in `NEXT_PUBLIC_*` is **expected and safe**
- **Where:** `app/firebase.js:8-13`.
- **Why it's fine:** The Firebase web `apiKey` is an *identifier*, not a secret — it's designed to be public. Security comes from Firestore Rules (#4) + Auth settings, not from hiding this value. Optional hardening: enable **Firebase App Check** and restrict the Identity Toolkit key by referrer in the Cloud console.

### 12. YouTube iframe isn't privacy-hardened
- **Where:** `app/exercises/[id]/page.js:247-256`.
- **Optional:** Use `https://www.youtube-nocookie.com/embed/...`, add `referrerPolicy="strict-origin-when-cross-origin"`, and an explicit `title` (present) for a11y.

### Checked and clear
- **XSS:** React escapes all interpolated values; no `dangerouslySetInnerHTML` anywhere. The quote string renders safely.
- **CSRF:** Firebase Auth is token-based (not cookie-session), so classic CSRF doesn't apply.
- **Secrets in git history:** none — `.env*` is gitignored and was never committed.
- **PII:** only the email handled by Firebase Auth (standard); no PII sent to YouTube/quotes endpoints.

---

## Recommended fix order (pragmatic, highest value first)
1. **#2 + #9** — `npm audit fix` (one command, kills the critical CVE).
2. **#4** — confirm + commit Firestore rules (biggest real-data risk).
3. **#1 + #3** — get billable keys out of the client (server route for YouTube; self-hosted quotes drops the quotes key).
4. **#5 + #6** — generic auth error messages.
5. **#8, #10, #11, #12** — polish-tier hardening, fold into Phase 3.
