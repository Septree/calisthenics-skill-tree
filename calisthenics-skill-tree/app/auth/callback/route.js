import { NextResponse } from 'next/server';
import { createClient } from '../../supabase/server';

// OAuth (Google) redirect lands here with a ?code; exchange it for a session
// cookie, then continue into the app.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Only allow same-origin relative paths. Reject protocol-relative ("//evil")
  // and backslash ("/\evil") forms so ?next can't become an open redirect.
  const rawNext = searchParams.get('next') || '/tree';
  const next = /^\/(?![/\\])/.test(rawNext) ? rawNext : '/tree';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
