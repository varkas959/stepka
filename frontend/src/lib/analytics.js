// Thin wrapper around window.gtag so callers don't need to guard against it being undefined.
export function track(eventName, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

// GA's automatic page_view (gtag('config', ...) in public/index.html) only
// fires once, on the initial script load — it has no way to know this is a
// client-routed SPA, so every in-app navigation after that was invisible.
// send_page_view is disabled in index.html; this is the replacement, called
// from a route-change listener in App.js so every route change (including
// the first) sends exactly one page_view.
export function trackPageView(path) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}
