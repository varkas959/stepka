import { useEffect, useState } from 'react';

const KEY = 'stepkai-theme';

// Resolve the initial theme once, before React renders, to avoid a flash.
export function initTheme() {
  let theme = 'dark';
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch { /* localStorage unavailable */ }
  applyTheme(theme);
  return theme;
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle('light', theme === 'light');
  root.classList.toggle('dark', theme === 'dark');
}

let listeners = [];
let current = (typeof document !== 'undefined' && document.documentElement.classList.contains('light')) ? 'light' : 'dark';

export function setTheme(theme) {
  current = theme;
  applyTheme(theme);
  try { localStorage.setItem(KEY, theme); } catch { /* ignore */ }
  listeners.forEach(fn => fn(theme));
}

// Small shared-state hook so every mounted toggle stays in sync.
export function useTheme() {
  const [theme, set] = useState(current);
  useEffect(() => {
    const fn = (t) => set(t);
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  }, []);
  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  return { theme, toggle, setTheme };
}
