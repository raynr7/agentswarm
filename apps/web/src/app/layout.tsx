'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Bot, Wrench, Workflow, Brain, Settings, Terminal,
  Globe, ChevronRight, Zap, BookOpen, PlugZap, LogOut
} from 'lucide-react';
import './globals.css';

const NAV = [
  { label: 'Home',      href: '/',          icon: LayoutDashboard },
  { label: 'Studio',    href: '/studio',    icon: Bot },
  { label: 'Tools',     href: '/tools',     icon: Wrench },
  { label: 'Workflows', href: '/workflows', icon: Workflow },
  { label: 'Browser',   href: '/browser',   icon: Globe },
  { label: 'Memory',    href: '/memory',    icon: Brain },
  { label: 'Terminal',  href: '/terminal',  icon: Terminal },
];

const BOTTOM_NAV = [
  { label: 'Integrations', href: '/integrations', icon: PlugZap },
  { label: 'Docs',         href: '/docs',         icon: BookOpen },
  { label: 'Settings',     href: '/settings',     icon: Settings },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  if (isLogin) {
    return (
      <html lang="en">
        <head><title>AgentSwarp</title></head>
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>AgentSwarp — Autonomous Studio</title>
        <meta name="description" content="Build, deploy, and orchestrate autonomous AI agents." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="app-shell">
          {/* Sidebar */}
          <aside className="sidebar">
            {/* Brand */}
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={14} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>AgentSwarp</div>
                <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>v3 · GravityClaw</div>
              </div>
            </div>

            {/* Main nav */}
            <div style={{ padding: '8px 0', flex: 1 }}>
              <div className="nav-section">Workspace</div>
              {NAV.map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href}>
                  <div className={`nav-item ${pathname === href || (href !== '/' && pathname.startsWith(href)) ? 'active' : ''}`}>
                    <Icon size={15} />
                    {label}
                  </div>
                </Link>
              ))}
            </div>

            {/* Bottom nav */}
            <div style={{ padding: '0 0 8px', borderTop: '1px solid var(--border)' }}>
              {BOTTOM_NAV.map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href}>
                  <div className={`nav-item ${pathname === href ? 'active' : ''}`}>
                    <Icon size={15} />
                    {label}
                  </div>
                </Link>
              ))}
              <div className="nav-item" style={{ marginTop: 4, color: 'var(--text-muted)' }}>
                <LogOut size={15} />
                Sign out
              </div>
            </div>
          </aside>

          {/* Main area */}
          <div className="main-area">
            {/* Top bar */}
            <div className="top-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-subtle)', fontSize: 12 }}>
                <span>AgentSwarp</span>
                <ChevronRight size={12} />
                <span style={{ color: 'var(--text-muted)' }}>
                  {pathname === '/' ? 'Home' :
                    pathname.replace('/', '').charAt(0).toUpperCase() +
                    pathname.replace('/', '').slice(1)}
                </span>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="dot dot-green" />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Engine online</span>
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
