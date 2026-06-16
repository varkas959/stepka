-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)

CREATE TABLE IF NOT EXISTS readiness_reports (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text        UNIQUE NOT NULL,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  company     text        NOT NULL,
  role        text        NOT NULL,
  readiness   integer     NOT NULL CHECK (readiness >= 0 AND readiness <= 100),
  heatmap     jsonb       NOT NULL DEFAULT '[]'::jsonb,
  gaps        jsonb       NOT NULL DEFAULT '{}'::jsonb,
  summary     text,
  prep_weeks  integer,
  is_public   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE readiness_reports ENABLE ROW LEVEL SECURITY;

-- Public read for any report marked is_public
CREATE POLICY "read_public_reports" ON readiness_reports
  FOR SELECT USING (is_public = true);

-- Index for fast slug lookups
CREATE INDEX IF NOT EXISTS readiness_reports_slug_idx ON readiness_reports (slug);
CREATE INDEX IF NOT EXISTS readiness_reports_created_idx ON readiness_reports (created_at DESC);
