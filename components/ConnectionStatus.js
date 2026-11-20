'use client';

import { useEffect } from 'react';

// Logs to the browser console whether the backend (Express API) and the database (MongoDB) are connected.
export default function ConnectionStatus() {
  useEffect(() => {
    // A request cut off because the page is closing or reloading is not a connection problem.
    let leaving = false;
    const onLeave = () => (leaving = true);
    window.addEventListener('pagehide', onLeave);

    async function check() {
      let res;
      try {
        res = await fetch('/api/health', { cache: 'no-store' });
      } catch (e) {
        if (leaving) return;
        console.error('❌ Backend: not connected —', e.message);
        console.error('❌ Database: unknown (backend is not reachable)');
        return;
      }

      let data;
      try {
        data = await res.json();
      } catch {
        console.error(`❌ Backend: not responding correctly (HTTP ${res.status})`);
        console.error('❌ Database: unknown');
        return;
      }

      console.log('%c✅ Backend: connected', 'color: #16a34a; font-weight: bold');
      if (data.db === 'connected') {
        console.log(`%c✅ Database: connected (MongoDB "${data.database}", ping ${data.pingMs} ms)`, 'color: #16a34a; font-weight: bold');
      } else {
        console.error('❌ Database: not connected —', data.error);
      }
    }
    check();
    return () => window.removeEventListener('pagehide', onLeave);
  }, []);

  return null;
}
