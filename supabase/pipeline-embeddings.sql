-- ============================================================
-- Stepkai · Phase 2 — semantic duplicate detection (pgvector)
-- Run ONCE in the Supabase SQL Editor (after pipeline.sql).
-- Embeddings: OpenAI text-embedding-3-small (1536 dims).
-- ============================================================

create extension if not exists vector;

-- Embedding + dedup-candidate fields on the canonical store.
alter table public.questions add column if not exists embedding      vector(1536);
alter table public.questions add column if not exists dup_match_id   text;     -- nearest PUBLISHED question
alter table public.questions add column if not exists dup_similarity numeric;   -- 0-1 cosine similarity

-- HNSW index for fast cosine nearest-neighbour search.
create index if not exists questions_embedding_idx
  on public.questions using hnsw (embedding vector_cosine_ops);

-- RPC: nearest PUBLISHED questions to a query embedding.
-- Used by the pipeline to attach a dedup candidate to every extracted draft,
-- BEFORE a moderator ever sees it.
create or replace function public.match_questions(
  query_embedding vector(1536),
  match_count     int  default 5,
  exclude_id      text default null
)
returns table (id text, body text, company text, role text, similarity float)
language sql stable as $$
  select q.id, q.body, q.company, q.role,
         1 - (q.embedding <=> query_embedding) as similarity
  from public.questions q
  where q.status = 'published'
    and q.embedding is not null
    and (exclude_id is null or q.id <> exclude_id)
  order by q.embedding <=> query_embedding
  limit match_count;
$$;

-- Let the app call it (read-only over published rows).
grant execute on function public.match_questions(vector, int, text) to anon, authenticated, service_role;
