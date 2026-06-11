// Parse a YouTube video ID from a full URL or a raw ID. Accepts:
//   https://www.youtube.com/watch?v=ID, https://youtu.be/ID,
//   https://www.youtube.com/embed/ID, or a bare 11-char ID.
const ID_RE = /^[a-zA-Z0-9_-]{11}$/;
// A valid YouTube id is exactly these 11 chars. Anything else returns '' so
// unvalidated junk can never be interpolated into the embed iframe src.
const valid = (id) => (id && ID_RE.test(id) ? id : '');

export function parseYouTubeId(input) {
  if (!input) return '';
  const s = String(input).trim();
  if (ID_RE.test(s)) return s; // already an id

  try {
    const url = new URL(s);
    if (url.hostname.includes('youtu.be')) {
      return valid(url.pathname.slice(1, 12));
    }
    const v = url.searchParams.get('v');
    if (v) return valid(v);
    const m = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (m) return valid(m[1]);
  } catch {
    // not a URL — fall through
  }
  return '';
}
