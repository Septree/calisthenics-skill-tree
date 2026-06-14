'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { theme } from '../theme';
import { useAuth } from '../AuthContext';
import { useExercises } from '../useExercises';
import { markExerciseComplete } from '../db-helpers';
import { indexById, goalPathSet, TIER_ORDER } from '../progression';
import ExerciseIcon from '../ExerciseIcon';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading, goalId, setGoal } = useAuth();
  const { exercises, loading: exLoading } = useExercises();

  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState(goalId ?? null);
  const [knownIds, setKnownIds] = useState(() => new Set());
  const [saving, setSaving] = useState(false);

  const goalSkills = exercises.filter((e) => e.isGoal);
  const byId = indexById(exercises);

  // Prerequisites on the path to the chosen goal (the goal itself excluded),
  // ordered easiest-first so the checklist reads bottom-up.
  const pathSkills = selectedGoal == null
    ? []
    : [...goalPathSet(selectedGoal, byId)]
        .filter((id) => id !== selectedGoal)
        .map((id) => byId.get(id))
        .filter(Boolean)
        .sort((a, b) => TIER_ORDER.indexOf(a.difficulty) - TIER_ORDER.indexOf(b.difficulty));

  const toggleKnown = (id) =>
    setKnownIds((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const finish = async () => {
    setSaving(true);
    try {
      if (selectedGoal != null) await setGoal(selectedGoal);
      await Promise.all([...knownIds].map((id) => markExerciseComplete(user.id, id)));
      router.push('/tree');
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  // --- gates ---
  if (authLoading || exLoading) {
    return <Centered><p style={{ color: theme.text.tertiary }}>Loading…</p></Centered>;
  }
  if (!user) {
    return (
      <Centered>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-3" style={{ color: theme.text.primary }}>Create an account first</h1>
          <p className="mb-6" style={{ color: theme.text.tertiary }}>Onboarding sets up your personal journey.</p>
          <Link href="/signup" className="inline-block px-6 py-3 rounded-lg font-semibold hover:opacity-90" style={{ backgroundColor: theme.accent.primary, color: 'white' }}>Sign up</Link>
        </div>
      </Centered>
    );
  }

  const card = { backgroundColor: theme.background.secondary, border: `1px solid ${theme.border.default}` };

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background.primary }}>
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* step indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[0, 1, 2].map((s) => (
            <span
              key={s}
              className="h-1.5 rounded-full transition-all"
              style={{ width: s === step ? 28 : 16, backgroundColor: s <= step ? theme.accent.primary : theme.border.dark }}
            />
          ))}
        </div>

        {/* STEP 0 — welcome */}
        {step === 0 && (
          <div className="text-center reveal-up">
            <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: theme.accent.primary }}>Welcome</p>
            <h1 className="text-4xl font-bold mb-4" style={{ color: theme.text.primary }}>Let’s set up your journey</h1>
            <p className="text-lg mb-10 max-w-md mx-auto" style={{ color: theme.text.tertiary }}>
              Pick a goal and tell us where you’re starting — we’ll light up your path and show you exactly what to train next.
            </p>
            <button onClick={() => setStep(1)} className="px-8 py-4 rounded-lg font-semibold text-lg cursor-pointer hover:opacity-90" style={{ backgroundColor: theme.accent.primary, color: '#04201f' }}>
              Get started
            </button>
          </div>
        )}

        {/* STEP 1 — choose a goal */}
        {step === 1 && (
          <div className="reveal-up">
            <h1 className="text-3xl font-bold mb-2 text-center" style={{ color: theme.text.primary }}>What’s your goal?</h1>
            <p className="text-center mb-8" style={{ color: theme.text.tertiary }}>Choose the skill you most want to unlock.</p>

            {goalSkills.length === 0 ? (
              <p className="text-center mb-8" style={{ color: theme.text.tertiary }}>No goals are set up yet — you can choose one later from the skill tree.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {goalSkills.map((s) => {
                  const active = s.id === selectedGoal;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedGoal(s.id)}
                      className="flex items-center gap-3 p-4 rounded-lg text-left cursor-pointer transition hover:opacity-90"
                      style={{ ...card, borderColor: active ? theme.accent.primary : theme.border.default, borderWidth: 1, borderStyle: 'solid' }}
                    >
                      <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.background.tertiary }}>
                        <ExerciseIcon src={s.icon} name={s.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate" style={{ color: theme.text.primary }}>{s.name}</p>
                        <p className="text-xs" style={{ color: theme.text.tertiary }}>{s.difficulty} · {s.category}</p>
                      </div>
                      {active && <span aria-hidden="true" style={{ color: theme.accent.primary }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep(0)} className="px-5 py-3 rounded-lg font-semibold cursor-pointer hover:opacity-80" style={{ color: theme.text.tertiary }}>Back</button>
              <button
                onClick={() => setStep(2)}
                disabled={goalSkills.length > 0 && selectedGoal == null}
                className="px-6 py-3 rounded-lg font-semibold cursor-pointer hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: theme.accent.primary, color: '#04201f' }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — what can you already do */}
        {step === 2 && (
          <div className="reveal-up">
            <h1 className="text-3xl font-bold mb-2 text-center" style={{ color: theme.text.primary }}>What can you already do?</h1>
            <p className="text-center mb-8" style={{ color: theme.text.tertiary }}>
              We’ll mark these complete so your path starts where you are. Skip anything you’re unsure about.
            </p>

            {pathSkills.length === 0 ? (
              <p className="text-center mb-8" style={{ color: theme.text.tertiary }}>
                {selectedGoal == null ? 'No goal selected — you can start fresh.' : 'This goal has no prerequisites — you can start right away!'}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {pathSkills.map((s) => {
                  const on = knownIds.has(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleKnown(s.id)}
                      className="px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition"
                      style={{
                        backgroundColor: on ? theme.accent.primary : theme.background.tertiary,
                        color: on ? '#04201f' : theme.text.secondary,
                        border: `1px solid ${on ? theme.accent.primary : theme.border.default}`,
                      }}
                    >
                      {on ? '✓ ' : ''}{s.name}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="px-5 py-3 rounded-lg font-semibold cursor-pointer hover:opacity-80" style={{ color: theme.text.tertiary }}>Back</button>
              <button
                onClick={finish}
                disabled={saving}
                className="px-6 py-3 rounded-lg font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: theme.accent.primary, color: '#04201f' }}
              >
                {saving ? 'Setting up…' : 'Start training'}
              </button>
            </div>
          </div>
        )}

        {/* skip out */}
        <div className="text-center mt-10">
          <Link href="/tree" className="text-sm hover:underline" style={{ color: theme.text.muted }}>Skip for now</Link>
        </div>
      </div>
    </div>
  );
}

function Centered({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: theme.background.primary }}>
      {children}
    </div>
  );
}
