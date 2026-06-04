# AskTaaza — Product Requirements Doc

## Original Problem Statement
Web UI for AskTaaza (asktaaza.com) — technical interview prep platform. Linear/Raycast aesthetic, monospace for code/questions, fully responsive to 768px. 5 MVP features.

## User Choices (gathered)
- Backend: **Supabase Auth** (Google + LinkedIn OIDC) — fully wired with anon key + provider config done by user.
- LLM: **Gemini 2.5 Flash** (latest stable Flash; 1.5 Flash isn't in the supported list, communicated to user) via Emergent LLM key.
- AI grading + JD analyzer: **real** Gemini calls returning structured JSON.
- Fonts: IBM Plex Sans (UI) + JetBrains Mono (code/questions/data).

## Architecture
- Frontend: React 19 + react-router-dom 7 + Tailwind + shadcn/ui + recharts + sonner + lucide-react + `@supabase/supabase-js`.
- Backend: FastAPI + Motor (MongoDB) + `emergentintegrations` for Gemini.
- Auth: Supabase Auth (PKCE flow, localStorage persistence, `/auth/callback` route handles redirect).
- State: React Context (`appState.js`) + localStorage for user-side state.

## Implemented
**Iter 1 (frontend, mocked)** — 100% pass:
- Auth UI, sidebar, ActivePlanBanner
- Question Bank + Company Blueprint modal
- Daily Review SRS (flip cards, 4 ratings, session complete)
- Study Plan (JD → analysis → 14-day calendar)
- Practice (text/code, timer, feedback panel)
- Progress dashboard (streak, XP, readiness ring, heatmap, mastery, events)

**Iter 2 (real integrations)** — backend 100% pass (6/6 pytest):
- ✅ Supabase Auth wired (Google + LinkedIn OIDC), `/auth/callback` route
- ✅ `POST /api/grade` — Gemini-powered rubric grading (behavioral vs technical)
- ✅ `POST /api/analyze-jd` — Gemini-powered skill extraction + readiness + suggestions
- ✅ `EMERGENT_LLM_KEY` in backend `.env`
- ✅ Robust JSON extraction (handles ```json fences and first {} block)
- ✅ Graceful 502 on LLM failures

## P1 Backlog
- Persist user progress (streak, XP, due cards) to Supabase Postgres or MongoDB keyed by Supabase `sub` claim
- Persist user-submitted questions + verify counts
- Backend JWT validation (decode Supabase JWT in FastAPI for user-scoped writes)
- Real SRS scheduling (SM-2 or FSRS) with due-date storage

## P2 Backlog
- "Submit a question" contribution flow
- Daily digest email of due cards (Resend or SendGrid)
- Shareable readiness OG card for LinkedIn (suggested viral loop)
- Team/cohort plans

## Known minor (non-blocking)
- `_gemini_json` error-log guard uses `'response' in dir()` which always true; cosmetic.
- `logger` is defined after endpoints; works due to Python late binding but should be moved up for clarity.
