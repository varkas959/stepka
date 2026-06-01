// Lightweight global app state via React context (streak, XP, due count, active plan).
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'asktaaza_state_v1';

const DEFAULT_STATE = {
  streak: 7,
  longestStreak: 21,
  streakFreezes: 2,
  level: 12,
  xp: 3240,
  xpToNext: 3500,
  dueToday: 12,
  goalToday: 20,
  reviewedToday: 8,
  activePlan: { company: 'amazon', role: 'SDE2', currentDay: 4, totalDays: 14, dueQuestions: 3 },
  readiness: 61,
};

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
    } catch {
      return DEFAULT_STATE;
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => ({
    state,
    addXp: (amount) => setState(s => ({ ...s, xp: s.xp + amount })),
    bumpReview: () => setState(s => ({ ...s, reviewedToday: Math.min(s.goalToday, s.reviewedToday + 1), dueToday: Math.max(0, s.dueToday - 1) })),
    consumeFreeze: () => setState(s => ({ ...s, streakFreezes: Math.max(0, s.streakFreezes - 1) })),
    setActivePlan: (plan) => setState(s => ({ ...s, activePlan: plan })),
    setReadiness: (r) => setState(s => ({ ...s, readiness: r })),
  }), [state]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
