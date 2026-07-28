// Global app state. Persists to Supabase when a userId is present, otherwise
// falls back to localStorage for unauthenticated/preview use.
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loadProgress, saveProgress, recordReview, PROGRESS_DEFAULTS } from './progress';
import { SRS_CARDS } from './mockData';

const LS_KEY = 'asktaaza_state_v3'; // bumped to clear fake level/xp/streak defaults
const AppStateContext = createContext(null);

function todayISO() { return new Date().toISOString().slice(0, 10); }

// Single source of truth for "cards due today" everywhere it's shown (Sidebar
// badge, Study Plan summary, Daily Review's own headline). The persisted
// `dueToday` counter only decrements as reviews happen *today* — on a fresh
// day (or a fresh session that's never reviewed) it's still 0 from init,
// while Daily Review's actual deck is SRS_CARDS. Without this, one screen
// read the stale persisted counter and the other read the deck size
// directly, showing two different numbers for the same thing.
export function effectiveDueToday(state) {
  const today = todayISO();
  if (state.lastReviewDate !== today) return SRS_CARDS.length;
  return state.dueToday;
}

function applyReviewBookkeeping(s) {
  // Called whenever the user successfully completes a single card review.
  const today = todayISO();
  let { streak, longestStreak, lastReviewDate, reviewedToday, dueToday } = s;

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
  dueToday = Math.max(0, dueToday - 1);
  return { ...s, streak, longestStreak, reviewedToday, dueToday, lastReviewDate };
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
