'use client'

import Link from 'next/link';
import { theme } from './theme';

const FEATURES = [
  {
    title: 'A visual skill tree',
    body: 'See every calisthenics move as a node. Unlock harder skills by mastering their prerequisites — from your first push-up to the muscle-up.',
  },
  {
    title: 'Track real progress',
    body: 'Mark moves complete and watch your overall and per-category progress fill up. Your journey is saved to your account.',
  },
  {
    title: 'Learn every move',
    body: 'Each skill has its own page with a video tutorial pulled in automatically, so you always know what good form looks like.',
  },
];

const STEPS = [
  { n: '01', t: 'Create your account', d: 'Sign up in seconds — no equipment, no payment.' },
  { n: '02', t: 'Pick a skill', d: 'Start at the base of the tree and work upward.' },
  { n: '03', t: 'Train & check it off', d: 'Complete moves and unlock the next tier.' },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: theme.background.primary }}>
      {/* HERO */}
      <section className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* glow backdrop */}
        <div
          className="absolute left-1/2 top-10 -translate-x-1/2 w-[480px] h-[480px] rounded-full animate-float pointer-events-none"
          style={{ background: `radial-gradient(circle, ${theme.accent.primary}22 0%, transparent 70%)` }}
          aria-hidden="true"
        />
        <p className="reveal-up text-sm uppercase tracking-[0.3em] mb-5" style={{ color: theme.accent.primary }}>
          Bodyweight mastery
        </p>
        <h1 className="reveal-up text-6xl md:text-7xl font-bold mb-6 leading-none" style={{ color: theme.text.primary, animationDelay: '0.08s' }}>
          Master your body,<br />one move at a time.
        </h1>
        <p className="reveal-up text-lg md:text-xl mb-10 max-w-2xl mx-auto" style={{ color: theme.text.tertiary, animationDelay: '0.16s' }}>
          The Calisthenics Skill Tree turns bodyweight training into a game. Unlock skills, track progress, and level up — all the way to the muscle-up.
        </p>
        <div className="reveal-up flex flex-col sm:flex-row gap-4 justify-center" style={{ animationDelay: '0.24s' }}>
          <Link
            href="/signup"
            className="px-8 py-4 rounded-lg font-semibold text-lg transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: theme.accent.primary, color: 'white' }}
          >
            Start training free
          </Link>
          <Link
            href="/tree"
            className="px-8 py-4 rounded-lg font-semibold text-lg transition-opacity hover:opacity-80"
            style={{ backgroundColor: theme.background.tertiary, color: theme.text.primary, border: `1px solid ${theme.border.default}` }}
          >
            Explore the tree
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="reveal-up rounded-xl p-7"
              style={{
                backgroundColor: theme.background.secondary,
                border: `1px solid ${theme.border.default}`,
                animationDelay: `${0.1 * i}s`,
              }}
            >
              <div className="w-10 h-10 rounded-lg mb-4 flex items-center justify-center font-bold" style={{ backgroundColor: `${theme.accent.primary}22`, color: theme.accent.primary }}>
                {i + 1}
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: theme.text.primary }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: theme.text.secondary }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-12" style={{ color: theme.text.primary }}>How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((s, i) => (
            <div key={s.n} className="reveal-up text-center" style={{ animationDelay: `${0.1 * i}s` }}>
              <div className="text-5xl font-bold mb-3" style={{ color: theme.accent.primary }}>{s.n}</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: theme.text.primary }}>{s.t}</h3>
              <p className="text-sm" style={{ color: theme.text.tertiary }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div
          className="reveal-up rounded-2xl px-8 py-14"
          style={{ backgroundColor: theme.background.secondary, border: `1px solid ${theme.accent.primary}55` }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: theme.text.primary }}>
            Ready to level up?
          </h2>
          <p className="mb-8 text-lg" style={{ color: theme.text.tertiary }}>
            Your skill tree is waiting. Start with a single push-up.
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-4 rounded-lg font-semibold text-lg transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: theme.accent.primary, color: 'white' }}
          >
            Create your free account
          </Link>
        </div>
      </section>
    </div>
  );
}
