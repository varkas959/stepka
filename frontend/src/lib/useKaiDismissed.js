// Whether the user has tucked Kai away into his docked tab.
//
// Deliberately kept OUT of appState/Supabase progress. Three reasons:
//  1. It's a device-local UI preference, not progress — syncing it would make
//     dismissing Kai on your laptop hide him on your phone.
//  2. appState's context value is rebuilt on every state change, so a mutator
//     living there has an unstable identity. Anything using it as an effect
//     dependency self-retriggers — which caused a real infinite render loop.
//  3. loadProgress() returns PROGRESS_DEFAULTS wholesale on its error / no-row
//     / fake-seed paths, and that merge would silently reset the preference.
//
// useState's setter is referentially stable for the life of the component, so
// consumers can safely put `setDismissed` in a dependency array.
import { useCallback, useState } from 'react';

const LS_KEY = 'stepkai_kai_dismissed';

function read() {
  try {
    return localStorage.getItem(LS_KEY) === 'true';
  } catch {
    return false; // private mode / storage disabled
  }
}

export function useKaiDismissed() {
  const [dismissed, setDismissedState] = useState(read);

  const setDismissed = useCallback((next) => {
    setDismissedState(prev => {
      const value = typeof next === 'function' ? next(prev) : next;
      if (value === prev) return prev; // no-op writes must not churn state
      try { localStorage.setItem(LS_KEY, String(value)); } catch { /* ignore */ }
      return value;
    });
  }, []);

  return [dismissed, setDismissed];
}
