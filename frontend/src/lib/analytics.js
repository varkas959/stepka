// Thin wrapper around window.gtag so callers don't need to guard against it being undefined.
export function track(eventName, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}
