// Cookieless Supabase client for build-time / public server reads (e.g. exercise
// pages + generateStaticParams). Uses the anon key; exercises are public-read,
// so no session is needed — and avoiding cookies keeps pages statically render-able.
import { createClient } from '@supabase/supabase-js';

export const supabaseStatic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
