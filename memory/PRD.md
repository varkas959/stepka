# AskTaaza — Product Requirements Doc

## Original Problem Statement
Build the web UI for AskTaaza (asktaaza.com) — a technical interview prep platform for engineers switching companies. Linear/Raycast aesthetic, monospace for code/questions, fully responsive to 768px. 5 MVP features as React app.

## User Choices (gathered)
- Backend: **Supabase** (URL provided: `https://rbingkpksfmpcophexyi.supabase.co`); anon key + OAuth NOT yet enabled → local stub used.
- Auth: **Google + LinkedIn** OAuth (stubbed for now, structured for easy Supabase swap).
- AI grading + JD analyzer: **mocked** (per spec, 1.5s fake loading).
- Fonts: IBM Plex Sans (UI) + JetBrains Mono (code/questions/data).

## Personas
- Working software engineer (SDE1 → Staff), busy, impatient, switching companies.
- Looking for signal (real questions, gap analysis, focused plan), not bootcamp content.

## Architecture
- Frontend: React 19 + react-router-dom 7 + Tailwind + shadcn/ui + recharts + sonner + lucide-react.
- State: React Context (`appState.js`) + localStorage. No backend calls.
- Auth: `lib/auth.js` shim — drop-in replaceable with `@supabase/supabase-js`.
- All mock data in `/app/frontend/src/lib/mockData.js`.

## Implemented (2026-02-XX, iter 1) — 100% test pass
- ✅ Auth gate (Google / LinkedIn buttons, demo-mode disclosure, persistent session)
- ✅ Sidebar nav with due-count badge, streak, sign-out, mobile drawer
- ✅ Question Bank (12 Qs across 5 companies, sidebar filters, search, expandable cards, verified/upvote/asked badges, Company Blueprint modal with rounds + heatmap)
- ✅ Daily Review SRS (queue → flashcard flip → 4 ratings → session complete with breakdown)
- ✅ JD Skill-Gap Analyzer (textarea + selects → 1.5s mock → readiness 61% + skill bars → 14-day calendar plan with expandable days)
- ✅ Practice AI grading (text/code toggle, timer, 1.5s mock submit → rubric scorecard + feedback + apply-to-SRS)
- ✅ Progress dashboard (streak, freezes, XP+level+recharts breakdown, readiness ring, 8-week GitHub heatmap, topic mastery bars, recent XP events)
- ✅ Active plan banner persistent across protected routes
- ✅ All interactive elements have `data-testid`

## P1 Backlog
- Real Supabase auth wiring (need anon key + Google/LinkedIn enabled in Supabase dashboard)
- Replace mock data with Supabase tables (`questions`, `srs_cards`, `submissions`, `xp_events`)
- Real LLM-graded answers (Claude Sonnet 4.5 or GPT-5.2 via Emergent LLM key)
- Real JD skill extraction (LLM)

## P2 Backlog
- "Submit a question" contribution flow
- Email digest of due cards
- Public profile / shareable readiness card
- Team plans (study cohort)
