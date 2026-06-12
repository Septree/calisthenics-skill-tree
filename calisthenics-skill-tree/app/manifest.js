import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from './site';

// Web app manifest (served at /manifest.webmanifest) — lets the site be
// installed as a PWA and gives search/mobile a richer app identity.
export default function manifest() {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    categories: ['health', 'fitness', 'sports', 'education'],
    icons: [
      { src: '/favicon.ico', sizes: '256x256', type: 'image/x-icon' },
    ],
  };
}
