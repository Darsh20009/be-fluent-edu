'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      // Remove only this app's old development worker; never touch other
      // registrations or the production worker/cache policy.
      void navigator.serviceWorker.getRegistrations().then(async (registrations) => {
        const owned = registrations.filter((registration) => {
          const worker = registration.active || registration.waiting || registration.installing;
          if (!worker) return false;
          const url = new URL(worker.scriptURL);
          return url.origin === window.location.origin && url.pathname === '/sw.js';
        });
        await Promise.all(owned.map((registration) => registration.unregister()));
      }).catch(() => {
        console.warn('Could not remove the old development service worker.');
      });
      return;
    }

    // Keep the existing production registration policy unchanged.
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    });
  }, []);

  return null;
}
