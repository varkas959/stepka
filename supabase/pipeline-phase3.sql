-- ============================================================
-- Stepkai · Phase 3 — roles + staging table for moderation
-- Run ONCE in the Supabase SQL Editor
-- (after migrations.sql, pipeline.sql, pipeline-embeddings.sql).
--
-- Key principle: drafts live in their OWN staging table. The live `questions`
-- bank only ever receives APPROVED, promoted rows. Moderation/retry/audit never
-- touch live content.
-- ============================================================


-- ── 1. profiles + role ───────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  role       text not null default 'user',   -- user | moderator | admin
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- A user can read their OWN profile (so the client can gate /admin/review).
create policy "profiles: read own" on public.profiles for select using (auth.uid() = id);

-- Auto-create a profile row on signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Backfill any existing users.
insert into public.profiles (id, email)
  select id, email from auth.users on conflict (id) do nothing;

-- Make yourself admin (replace the email):
--   update public.profiles set role = 'admin' where email = 'you@example.com';


-- ── 2. extracted_questions — the STAGING table ───────────────
-- One row per AI-extracted question, awaiting review. Never visible in the bank.
create table if not exists public.extracted_questions (
  id                    uuid primary key default gen_random_uuid(),
  submission_id         uuid references public.submissions(id) on delete cascade,
  extraction_id         uuid references public.extractions(id) on delete set null,
  interview_id          uuid references public.interviews(id) on delete set null,
  body                  text not null,
  round                 text,
  topic                 text,
  category              text,
  difficulty            text,
  skills                text[] default '{}',
  question_type         text,
  is_follow_up          boolean default false,
  confidence            numeric,
  company               text,
  role                  text,
  experience            text,
  embedding             vector(1536),
  dup_match_id          text,        -- nearest PUBLISHED question id
  dup_similarity        numeric,     -- 0-1 cosine similarity
  review_status         text default 'pending',  -- pending | approved | rejected | merged | edited
  reviewed_by           uuid references auth.users(id) on delete set null,
  reviewed_at           timestamptz,
  published_question_id text,        -- set when promoted into questions
  created_at            timestamptz default now()
);
alter table public.extracted_questions enable row level security;
-- No client policies — all reads/writes go through the role-checked server (service role).

create index if not exists eq_review_status on public.extracted_questions(review_status, created_at desc);
create index if not exists eq_embedding_idx  on public.extracted_questions using hnsw (embedding vector_cosine_ops);
