-- AskTaaza Supabase migration
-- Run this in Supabase SQL Editor (Dashboard → SQL → New query → paste → Run)

-- ============================================================
-- 1. user_progress: one row per Supabase user
-- ============================================================
create table if not exists public.user_progress (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  streak           int  not null default 7,
  longest_streak   int  not null default 21,
  streak_freezes   int  not null default 2,
  level            int  not null default 12,
  xp               int  not null default 3240,
  xp_to_next       int  not null default 3500,
  due_today        int  not null default 12,
  goal_today       int  not null default 20,
  reviewed_today   int  not null default 8,
  active_plan      jsonb not null default '{"company":"amazon","role":"SDE2","currentDay":4,"totalDays":14,"dueQuestions":3}'::jsonb,
  readiness        int  not null default 61,
  last_review_date date,
  updated_at       timestamptz not null default now()
);

create index if not exists user_progress_updated_at_idx on public.user_progress(updated_at);

-- ============================================================
-- 2. srs_reviews: per-rating history for spaced repetition
-- ============================================================
create table if not exists public.srs_reviews (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  card_id      text not null,
  rating       int  not null check (rating between 1 and 4),
  next_due_at  timestamptz not null,
  reviewed_at  timestamptz not null default now()
);

create index if not exists srs_reviews_user_due_idx on public.srs_reviews(user_id, next_due_at);

-- ============================================================
-- 3. RLS — users can only see/modify their own rows
-- ============================================================
alter table public.user_progress enable row level security;
alter table public.srs_reviews   enable row level security;

drop policy if exists "user_progress: own row select" on public.user_progress;
drop policy if exists "user_progress: own row upsert" on public.user_progress;
create policy "user_progress: own row select" on public.user_progress
  for select using (auth.uid() = user_id);
create policy "user_progress: own row upsert" on public.user_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "srs_reviews: own row" on public.srs_reviews;
create policy "srs_reviews: own row" on public.srs_reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 4. Auto-create progress row on signup
-- ============================================================
create or replace function public.handle_new_user_progress()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_progress (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_progress on auth.users;
create trigger on_auth_user_created_progress
  after insert on auth.users
  for each row execute function public.handle_new_user_progress();

-- ============================================================
-- 5. Backfill existing users (idempotent)
-- ============================================================
insert into public.user_progress (user_id)
select id from auth.users
on conflict (user_id) do nothing;
