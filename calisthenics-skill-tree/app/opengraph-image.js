import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TAGLINE } from './site';

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'radial-gradient(circle at 70% 20%, #09302e 0%, #000000 55%)',
        }}
      >
        <div style={{ color: '#09c0b7', fontSize: 30, letterSpacing: 8, textTransform: 'uppercase' }}>
          Bodyweight mastery
        </div>
        <div style={{ color: '#f3f4f6', fontSize: 84, fontWeight: 700, lineHeight: 1.05, marginTop: 24 }}>
          Master your body,
        </div>
        <div style={{ color: '#f3f4f6', fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>
          one move at a time.
        </div>
        <div style={{ color: '#9ca3af', fontSize: 34, marginTop: 36 }}>
          {`${SITE_NAME} — the calisthenics skill tree`}
        </div>
      </div>
    ),
    size,
  );
}
