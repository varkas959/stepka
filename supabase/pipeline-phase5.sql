-- ============================================================
-- Stepkai · Phase 5 — Knowledge Intelligence (scheduled aggregation)
-- Run ONCE in the Supabase SQL Editor (after the other pipeline SQL).
--
-- Computes trend_signals from the published question corpus on a schedule.
-- Pure SQL — no LLM, no Vercel function. The differentiator: things a generic
-- assistant can't know, derived from Stepkai's accumulating data.
--
-- NOTE: pg_cron must be enabled. If "create extension pg_cron" errors on
-- permissions, enable it first in Dashboard → Database → Extensions → pg_cron.
-- ============================================================

create extension if not exists pg_cron;

create or replace function public.refresh_trends()
returns void language plpgsql security definer set search_path = public as $$
declare p text := to_char(now(), 'YYYY-MM');
begin
  delete from public.trend_signals where period = p;

  -- Skills rising in demand
  insert into public.trend_signals(kind, value, period)
  select 'trending_skill',
    coalesce(jsonb_agg(jsonb_build_object('label', skill, 'count', n) order by n desc), '[]'::jsonb), p
  from (
    select skill, count(*) n
    from (select unnest(skills) skill from public.questions where status = 'published') x
    where skill is not null and length(skill) > 1
    group by skill order by n desc limit 10
  ) y;

  -- Trending technologies
  insert into public.trend_signals(kind, value, period)
  select 'trending_tech',
    coalesce(jsonb_agg(jsonb_build_object('label', tech, 'count', n) order by n desc), '[]'::jsonb), p
  from (
    select tech, count(*) n
    from (select unnest(tech) tech from public.questions where status = 'published') x
    where tech is not null
    group by tech order by n desc limit 10
  ) y;

  -- Hot topics
  insert into public.trend_signals(kind, value, period)
  select 'hot_topic',
    coalesce(jsonb_agg(jsonb_build_object('label', topic, 'count', n) order by n desc), '[]'::jsonb), p
  from (
    select topic, count(*) n from public.questions
    where status = 'published' and topic is not null
    group by topic order by n desc limit 10
  ) y;

  -- Most-asked questions
  insert into public.trend_signals(kind, value, period)
  select 'most_asked',
    coalesce(jsonb_agg(jsonb_build_object('id', id, 'body', body, 'asked', asked, 'company', company) order by asked desc), '[]'::jsonb), p
  from (
    select id, body, asked, company from public.questions
    where status = 'published' order by asked desc nulls last limit 6
  ) y;

  -- Companies by question activity
  insert into public.trend_signals(kind, value, period)
  select 'company_activity',
    coalesce(jsonb_agg(jsonb_build_object('label', company, 'count', n) order by n desc), '[]'::jsonb), p
  from (
    select company, count(*) n from public.questions
    where status = 'published' and company is not null and company <> 'unknown'
    group by company order by n desc limit 10
  ) y;
end; $$;

-- Populate immediately.
select public.refresh_trends();

-- Re-compute nightly at 02:00 UTC.
select cron.schedule('refresh-trends', '0 2 * * *', $$ select public.refresh_trends(); $$);
