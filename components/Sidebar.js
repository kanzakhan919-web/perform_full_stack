'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV } from '@/lib/config';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-mark" /> Perform360
      </div>
      <div className="sub">Performance Management System</div>
      <nav className="navs">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className={'nav' + (pathname === item.href ? ' active' : '')}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        Data storage
        <br />
        <b>MongoDB Atlas</b>
      </div>
    </aside>
  );
}
