// Server-side proxy for YouTube video search.
// Keeps YOUTUBE_API_KEY (note: NOT NEXT_PUBLIC_*) on the server so it never
// ships to the browser. The client calls /api/youtube?name=<exercise name>.
import { NextResponse } from 'next/server';

export async function GET(request) {
  const name = request.nextUrl.searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'Missing "name" parameter' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'YouTube API not configured' }, { status: 500 });
  }

  const query = encodeURIComponent(`${name} calisthenics tutorial form`);
  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}` +
    `&type=video&maxResults=1&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ videoId: null }, { status: 200 });
    }
    const data = await response.json();
    const videoId = data.items?.[0]?.id?.videoId ?? null;
    return NextResponse.json({ videoId }, { status: 200 });
  } catch (error) {
    console.error('YouTube API Error:', error);
    return NextResponse.json({ videoId: null }, { status: 200 });
  }
}
