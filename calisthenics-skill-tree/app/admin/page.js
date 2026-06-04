'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { theme } from '../theme';
import { useAuth } from '../AuthContext';
import { exercises as builtInExercises } from '../exercises-data';
import { getNextExerciseId } from '../useExercises';
import ExerciseIcon from '../ExerciseIcon';
import {
  getCustomExercises,
  addCustomExercise,
  updateCustomExercise,
  deleteCustomExercise,
} from '../db-helpers';
import { fileToCompressedDataUrl } from '../image-utils';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const EMPTY_FORM = {
  editingDocId: null,
  editingId: null,
  name: '',
  category: '',
  difficulty: 'Beginner',
  summary: '',
  left: 150,
  top: 360,
  prerequisites: [],
  existingIcon: '',
};

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = !!user && !!ADMIN_EMAIL && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const [custom, setCustom] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  // Compressed base64 data URL of a freshly chosen image (stored in Firestore).
  const [imagePreview, setImagePreview] = useState('');
  const [imageProcessing, setImageProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const allExercises = [...builtInExercises, ...custom];

  const reload = () => {
    setListLoading(true);
    getCustomExercises()
      .then(setCustom)
      .finally(() => setListLoading(false));
  };

  useEffect(() => {
    if (isAdmin) reload();
  }, [isAdmin]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const togglePrereq = (id) =>
    setForm((f) => ({
      ...f,
      prerequisites: f.prerequisites.includes(id)
        ? f.prerequisites.filter((p) => p !== id)
        : [...f.prerequisites, id],
    }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setImagePreview('');
    setError('');
  };

  const startEdit = (ex) => {
    setForm({
      editingDocId: ex._docId,
      editingId: ex.id,
      name: ex.name || '',
      category: ex.category || '',
      difficulty: ex.difficulty || 'Beginner',
      summary: ex.summary || '',
      left: ex.position?.left ?? 150,
      top: ex.position?.top ?? 360,
      prerequisites: ex.prerequisites || [],
      existingIcon: ex.icon || '',
    });
    setImagePreview('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setImageProcessing(true);
    try {
      // Shrink in-browser and keep as a base64 data URL (no Firebase Storage).
      const dataUrl = await fileToCompressedDataUrl(file);
      setImagePreview(dataUrl);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not process that image.');
    } finally {
      setImageProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }

    setSubmitting(true);
    try {
      // New compressed image wins; otherwise keep the existing one (on edit).
      const iconUrl = imagePreview || form.existingIcon;

      const data = {
        id: form.editingId ?? getNextExerciseId(allExercises),
        name: form.name.trim(),
        category: form.category.trim().toLowerCase() || 'other',
        difficulty: form.difficulty,
        summary: form.summary.trim(),
        icon: iconUrl || '',
        position: { left: Number(form.left) || 0, top: Number(form.top) || 0 },
        prerequisites: form.prerequisites,
      };

      if (form.editingDocId) {
        await updateCustomExercise(form.editingDocId, data);
        setNotice(`Updated "${data.name}".`);
      } else {
        await addCustomExercise(data);
        setNotice(`Added "${data.name}". Its page is live at /exercises/${data.id}.`);
      }
      resetForm();
      reload();
    } catch (err) {
      console.error(err);
      setError('Save failed. Check your connection / permissions and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ex) => {
    if (!confirm(`Delete "${ex.name}"? This removes its page too.`)) return;
    try {
      await deleteCustomExercise(ex._docId);
      setNotice(`Deleted "${ex.name}".`);
      reload();
    } catch (err) {
      console.error(err);
      setError('Delete failed.');
    }
  };

  // ---- access control ----
  if (authLoading) {
    return (
      <Centered>
        <p style={{ color: theme.text.tertiary }}>Loading...</p>
      </Centered>
    );
  }

  if (!isAdmin) {
    return (
      <Centered>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-3" style={{ color: theme.text.primary }}>
            Admin Access Only
          </h1>
          <p className="mb-6" style={{ color: theme.text.tertiary }}>
            {user ? 'This account is not authorized.' : 'Please sign in with the admin account.'}
          </p>
          <Link
            href={user ? '/' : '/login'}
            className="inline-block px-6 py-3 rounded-lg font-semibold transition hover:opacity-90"
            style={{ backgroundColor: theme.accent.primary, color: 'white' }}
          >
            {user ? 'Back to Skill Tree' : 'Sign In'}
          </Link>
        </div>
      </Centered>
    );
  }

  const inputStyle = {
    backgroundColor: theme.background.tertiary,
    border: `1px solid ${theme.border.default}`,
    color: theme.text.primary,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background.primary }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold" style={{ color: theme.text.primary }}>
            Admin — Manage Skills
          </h1>
          <Link href="/" className="text-sm hover:underline" style={{ color: theme.accent.primary }}>
            View site →
          </Link>
        </div>
        <p className="mb-8" style={{ color: theme.text.tertiary }}>
          Signed in as {user.email}. Built-in skills are read-only; the ones you add here are fully editable.
        </p>

        {notice && (
          <div className="mb-6 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: theme.accent.success, border: '1px solid rgba(34,197,94,0.3)' }}>
            {notice}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="rounded-lg p-6 mb-10"
          style={{ backgroundColor: theme.background.secondary, border: `1px solid ${theme.border.default}` }}
        >
          <h2 className="text-2xl font-bold mb-5" style={{ color: theme.text.primary }}>
            {form.editingDocId ? 'Edit skill' : 'Add a new skill'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Field label="Name" htmlFor="name">
              <input id="name" type="text" value={form.name} onChange={(e) => setField('name', e.target.value)} required className="w-full px-3 py-2 rounded-lg" style={inputStyle} placeholder="e.g. Pike Push-ups" />
            </Field>
            <Field label="Category" htmlFor="category">
              <input id="category" type="text" value={form.category} onChange={(e) => setField('category', e.target.value)} className="w-full px-3 py-2 rounded-lg" style={inputStyle} placeholder="push / pull / legs / core ..." />
            </Field>
            <Field label="Difficulty" htmlFor="difficulty">
              <select id="difficulty" value={form.difficulty} onChange={(e) => setField('difficulty', e.target.value)} className="w-full px-3 py-2 rounded-lg" style={inputStyle}>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Image" htmlFor="image">
              <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm" style={{ color: theme.text.secondary }} />
              {imageProcessing && <p className="text-xs mt-1" style={{ color: theme.text.tertiary }}>Processing image…</p>}
            </Field>
          </div>

          <Field label="Summary" htmlFor="summary">
            <textarea id="summary" value={form.summary} onChange={(e) => setField('summary', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg" style={inputStyle} placeholder="Short description of the movement." />
          </Field>

          <div className="grid grid-cols-2 gap-4 my-4">
            <Field label="Tree position — left (px)" htmlFor="left">
              <input id="left" type="number" value={form.left} onChange={(e) => setField('left', e.target.value)} className="w-full px-3 py-2 rounded-lg" style={inputStyle} />
            </Field>
            <Field label="Tree position — top (px)" htmlFor="top">
              <input id="top" type="number" value={form.top} onChange={(e) => setField('top', e.target.value)} className="w-full px-3 py-2 rounded-lg" style={inputStyle} />
            </Field>
          </div>

          {/* image preview */}
          {(imagePreview || form.existingIcon) && (
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm" style={{ color: theme.text.tertiary }}>Preview:</span>
              <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: theme.background.tertiary, border: `1px solid ${theme.border.default}` }}>
                <ExerciseIcon src={imagePreview || form.existingIcon} name={form.name} className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* prerequisites */}
          <div className="mb-4">
            <p className="block mb-2 text-sm font-medium" style={{ color: theme.text.secondary }}>Prerequisites</p>
            <div className="flex flex-wrap gap-2">
              {allExercises.filter((ex) => ex.id !== form.editingId).map((ex) => {
                const on = form.prerequisites.includes(ex.id);
                return (
                  <button
                    type="button"
                    key={ex.id}
                    onClick={() => togglePrereq(ex.id)}
                    className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition"
                    style={{
                      backgroundColor: on ? theme.accent.primary : theme.background.tertiary,
                      color: on ? 'white' : theme.text.secondary,
                      border: `1px solid ${on ? theme.accent.primary : theme.border.default}`,
                    }}
                  >
                    {ex.name}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={submitting || imageProcessing} className="px-6 py-3 rounded-lg font-semibold transition hover:opacity-90 cursor-pointer disabled:opacity-50" style={{ backgroundColor: theme.accent.primary, color: 'white' }}>
              {submitting ? 'Saving...' : form.editingDocId ? 'Save changes' : 'Add skill'}
            </button>
            {form.editingDocId && (
              <button type="button" onClick={resetForm} className="px-6 py-3 rounded-lg font-semibold transition hover:opacity-80 cursor-pointer" style={{ backgroundColor: theme.background.tertiary, color: theme.text.primary, border: `1px solid ${theme.border.default}` }}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* CUSTOM LIST */}
        <h2 className="text-2xl font-bold mb-4" style={{ color: theme.text.primary }}>Your added skills</h2>
        {listLoading ? (
          <p style={{ color: theme.text.tertiary }}>Loading...</p>
        ) : custom.length === 0 ? (
          <p style={{ color: theme.text.tertiary }}>None yet — add your first skill above.</p>
        ) : (
          <div className="space-y-3">
            {custom.map((ex) => (
              <div key={ex._docId} className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: theme.background.secondary, border: `1px solid ${theme.border.default}` }}>
                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.background.tertiary }}>
                  <ExerciseIcon src={ex.icon} name={ex.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ color: theme.text.primary }}>{ex.name}</p>
                  <p className="text-xs" style={{ color: theme.text.tertiary }}>{ex.difficulty} · {ex.category} · /exercises/{ex.id}</p>
                </div>
                <button onClick={() => startEdit(ex)} className="text-sm px-3 py-1 rounded cursor-pointer hover:opacity-80" style={{ color: theme.accent.primary }}>Edit</button>
                <button onClick={() => handleDelete(ex)} className="text-sm px-3 py-1 rounded cursor-pointer hover:opacity-80" style={{ color: '#ef4444' }}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Centered({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background.primary }}>
      {children}
    </div>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block mb-2 text-sm font-medium" style={{ color: theme.text.secondary }}>
        {label}
      </label>
      {children}
    </div>
  );
}
