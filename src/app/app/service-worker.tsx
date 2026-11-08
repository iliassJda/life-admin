'use client';

import { useEffect } from 'react';

/** Keeps the notification service worker registered and up to date. */
export function ServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .catch(() => {
        // Notifications simply stay unavailable; the app works without them.
      });
  }, []);
  return null;
}
