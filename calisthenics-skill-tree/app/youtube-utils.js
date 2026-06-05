// Parse a YouTube video ID from a full URL or a raw ID. Accepts:
//   https://www.youtube.com/watch?v=ID, https://youtu.be/ID,
//   https://www.youtube.com/embed/ID, or a bare 11-char ID.
export function parseYouTubeId(input) {
  if (!input) return '';
  const s = String(input).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s; // already an id

  try {
    const url = new URL(s);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.slice(1, 12);
    }
    const v = url.searchParams.get('v');
    if (v) return v;
    const m = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
  } catch {
    // not a URL — fall through
  }
  return s;
}
