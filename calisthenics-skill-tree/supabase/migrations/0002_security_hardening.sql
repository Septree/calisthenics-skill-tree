-- Security hardening — run AFTER 0001_init.sql, in the Supabase SQL Editor.
-- Adds: input-validation CHECK constraints (lost in the Firebase→Supabase move),
-- an admin allowlist table replacing the hardcoded email in is_admin(), size/MIME
-- limits on the exercise-images bucket, a missing FK index, and RLS policies
-- rewritten per Supabase's performance guidance. Idempotent — safe to re-run.

-- ========== 1) input validation (defense-in-depth at the DB) ==========
-- profiles.name: users upsert this themselves; cap its length.
alter table public.profiles drop constraint if exists profiles_name_len;
alter table public.profiles
  add constraint profiles_name_len
  check (name is null or char_length(name) <= 80);

-- exercises: admin-written, but cap field + array sizes so a bad/automated
-- write can't bloat a public, statically-served row.
alter table public.exercises drop constraint if exists exercises_field_sizes;
alter table public.exercises
  add constraint exercises_field_sizes
  check (
    char_length(name) <= 120
    and char_length(category) <= 40
    and char_length(summary) <= 4000
    and char_length(icon) <= 2000
    and char_length(video_id) <= 32
    and difficulty in ('Beginner', 'Intermediate', 'Advanced')
    and coalesce(array_length(prerequisites, 1), 0) <= 50
    and coalesce(array_length(instructions, 1), 0) <= 60
    and coalesce(array_length(mistakes, 1), 0) <= 60
    and coalesce(array_length(tips, 1), 0) <= 60
  );

-- ========== 2) admin allowlist (replaces hardcoded email in is_admin) ==========
-- Keyed on auth.uid() (stable) rather than a mutable email claim, and
-- configurable as data instead of editing a function body.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- No policies => not readable/writable by anon/authenticated. Only the
-- SECURITY DEFINER is_admin() below (and the service_role) can see it.
alter table public.admin_users enable row level security;

-- SECURITY DEFINER so the membership check bypasses admin_users' RLS for any
-- caller. search_path='' (Supabase guidance) means every name must be fully
-- qualified; the inner auth.uid() check keeps it from leaking admin rights.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  )
$$;

-- Harden the signup trigger function the same way (was search_path = public).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Seed the current admin from their existing auth account. NOTE: this only works
-- if septrealdakheel@gmail.com has already signed up. Verify with the SELECT at
-- the bottom; if it returns 0 rows, sign in once with that account then re-run
-- just this INSERT (or insert the uid by hand).
insert into public.admin_users (user_id)
select id from auth.users where lower(email) = 'septrealdakheel@gmail.com'
on conflict (user_id) do nothing;

-- ========== 3) missing foreign-key index ==========
-- completions PK is (user_id, exercise_id): exercise_id is only a trailing
-- column, so the FK to exercises is effectively unindexed. Without this, deleting
-- an exercise (ON DELETE CASCADE) seq-scans completions. (user_id lookups for RLS
-- are already served by the PK's leading column.)
create index if not exists completions_exercise_id_idx
  on public.completions (exercise_id);

-- ========== 4) RLS policies — rewritten for performance ==========
-- Wrap auth.uid()/is_admin() in (select ...) so Postgres evaluates them ONCE
-- per query instead of once per row (Supabase RLS perf recommendation). Same
-- access rules as 0001, just the optimized form. Drop-then-create = idempotent.
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles for insert with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update using ((select auth.uid()) = id);

drop policy if exists "exercises_select_all" on public.exercises;
drop policy if exists "exercises_admin_write" on public.exercises;
create policy "exercises_select_all" on public.exercises for select using (true);
create policy "exercises_admin_write" on public.exercises for all
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "completions_select_own" on public.completions;
drop policy if exists "completions_insert_own" on public.completions;
drop policy if exists "completions_delete_own" on public.completions;
create policy "completions_select_own" on public.completions for select using ((select auth.uid()) = user_id);
create policy "completions_insert_own" on public.completions for insert with check ((select auth.uid()) = user_id);
create policy "completions_delete_own" on public.completions for delete using ((select auth.uid()) = user_id);

-- storage policies (same wrap for the admin write checks)
drop policy if exists "exercise_images_public_read" on storage.objects;
drop policy if exists "exercise_images_admin_insert" on storage.objects;
drop policy if exists "exercise_images_admin_update" on storage.objects;
drop policy if exists "exercise_images_admin_delete" on storage.objects;
create policy "exercise_images_public_read" on storage.objects
  for select using (bucket_id = 'exercise-images');
create policy "exercise_images_admin_insert" on storage.objects
  for insert with check (bucket_id = 'exercise-images' and (select public.is_admin()));
create policy "exercise_images_admin_update" on storage.objects
  for update using (bucket_id = 'exercise-images' and (select public.is_admin()));
create policy "exercise_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'exercise-images' and (select public.is_admin()));

-- ========== 5) storage bucket limits ==========
-- Backstop the (admin-only, canvas-reencoded) image uploads: 2 MB max, images only.
update storage.buckets
set file_size_limit = 2097152,
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp']
where id = 'exercise-images';

-- ========== verify ==========
-- Should return exactly one row (the admin). If zero, see the note in section 2.
select u.email from public.admin_users a join auth.users u on u.id = a.user_id;
