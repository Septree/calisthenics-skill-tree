-- Phase 1: goal-oriented progression. Run AFTER 0002, in the Supabase SQL Editor.
-- Adds a curated "is this a goal?" flag on skills and a single active goal per user.
-- Idempotent — safe to re-run.

-- Which skills can be chosen as a goal (admin-curated: Muscle-Up, Handstand, ...).
alter table public.exercises
  add column if not exists is_goal boolean not null default false;

-- The user's single active goal (nullable; cleared if the skill is deleted).
alter table public.profiles
  add column if not exists goal_exercise_id bigint
    references public.exercises(id) on delete set null;

-- Index the FK (Supabase guidance) so the ON DELETE SET NULL + lookups are fast.
create index if not exists profiles_goal_exercise_id_idx
  on public.profiles (goal_exercise_id);

-- Partial index to list goal skills cheaply.
create index if not exists exercises_is_goal_idx
  on public.exercises (id) where is_goal;

-- No new RLS needed: profiles_update_own already lets a user set their own
-- goal_exercise_id; exercises_admin_write already gates is_goal to the admin.
