'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { NAV } from '@/lib/config';

export default function Header() {
  const pathname = usePathname();
  const current = NAV.find((item) => item.href === pathname);
  // null = checking, true = connected, false = not connected
  const [dbOk, setDbOk] = useState(null);

  useEffect(() => {
    fetch('/api/health', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setDbOk(d.db === 'connected'))
      .catch(() => setDbOk(false));
  }, []);

  return (
    <header className="header">
      <div>
        <div className="eyebrow">Engro Corporation / Performance Management</div>
        <div className="title">{current ? current.title : 'Perform360'}</div>
        <div className="muted">Integrated employee performance and appraisal platform</div>
      </div>
      <span className={'pill status-pill ' + (dbOk === null ? 'gray' : dbOk ? 'green' : 'red')}>
        <span className={'dot ' + (dbOk === null ? '' : dbOk ? 'green' : 'red')} />
        {dbOk === null ? 'Checking database…' : dbOk ? 'Database connected' : 'Database not connected'}
      </span>
    </header>
  );
}
