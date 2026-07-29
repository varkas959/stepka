// Global app state. Persists to Supabase when a userId is present, otherwise
// falls back to localStorage for unauthenticated/preview use.
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loadProgress, saveProgress, recordReview, PROGRESS_DEFAULTS } from './progress';

const LS_KEY = 'asktaaza_state_v3'; // bumped to clear fake level/xp/streak defaults
const AppStateContext = createContext(null);

function todayISO() { return new Date().toISOString().slice(0, 10); }

// ── Plan-driven review cards ──────────────────────────────────────────────
// Daily Review used to run off a static, generic 8-card mock deck completely
// unrelated to the user's actual plan — "0 due today" on Study Plan and "8
// cards due today" on Daily Review could both be true because they counted
// two unconnected things. Now there is exactly one deck: each plan day's own
// `practiceQuestions` (already gap-targeted, already generated per-day by
// generate-plan.js), materialized into review cards the first time that
// day's review is opened.

// Pure/read-only: returns a day's cards, materializing a fresh (unpersisted)
// array from practiceQuestions if none exist yet. Safe to call on every
// render (e.g. from effectiveDueToday) since it never mutates state itself.
export function getDayCards(day) {
  if (!day) return [];
  if (day.cards) return day.cards;
  return (day.practiceQuestions || []).map((q, i) => ({
    id: `d${day.day}-q${i}`, question: q, status: 'pending',
  }));
}

export function getCurrentDay(activePlan) {
  const days = activePlan?.plan?.days;
  if (!days) return null;
  return days.find(d => d.day === activePlan.currentDay) || null;
}

// Single source of truth for "cards due today" everywhere it's shown (Sidebar
// badge, Study Plan summary, Daily Review's own headline) — the pending-card
// count on the plan's current day. Zero when there's no active plan, since
// there's nothing to review until a plan exists.
export function effectiveDueToday(state) {
  const day = getCurrentDay(state.activePlan);
  if (!day) return 0;
  return getDayCards(day).filter(c => c.status === 'pending').length;
}

function applyReviewBookkeeping(s) {
  // Called whenever the user successfully completes a single card review.
  const today = todayISO();
  let { streak, longestStreak, lastReviewDate, reviewedToday } = s;

  if (lastReviewDate !== today) {
    // First review of a new day — streak logic
    const yesterday = new Date(Date.now() - 86400 * 1000).toISOString().slice(0, 10);
    if (lastReviewDate === yesterday) streak = streak + 1;
    else if (lastReviewDate) streak = 1;          // missed at least one day
    else streak = Math.max(1, streak);             // first ever review keeps seeded streak
    longestStreak = Math.max(longestStreak, streak);
    reviewedToday = 0;
    lastReviewDate = today;
  }
  reviewedToday = Math.min(s.goalToday, reviewedToday + 1);
  return { ...s, streak, longestStreak, reviewedToday, lastReviewDate };
}

// Marks a day's cards as materialized+persisted (idempotent — a no-op once
// `cards` already exists). Called when Daily Review opens a day, so the
// pending-card list survives reloads instead of being rebuilt in memory
// each render (which would silently discard grading progress).
function withMaterializedDay(activePlan, dayNumber) {
  const days = activePlan.plan.days.map(d => {
    if (d.day !== dayNumber || d.cards) return d;
    return { ...d, cards: getDayCards(d) };
  });
  return { ...activePlan, plan: { ...activePlan.plan, days } };
}

export function AppStateProvider({ userId, children }) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? { ...PROGRESS_DEFAULTS, ...JSON.parse(raw) } : PROGRESS_DEFAULTS;
    } catch {
      return PROGRESS_DEFAULTS;
    }
  });
  const [loaded, setLoaded] = useState(!userId);
  const saveTimer = useRef(null);
  const prevUserId = useRef(userId);

  // Load remote progress when a user signs in
  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      // Only reset on an actual sign-OUT transition (prevUserId was a real
      // id). A guest who was never signed in this session keeps whatever
      // real local progress they built up browsing as a guest — this isn't
      // about guests never having state, it's about not inheriting a
      // *different* account's cached state after that account signs out.
      if (prevUserId.current) {
        clearLocalState();
        setState(PROGRESS_DEFAULTS);
      }
      prevUserId.current = userId;
      setLoaded(true);
      return;
    }
    prevUserId.current = userId;
    setLoaded(false);
    loadProgress(userId).then(p => {
      if (cancelled) return;
      setState(prev => ({ ...prev, ...p }));
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [userId]);

  // A guest can never legitimately have an activePlan — generating one is
  // gated behind sign-in (StudyPlan redirects to /signin first). So if one
  // is present while unauthenticated, it's always stale data left over from
  // a previous signed-in session on this browser (e.g. the session simply
  // didn't survive a reload, rather than an explicit sign-out this app
  // instance ever witnessed) — the in-session sign-out reset above only
  // catches the latter. This runs on every render where it's relevant,
  // catching the case a fresh page load starts out already "logged out."
  useEffect(() => {
    if (!userId && state.activePlan) setState(s => ({ ...s, activePlan: null }));
  }, [userId, state.activePlan]);

  // Persist on every change: localStorage immediately + Supabase debounced
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* ignore */ }
    if (!userId || !loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { saveProgress(userId, state); }, 600);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state, userId, loaded]);

  const value = useMemo(() => ({
    state,
    dueToday: effectiveDueToday(state),
    loaded,
    addXp: (amount) => setState(s => {
      const xp = s.xp + amount;
      // level up when threshold crossed
      let level = s.level, xpToNext = s.xpToNext;
      if (xp >= s.xpToNext) {
        level = s.level + 1;
        xpToNext = Math.round(s.xpToNext * 1.25);
      }
      return { ...s, xp, level, xpToNext };
    }),
    bumpReview: () => setState(s => applyReviewBookkeeping(s)),
    recordRating: async (cardId, rating) => {
      if (userId) await recordReview(userId, cardId, rating);
    },
    consumeFreeze: () => setState(s => ({ ...s, streakFreezes: Math.max(0, s.streakFreezes - 1) })),
    setActivePlan: (plan) => setState(s => ({ ...s, activePlan: plan })),
    setReadiness: (r) => setState(s => ({ ...s, readiness: r })),

    // Materializes + persists a day's cards from its practiceQuestions the
    // first time that day's review is opened. Idempotent.
    startDayReview: (dayNumber) => setState(s => {
      if (!s.activePlan?.plan) return s;
      return { ...s, activePlan: withMaterializedDay(s.activePlan, dayNumber) };
    }),

    // Marks one card done with its grade, and — if it was graded poorly —
    // carries it into tomorrow's queue as a fresh pending card. This is the
    // "Day 2 = new gap cards + failed cards from before" mechanic: SRS as a
    // modifier on the plan queue, not a separate inbox.
    gradeReviewCard: (dayNumber, cardId, { overall, suggestedRating }) => setState(s => {
      if (!s.activePlan?.plan) return s;
      let activePlan = withMaterializedDay(s.activePlan, dayNumber);
      const carryOver = overall < 3.0;
      const nextDayNumber = dayNumber + 1;
      if (carryOver && activePlan.plan.days.some(d => d.day === nextDayNumber)) {
        activePlan = withMaterializedDay(activePlan, nextDayNumber);
      }
      const days = activePlan.plan.days.map(d => {
        if (d.day === dayNumber) {
          return { ...d, cards: d.cards.map(c => c.id === cardId ? { ...c, status: 'done', overall, suggestedRating } : c) };
        }
        if (carryOver && d.day === nextDayNumber) {
          const carried = d.cards.find(c => c.id === cardId);
          const card = { id: cardId, question: carried?.question, status: 'pending', carriedFrom: dayNumber };
          return { ...d, cards: [...d.cards, card] };
        }
        return d;
      });
      return { ...s, activePlan: { ...activePlan, plan: { ...activePlan.plan, days } } };
    }),

    // Called once a day's whole queue is cleared: rolls the average grade
    // into a readiness delta and advances the plan to the next day. There's
    // no prior readiness-history formula in this app to match — this is a
    // deliberately simple, transparent one: avg grade 5.0 -> +8, 3.0 -> 0,
    // 1.0 -> -8, clamped to 0-100.
    finishDayReview: (dayNumber) => setState(s => {
      if (!s.activePlan?.plan) return s;
      const day = s.activePlan.plan.days.find(d => d.day === dayNumber);
      const doneCards = (day?.cards || []).filter(c => c.status === 'done' && typeof c.overall === 'number');
      const avgOverall = doneCards.length ? doneCards.reduce((sum, c) => sum + c.overall, 0) / doneCards.length : 3;
      const delta = Math.round((avgOverall - 3) * 4);
      const newReadiness = Math.max(0, Math.min(100, s.readiness + delta));
      const days = s.activePlan.plan.days.map(d => d.day === dayNumber ? { ...d, readinessAfter: newReadiness } : d);
      const currentDay = s.activePlan.currentDay === dayNumber ? dayNumber + 1 : s.activePlan.currentDay;
      return {
        ...s,
        readiness: newReadiness,
        activePlan: { ...s.activePlan, currentDay, plan: { ...s.activePlan.plan, days } },
      };
    }),

    setConceptProgress: (trackId, conceptId) => setState(s => {
      const track = s.conceptsLearn?.[trackId] || { lastConceptId: null, completedConceptIds: [] };
      return {
        ...s,
        conceptsLearn: {
          ...s.conceptsLearn,
          [trackId]: {
            lastConceptId: conceptId,
            completedConceptIds: track.completedConceptIds.includes(conceptId)
              ? track.completedConceptIds
              : [...track.completedConceptIds, conceptId],
          },
        },
      };
    }),
  }), [state, loaded, userId]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

// Signing out only clears the auth session — nothing previously reset the
// localStorage-cached progress, so a guest browsing right after sign-out
// (or a different person on a shared machine) inherited the last signed-in
// user's streak/activePlan/etc, showing plan-in-progress data next to a
// guest banner.
export function clearLocalState() {
  try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
