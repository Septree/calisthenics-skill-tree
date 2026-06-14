-- Target muscles per skill (e.g. push-up → Triceps, Chest). Run AFTER 0003,
-- in the Supabase SQL Editor. Additive + idempotent.

alter table public.exercises
  add column if not exists muscles text[] not null default '{}';

-- Cap the tag count (defense-in-depth, mirrors the other array constraints).
alter table public.exercises drop constraint if exists exercises_muscles_card;
alter table public.exercises
  add constraint exercises_muscles_card
  check (coalesce(array_length(muscles, 1), 0) <= 20);

-- No RLS change: exercises_admin_write already gates writes to the admin.
