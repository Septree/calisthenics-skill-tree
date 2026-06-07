// One-off: copy your existing admin-written skills from Firestore → Supabase.
// Users/progress are NOT migrated (fresh start). Run it once, locally.
//
// Setup:
//   1) npm i -D firebase-admin
//   2) Download a Firebase service-account JSON (Firebase console →
//      Project settings → Service accounts → Generate new private key).
//   3) Run:
//      GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
//      SUPABASE_URL=https://xxxx.supabase.co \
//      SUPABASE_SERVICE_ROLE_KEY=<service_role key from Supabase → Settings → API> \
//      node scripts/migrate-exercises.mjs
//
// Notes:
//   - Old base64 image strings carry over as-is (they still render).
//   - prerequisites are RESET (old numeric ids don't map to new DB ids) —
//     re-select them in /admin after import.

import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.applicationDefault() });
const firestore = admin.firestore();
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const snap = await firestore.collection('exercises').get();
const rows = snap.docs.map((d) => {
  const e = d.data();
  return {
    name: e.name || 'Untitled',
    category: (e.category || 'other').toLowerCase(),
    difficulty: e.difficulty || 'Beginner',
    summary: e.summary || '',
    icon: e.icon || '',
    video_id: e.videoId || '',
    position_left: e.position?.left ?? 0,
    position_top: e.position?.top ?? 0,
    prerequisites: [], // reset — re-link in /admin
    instructions: e.instructions || [],
    mistakes: e.mistakes || [],
    tips: e.tips || [],
  };
});

if (rows.length === 0) {
  console.log('No exercises found in Firestore. Nothing to migrate.');
  process.exit(0);
}

const { data, error } = await supabase.from('exercises').insert(rows).select('id,name');
if (error) {
  console.error('Insert failed:', error);
  process.exit(1);
}
console.log(`Imported ${data.length} skill(s): ${data.map((r) => r.name).join(', ')}`);
console.log('Reminder: re-select prerequisites for these in /admin.');
