'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Bot, Wrench, Workflow, Brain, Settings, Terminal,
  Globe, ChevronRight, Zap, BookOpen, PlugZap, LogOut, Code2,
  Palette, Key, ChevronDown
} from 'lucide-react';
import './globals.css';

const MODES = ['✦ Agent', '🌐 Website Builder', '< / > Code'];

const NAV = [
  { label: 'Home',      href: '/',            icon: LayoutDashboard },
  { label: 'Studio',    href: '/studio',      icon: Bot },
  { label: 'Tools',     href: '/tools',       icon: Wrench },
  { label: 'Workflows', href: '/workflows',   icon: Workflow },
  { label: 'Browser',   href: '/browser',     icon: Globe },
  { label: 'Memory',    href: '/memory',      icon: Brain },
  { label: 'Terminal',  href: '/terminal',    icon: Terminal },
];

const BOTTOM_NAV = [
  { label: 'API Keys',      href: '/api',          icon: Key },
  { label: 'Integrations',  href: '/integrations', icon: PlugZap },
  { label: 'Themes',        href: '/themes',       icon: Palette },
  { label: 'Docs',          href: '/docs',         icon: BookOpen },
  { label: 'Settings',      href: '/settings',     icon: Settings },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mode, setMode] = useState(0);
  const [showModes, setShowModes] = useState(false);

  if (pathname === '/login') {
    return (
      <html lang="en">
        <head><title>AgentSwarp — Login</title></head>
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>AgentSwarp — Autonomous Studio</title>
        <meta name="description" content="Build, deploy, and orchestrate autonomous AI agents." />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="app-shell">
          {/* Sidebar */}
          <aside className="sidebar">
            {/* Brand */}
            <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}>
                <Zap size={14} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', background: 'linear-gradient(90deg,#a78bfa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AgentSwarp</div>
                <div style={{ fontSize: 10, color: 'var(--text-subtle)', lineHeight: 1 }}>Autonomous Studio</div>
              </div>
            </div>

            {/* Mode switcher */}
            <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>
              <button onClick={() => setShowModes(p => !p)}
                style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 7, padding: '6px 10px', color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'inherit' }}>
                <span>{MODES[mode]}</span>
                <ChevronDown size={12} />
              </button>
              {showModes && (
                <div style={{ marginTop: 4, background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 7, overflow: 'hidden' }}>
                  {MODES.map((m, i) => (
                    <button key={m} onClick={() => { setMode(i); setShowModes(false); }}
                      style={{ width: '100%', background: i === mode ? 'rgba(124,58,237,0.15)' : 'none', border: 'none', padding: '7px 12px', color: i === mode ? 'var(--accent-light)' : 'var(--text-muted)', fontSize: 12, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Main nav */}
            <div style={{ padding: '6px 0', flex: 1 }}>
              <div className="nav-section">Workspace</div>
              {NAV.map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href}>
                  <div className={`nav-item ${pathname === href || (href !== '/' && pathname.startsWith(href)) ? 'active' : ''}`}>
                    <Icon size={14} />
                    {label}
                  </div>
                </Link>
              ))}
            </div>

            {/* Bottom nav */}
            <div style={{ borderTop: '1px solid var(--border)', padding: '6px 0' }}>
              <div className="nav-section">Config</div>
              {BOTTOM_NAV.map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href}>
                  <div className={`nav-item ${pathname === href ? 'active' : ''}`}>
                    <Icon size={14} />
                    {label}
                  </div>
                </Link>
              ))}
              <Link href="/login">
                <div className="nav-item" style={{ marginTop: 4 }}>
                  <LogOut size={14} />
                  Sign out
                </div>
              </Link>
            </div>
          </aside>

          {/* Main area */}
          <div className="main-area">
            {/* Top bar */}
            <div className="top-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-subtle)', fontSize: 12 }}>
                <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>AgentSwarp</span>
                <ChevronRight size={11} />
                <span style={{ color: 'var(--text-muted)' }}>
                  {pathname === '/' ? 'Home' : pathname.replace('/', '').charAt(0).toUpperCase() + pathname.replace('/', '').slice(1)}
                </span>
              </div>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 11, color: 'var(--text-subtle)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 7px', fontFamily: 'monospace' }}>
                {MODES[mode]}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 10 }}>
                <span className="dot dot-green" />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Online</span>
              </div>
            </div>

            {/* Page content */}
            <div className="page-content">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
