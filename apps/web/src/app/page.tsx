'use client';
import React, { useEffect, useState } from 'react';
import { Bot, Wrench, Activity, Zap, ArrowRight, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface StatCard { label: string; value: string; sub: string; color: string; }
const STATS: StatCard[] = [
  { label: 'Active Agents',       value: '0',       sub: 'Deploy your first agent', color: 'var(--accent-light)' },
  { label: 'Tools Available',     value: '100+',    sub: 'Ready to invoke',          color: 'var(--cyan)' },
  { label: 'Runs Today',          value: '0',       sub: 'No runs yet',              color: 'var(--green)' },
  { label: 'MCP Connections',     value: '1',       sub: 'GravityClaw server active',color: 'var(--amber)' },
];

const QUICK: { label: string; desc: string; href: string; icon: React.ElementType }[] = [
  { label: 'Open Studio',      desc: 'Chat with an agent or start a new run',   href: '/studio',    icon: Bot },
  { label: 'Browse Tools',     desc: 'Explore all 100+ available integrations', href: '/tools',     icon: Wrench },
  { label: 'New Workflow',     desc: 'Chain tools and agents into pipelines',   href: '/workflows', icon: Activity },
  { label: 'Browser Automation', desc: 'Run Playwright tasks in real-time',    href: '/browser',   icon: Zap },
];

export default function HomePage() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = () => setTime(new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}));
    fmt();
    const id = setInterval(fmt, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 4, fontFamily: 'monospace' }}>
          {time} · Engine online
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>AgentSwarp Studio</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Your autonomous AI workspace. Build, run, and monitor intelligent agents.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
        {STATS.map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: 'monospace' }}>{s.value}</div>
            <div style={{ fontSize: 12, fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
        Quick Start
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 28 }}>
        {QUICK.map(q => (
          <Link key={q.href} href={q.href}>
            <div className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <q.icon size={16} color="var(--accent-light)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{q.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{q.desc}</div>
              </div>
              <ArrowRight size={14} color="var(--text-subtle)" />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent runs (empty state) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Recent Runs
        </h2>
        <Link href="/studio"><span style={{ fontSize: 12, color: 'var(--accent-light)' }}>New Run →</span></Link>
      </div>
      <div className="card" style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-subtle)' }}>
        <Clock size={28} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
        <div style={{ fontSize: 13 }}>No runs yet. Go to Studio to start your first agent run.</div>
      </div>
    </div>
  );
}
