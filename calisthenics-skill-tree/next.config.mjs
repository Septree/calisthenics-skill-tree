/** @type {import('next').NextConfig} */

// Hardening headers applied to every response. Kept deliberately conservative so
// the app's inline styles / Supabase + Google OAuth / YouTube embeds keep working:
// the CSP only locks down framing (clickjacking), base-uri and form-action rather
// than scripts/styles. camera/mic/geo are disabled (the app never uses them);
// accelerometer/autoplay etc. are left alone so the YouTube embed still works.
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // No includeSubDomains/preload: those are hard to reverse and would force
  // every subdomain to HTTPS + opt into the browser preload list. Plain
  // max-age still upgrades this origin to HTTPS-only after the first visit.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  },
];

const nextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
