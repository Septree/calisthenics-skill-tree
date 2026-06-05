import Link from 'next/link';
import { notFound } from 'next/navigation';
import { theme } from '../../theme';
import ExerciseIcon from '../../ExerciseIcon';
import ExerciseVideo from '../../ExerciseVideo';
import ExerciseComplete from '../../ExerciseComplete';
import { getExercisePageData, builtInExerciseParams } from '../../exercises-server';
import { SITE_URL } from '../../site';

// Built-in pages prerender; revalidate hourly so admin edits show up.
export const revalidate = 3600;

export function generateStaticParams() {
  return builtInExerciseParams();
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { exercise } = await getExercisePageData(id);
  if (!exercise) {
    return { title: 'Exercise not found', robots: { index: false, follow: false } };
  }
  const title = `${exercise.name} — how to, form & progression`;
  const description = exercise.summary
    ? `${exercise.summary} Learn ${exercise.name}: prerequisites, progression and a video tutorial.`
    : `Learn the ${exercise.name} calisthenics skill — form, prerequisites, progression and a video tutorial.`;
  return {
    title,
    description,
    alternates: { canonical: `/exercises/${exercise.id}` },
    openGraph: {
      type: 'article',
      title,
      description,
      url: `${SITE_URL}/exercises/${exercise.id}`,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function ExerciseDetailPage({ params }) {
  const { id } = await params;
  const { exercise, all } = await getExercisePageData(id);

  if (!exercise) {
    notFound();
  }

  const prereqs = (exercise.prerequisites || [])
    .map((pid) => all.find((e) => e.id === pid))
    .filter(Boolean);
  const unlocks = all.filter((e) => (e.prerequisites || []).includes(exercise.id));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Exercises', item: `${SITE_URL}/exercises` },
      { '@type': 'ListItem', position: 3, name: exercise.name, item: `${SITE_URL}/exercises/${exercise.id}` },
    ],
  };

  const badge = (text, opts = {}) => (
    <span
      className="px-3 py-1 rounded-full text-sm font-semibold"
      style={{
        backgroundColor: opts.bg || theme.hoverBox.badge.background,
        color: opts.color || theme.hoverBox.badge.text,
        border: `1px solid ${opts.border || theme.hoverBox.badge.border}`,
        ...opts.style,
      }}
    >
      {text}
    </span>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background.primary }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6" aria-label="Breadcrumb" style={{ color: theme.text.tertiary }}>
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/exercises" className="hover:underline">Exercises</Link>
          <span className="mx-2">/</span>
          <span style={{ color: theme.text.secondary }}>{exercise.name}</span>
        </nav>

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 reveal-up">
          {/* LEFT — info */}
          <div>
            <div className="flex items-center gap-6 mb-6">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center p-4 flex-shrink-0 overflow-hidden"
                style={{ backgroundColor: theme.background.tertiary, border: `2px solid ${theme.border.light}` }}
              >
                <ExerciseIcon src={exercise.icon} name={exercise.name} className="w-full h-full object-contain" style={{ fontSize: '1.75rem' }} />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3" style={{ color: theme.text.primary }}>{exercise.name}</h1>
                <div className="flex gap-3 flex-wrap">
                  {badge(exercise.difficulty)}
                  {badge(exercise.category, {
                    bg: theme.background.tertiary,
                    color: theme.text.secondary,
                    border: theme.border.default,
                    style: { textTransform: 'uppercase' },
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-lg p-6" style={{ backgroundColor: theme.background.secondary, border: `1px solid ${theme.border.default}` }}>
              <h2 className="text-xl font-bold mb-3" style={{ color: theme.text.primary }}>About this exercise</h2>
              <p className="text-base leading-relaxed" style={{ color: theme.text.secondary }}>
                {exercise.summary || `${exercise.name} is a ${String(exercise.difficulty).toLowerCase()} ${exercise.category} skill in the calisthenics skill tree.`}
              </p>
            </div>
          </div>

          {/* RIGHT — video */}
          <div>
            <div className="rounded-lg p-6" style={{ backgroundColor: theme.background.secondary, border: `1px solid ${theme.border.default}` }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: theme.text.primary }}>Video tutorial</h2>
              <ExerciseVideo exerciseId={exercise.id} name={exercise.name} />
            </div>
          </div>
        </div>

        {/* WHERE IT FITS — unique, data-driven content */}
        <div className="rounded-lg p-6 mb-8 reveal-up" style={{ backgroundColor: theme.background.secondary, border: `1px solid ${theme.border.default}`, animationDelay: '0.08s' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: theme.text.primary }}>Where {exercise.name} fits in your training</h2>
          <p className="mb-4 leading-relaxed" style={{ color: theme.text.secondary }}>
            {exercise.name} is a <strong>{String(exercise.difficulty).toLowerCase()}</strong> <strong>{exercise.category}</strong> skill.
            {prereqs.length > 0
              ? ' Build up to it by first mastering its prerequisites below.'
              : ' It’s a great entry point — no prerequisites required.'}
          </p>

          {prereqs.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm uppercase tracking-wide mb-2" style={{ color: theme.text.tertiary }}>Prerequisites</h3>
              <div className="flex flex-wrap gap-2">
                {prereqs.map((p) => (
                  <Link key={p.id} href={`/exercises/${p.id}`} className="px-3 py-1.5 rounded-lg text-sm hover:opacity-80" style={{ backgroundColor: theme.background.tertiary, color: theme.accent.primary, border: `1px solid ${theme.border.default}` }}>
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {unlocks.length > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-wide mb-2" style={{ color: theme.text.tertiary }}>Unlocks</h3>
              <div className="flex flex-wrap gap-2">
                {unlocks.map((u) => (
                  <Link key={u.id} href={`/exercises/${u.id}`} className="px-3 py-1.5 rounded-lg text-sm hover:opacity-80" style={{ backgroundColor: theme.background.tertiary, color: theme.accent.primary, border: `1px solid ${theme.border.default}` }}>
                    {u.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 reveal-up" style={{ animationDelay: '0.16s' }}>
          <ExerciseComplete exerciseId={exercise.id} />
          <Link
            href="/exercises"
            className="flex items-center justify-center py-4 rounded-lg font-semibold transition hover:opacity-90"
            style={{ backgroundColor: theme.background.tertiary, color: theme.text.primary, border: `1px solid ${theme.border.default}` }}
          >
            Back to All Exercises
          </Link>
        </div>
      </div>
    </div>
  );
}
