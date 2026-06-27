-- ============================================================
-- Stepkai · Interview Intelligence Pipeline schema
-- Knowledge-asset model + full version history.
-- Run ONCE in the Supabase SQL Editor (after migrations.sql).
--
-- Lineage we preserve:  submission → extraction (vN) → interview → round
--                       → question → moderation_log → published
-- ============================================================


-- ── 0. Canonical questions store ─────────────────────────────
-- Extend the existing questions table to be the single source of truth.
alter table public.questions add column if not exists experience          text;
alter table public.questions add column if not exists source              text;
alter table public.questions add column if not exists answer              text;
alter table public.questions add column if not exists evaluation_criteria text[];
alter table public.questions add column if not exists category            text;
alter table public.questions add column if not exists skills              text[] default '{}';
alter table public.questions add column if not exists question_type       text;        -- mcq | free_text | coding | scenario | ...
alter table public.questions add column if not exists status              text default 'published';  -- draft | approved | published | rejected | merged
alter table public.questions add column if not exists confidence          numeric;     -- AI extraction confidence 0-1
alter table public.questions add column if not exists submission_id       uuid;        -- lineage → submissions
alter table public.questions add column if not exists extraction_id       uuid;        -- lineage → extractions
alter table public.questions add column if not exists interview_id        uuid;        -- lineage → interviews
alter table public.questions add column if not exists parent_question_id  text;        -- follow-up → its parent
alter table public.questions add column if not exists merged_into         text;        -- dedup: this row was merged into another
alter table public.questions add column if not exists published_at        timestamptz;
alter table public.questions add column if not exists seeded              boolean default false;  -- migrated from the static seed bank

create index if not exists questions_status_created on public.questions(status, created_at desc);
create index if not exists questions_company_role   on public.questions(company, role);


-- ── 1. submissions — the source-agnostic entry point ─────────
-- Every source (text, OCR, LinkedIn, Reddit, voice, pdf…) normalises to one of these.
create table if not exists public.submissions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete set null,
  source_type  text not null,                 -- text | screenshot_ocr | linkedin | reddit | manual | voice | pdf | discord
  source_meta  jsonb default '{}',            -- url, author, screenshot count, etc.
  raw_text     text not null,
  status       text default 'submitted',      -- submitted | extracting | extracted | reviewing | published | rejected
  created_at   timestamptz default now()
);
alter table public.submissions enable row level security;
create policy "submissions: owner read" on public.submissions for select using (auth.uid() = user_id);
-- writes go through the server (service role); no client insert policy.


-- ── 2. extractions — VERSIONED AI output (re-run, compare, audit) ─
create table if not exists public.extractions (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid not null references public.submissions(id) on delete cascade,
  version        integer not null default 1,
  model          text,                         -- e.g. gpt-4o-mini
  prompt_version text,                          -- so we can compare prompt iterations
  payload        jsonb not null,               -- { metadata, questions[], classification, dedup[], suggestions[] }
  created_at     timestamptz default now(),
  unique (submission_id, version)
);
alter table public.extractions enable row level security;
-- service-role only.


-- ── 3. interviews — a structured interview derived from a submission ─
create table if not exists public.interviews (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid references public.submissions(id) on delete set null,
  company        text,
  role           text,
  experience     text,
  interview_date date,
  outcome        text,                          -- Selected | Rejected | Waiting
  status         text default 'draft',          -- draft | published
  created_at     timestamptz default now()
);
alter table public.interviews enable row level security;
create policy "interviews public read" on public.interviews for select using (status = 'published');


-- ── 4. interview_rounds ──────────────────────────────────────
create table if not exists public.interview_rounds (
  id           uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews(id) on delete cascade,
  ord          integer default 1,
  round_type   text,
  difficulty   integer,
  notes        text
);
alter table public.interview_rounds enable row level security;
create policy "rounds public read" on public.interview_rounds for select using (true);


-- ── 5. moderation_log — audit trail of every human action ────
create table if not exists public.moderation_log (
  id            bigserial primary key,
  question_id   text,
  submission_id uuid,
  moderator_id  uuid references auth.users(id) on delete set null,
  action        text not null,                 -- approve | reject | merge | edit | batch_approve
  before        jsonb,
  after         jsonb,
  created_at    timestamptz default now()
);
alter table public.moderation_log enable row level security;
-- service-role only.


-- ── 6. trend_signals — materialised Knowledge Intelligence ───
-- The differentiator: aggregated trends that feed SEO pages + study plans.
create table if not exists public.trend_signals (
  id         bigserial primary key,
  kind       text not null,                    -- new_topic | trending_tech | monthly_faq | company_shift | skill_demand | failed_topic
  scope      jsonb default '{}',               -- { company, role, topic }
  value      jsonb not null,
  period     text,                             -- e.g. "2026-06"
  created_at timestamptz default now()
);
alter table public.trend_signals enable row level security;
create policy "trends public read" on public.trend_signals for select using (true);
