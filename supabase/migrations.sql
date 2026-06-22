-- ============================================================
-- Stepkai · Supabase migrations
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================


-- ── 1. questions ─────────────────────────────────────────────
create table if not exists public.questions (
  id           text primary key,
  company      text not null,
  role         text,
  topic        text,
  topic_path   text,
  difficulty   text,
  round        text,
  body         text not null,
  tech         text[]    default '{}',
  upvotes      integer   default 0,
  asked        integer   default 1,
  verify_count integer   default 1,
  days_ago     integer   default 0,
  user_id      uuid references auth.users(id) on delete set null,
  created_at   timestamptz default now()
);

-- RLS
alter table public.questions enable row level security;

-- Anyone can read
create policy "questions: public read"
  on public.questions for select
  using (true);

-- NOTE: direct client inserts are intentionally NOT allowed. All writes go
-- through the server-side /api/submit-question function (service role) so that
-- PII redaction and moderation cannot be bypassed. See section 9.

-- Users can update/delete only their own rows
create policy "questions: owner update"
  on public.questions for update
  using (auth.uid() = user_id);

create policy "questions: owner delete"
  on public.questions for delete
  using (auth.uid() = user_id);


-- ── 2. user_progress ─────────────────────────────────────────
create table if not exists public.user_progress (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  streak          integer   default 0,
  longest_streak  integer   default 0,
  streak_freezes  integer   default 1,
  level           integer   default 1,
  xp              integer   default 0,
  xp_to_next      integer   default 500,
  due_today       integer   default 0,
  goal_today      integer   default 10,
  reviewed_today  integer   default 0,
  active_plan     jsonb,
  readiness       integer   default 0,
  last_review_date date,
  updated_at      timestamptz default now()
);

alter table public.user_progress enable row level security;

create policy "user_progress: owner only"
  on public.user_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── 3. srs_reviews ───────────────────────────────────────────
create table if not exists public.srs_reviews (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  card_id     text not null,
  rating      integer not null check (rating between 1 and 4),
  next_due_at timestamptz not null,
  created_at  timestamptz default now()
);

alter table public.srs_reviews enable row level security;

create policy "srs_reviews: owner only"
  on public.srs_reviews for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists srs_reviews_user_due
  on public.srs_reviews(user_id, next_due_at);


-- ── 4. feedback ──────────────────────────────────────────────
create table if not exists public.feedback (
  id         bigserial primary key,
  category   text not null,
  message    text not null,
  rating     integer check (rating between 1 and 5),
  created_at timestamptz default now()
);

-- No user_id — anonymous submissions are intentional.
-- Restrict inserts to authenticated users only to limit spam.
alter table public.feedback enable row level security;

create policy "feedback: auth insert"
  on public.feedback for insert
  with check (auth.role() = 'authenticated');

-- Only service-role (your backend / Supabase dashboard) can read feedback
create policy "feedback: service read"
  on public.feedback for select
  using (auth.role() = 'service_role');


-- ============================================================
-- Interview Experience system — proprietary interview intelligence
-- ============================================================

-- ── 5. interview_experiences ─────────────────────────────────
create table if not exists public.interview_experiences (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  user_id          uuid references auth.users(id) on delete set null,
  company          text not null,
  role             text not null,
  experience_years text,                         -- e.g. "2-5 Years"
  interview_date   date,
  outcome          text check (outcome in ('Selected','Rejected','Waiting')),
  num_rounds       integer default 1,
  rounds           jsonb   default '[]',          -- [{name, type, questions:[], notes}]
  difficulty       integer check (difficulty between 1 and 5),
  notes            text,
  contributor_name text,                          -- only shown if show_name = true
  show_name        boolean default false,
  verified_count   integer default 0,
  created_at       timestamptz default now()
);

alter table public.interview_experiences enable row level security;

create policy "experiences: public read"
  on public.interview_experiences for select using (true);

-- No client insert policy — writes go through /api/submit-experience (service role).

create policy "experiences: owner update"
  on public.interview_experiences for update using (auth.uid() = user_id);

create policy "experiences: owner delete"
  on public.interview_experiences for delete using (auth.uid() = user_id);

create index if not exists experiences_company_role
  on public.interview_experiences(company, role);


-- ── 6. experience_questions ──────────────────────────────────
-- Individual questions pulled from an experience, auto-linked to the bank.
create table if not exists public.experience_questions (
  id                 bigserial primary key,
  experience_id      uuid not null references public.interview_experiences(id) on delete cascade,
  body               text not null,
  round              text,
  linked_question_id text,   -- plain text: may point at a seed-bank id (q123) OR a db question; no FK
  company            text,
  role               text,
  created_at         timestamptz default now()
);

alter table public.experience_questions enable row level security;

create policy "experience_questions: public read"
  on public.experience_questions for select using (true);

-- No client insert policy — writes go through /api/submit-experience (service role).

create index if not exists experience_questions_company_role
  on public.experience_questions(company, role);
create index if not exists experience_questions_linked
  on public.experience_questions(linked_question_id);


-- ── 7. question_verifications (verify a question) ─────────────
create table if not exists public.question_verifications (
  id          bigserial primary key,
  question_id text not null,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (question_id, user_id)
);

alter table public.question_verifications enable row level security;

create policy "verifications: public read"
  on public.question_verifications for select using (true);

create policy "verifications: auth insert own"
  on public.question_verifications for insert
  with check (auth.uid() = user_id);

create policy "verifications: owner delete"
  on public.question_verifications for delete using (auth.uid() = user_id);


-- ── 8. question_asks ("I was asked this") ─────────────────────
create table if not exists public.question_asks (
  id          bigserial primary key,
  question_id text not null,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (question_id, user_id)
);

alter table public.question_asks enable row level security;

create policy "asks: public read"
  on public.question_asks for select using (true);

create policy "asks: auth insert own"
  on public.question_asks for insert
  with check (auth.uid() = user_id);

create policy "asks: owner delete"
  on public.question_asks for delete using (auth.uid() = user_id);


-- ============================================================
-- 9. HARDENING — run this block if you already created the tables above
--    with the older policies. It removes client INSERT access so that all
--    experience/question writes must go through the server-side functions
--    (/api/submit-experience, /api/submit-question) which redact PII and
--    moderate content. Service-role (the server) bypasses RLS, so inserts
--    still work from the API. Safe to run multiple times.
-- ============================================================

-- Block direct client inserts (server-only writes)
drop policy if exists "questions: auth insert"            on public.questions;
drop policy if exists "experiences: auth insert"          on public.interview_experiences;
drop policy if exists "experience_questions: auth insert" on public.experience_questions;

-- Drop the bad FK so a reported question can link to a seed-bank id (q123)
-- that does not live in the questions table.
alter table public.experience_questions
  drop constraint if exists experience_questions_linked_question_id_fkey;
alter table public.experience_questions
  alter column linked_question_id type text;
