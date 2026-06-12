import { ImageResponse } from 'next/og';
import { SITE_NAME } from '../../site';
import { supabaseStatic } from '../../supabase/static';

export const alt = `${SITE_NAME} skill`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Per-skill social share card — the skill's name + difficulty/category on the
// brand backdrop. Big CTR win over a generic OG image when pages are shared.
export default async function Image({ params }) {
  const { id } = await params;
  const { data: ex } = await supabaseStatic
    .from('exercises')
    .select('name, difficulty, category')
    .eq('id', parseInt(id))
    .maybeSingle();

  const name = ex?.name || 'Calisthenics skill';
  const meta = ex ? `${ex.difficulty} · ${String(ex.category).toUpperCase()}` : 'Calisthenics Skill Tree';

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
        <div style={{ color: '#09c0b7', fontSize: 30, letterSpacing: 6, textTransform: 'uppercase' }}>
          {meta}
        </div>
        <div style={{ color: '#f3f4f6', fontSize: 88, fontWeight: 700, lineHeight: 1.05, marginTop: 24 }}>
          {name}
        </div>
        <div style={{ color: '#9ca3af', fontSize: 34, marginTop: 36 }}>
          {`How to, form & progression — ${SITE_NAME}`}
        </div>
      </div>
    ),
    size,
  );
}
