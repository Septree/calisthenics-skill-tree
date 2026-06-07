'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { theme } from './theme'
import { useAuth } from './AuthContext'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/tree', label: 'Skill Tree' },
  { href: '/exercises', label: 'Exercises' },
  { href: '/profile', label: 'Profile' },
];

export default function Navigation() {
  const { user, profileName, logout } = useAuth();
  const isAdmin = !!user && !!ADMIN_EMAIL && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = () => setOpen(false);
  const linkBase = 'rounded-sm px-1 transition-opacity hover:opacity-80 focus-visible:opacity-100';
  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const links = (
    <>
      {NAV_LINKS.map((l) => {
        const active = isActive(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={close}
            aria-current={active ? 'page' : undefined}
            className={linkBase}
            style={{
              color: active ? theme.accent.primary : theme.text.secondary,
              fontWeight: active ? 600 : 400,
              borderBottom: active ? `2px solid ${theme.accent.primary}` : '2px solid transparent',
            }}
          >
            {l.label}
          </Link>
        );
      })}
      {isAdmin && (
        <Link
          href="/admin"
          onClick={close}
          aria-current={isActive('/admin') ? 'page' : undefined}
          className={linkBase}
          style={{
            color: theme.accent.primary,
            fontWeight: isActive('/admin') ? 700 : 500,
            borderBottom: isActive('/admin') ? `2px solid ${theme.accent.primary}` : '2px solid transparent',
          }}
        >
          Admin
        </Link>
      )}
    </>
  );

  const authActions = user ? (
    <>
      <span style={{ color: theme.text.tertiary }}>Hi, {profileName || 'there'}</span>
      <button
        onClick={() => { close(); logout(); }}
        className="cursor-pointer px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90 focus-visible:opacity-100"
        style={{ border: `1px solid ${theme.border.default}`, color: theme.text.secondary }}
      >
        Log out
      </button>
    </>
  ) : (
    <>
      <Link href="/login" onClick={close} className={`cursor-pointer ${linkBase}`} style={{ color: theme.text.secondary }}>
        Log in
      </Link>
      <Link
        href="/signup"
        onClick={close}
        className="text-center px-4 py-2 rounded-lg font-semibold transition-opacity hover:opacity-90 focus-visible:opacity-100"
        style={{ backgroundColor: theme.accent.primary, color: 'white' }}
      >
        Sign Up
      </Link>
    </>
  );

  return (
    <nav style={{ backgroundColor: theme.background.primary, borderBottom: `1px solid ${theme.border.dark}` }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <Link href="/" onClick={close} className={`font-semibold text-lg ${linkBase}`} style={{ color: theme.text.primary }}>
            Skill Tree
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex gap-6 text-sm items-center">
            {links}
            {authActions}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="md:hidden p-2 rounded-lg cursor-pointer focus-visible:opacity-100"
            style={{ color: theme.text.primary }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div
          className="md:hidden flex flex-col gap-4 px-4 py-4 text-base"
          style={{ borderTop: `1px solid ${theme.border.dark}` }}
        >
          {links}
          <div className="flex flex-col gap-3 pt-2" style={{ borderTop: `1px solid ${theme.border.dark}` }}>
            {authActions}
          </div>
        </div>
      )}
    </nav>
  );
}
