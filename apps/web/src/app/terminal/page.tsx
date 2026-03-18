'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Send } from 'lucide-react';

const BANNER = `
  ╔═══════════════════════════════════════╗
  ║       Agent Swarp Terminal v4.2       ║
  ║       Open-source · Autonomous        ║
  ╚═══════════════════════════════════════╝
  Type 'help' for available commands. Port :6969

`;

const BUILTIN: Record<string, () => string> = {
  help:    () => 'Commands: help, status, agents, clear, tools, version',
  status:  () => `Engine: online | Agents: 0 active | Port: 6969 | Uptime: ${Math.floor(process.uptime?.() ?? 0)}s`,
  agents:  () => 'No agents currently running. Deploy via /agents page.',
  version: () => 'Agent Swarp v4.2.0 — open-source autonomous AI framework',
  tools:   () => '101 tools available. Browse at /tools',
};

export default function TerminalPage() {
  const [lines, setLines] = useState<string[]>(BANNER.split('\n'));
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView(); }, [lines]);

  const run = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;
    setHistory(p => [cmd, ...p]);
    setHi(-1);
    setInput('');
    const out = BUILTIN[cmd.toLowerCase()]?.() ?? `${cmd}: command not found. Try 'help'`;
    setLines(prev => [...prev, `$ ${cmd}`, out, '']);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') { const next = Math.min(hi + 1, history.length - 1); setHi(next); setInput(history[next] ?? ''); }
    if (e.key === 'ArrowDown') { const next = Math.max(hi - 1, -1); setHi(next); setInput(history[next] ?? ''); }
  };

  return (
    <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <TerminalIcon size={16} color="var(--accent-light)" />
        <h1 style={{ fontSize: 16, fontWeight: 600 }}>Terminal</h1>
        <button onClick={() => setLines(BANNER.split('\n'))} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', fontSize: 11 }}>Clear</button>
      </div>
      <div style={{ flex: 1, background: '#0d0d0f', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: '#d4d4d4', lineHeight: 1.8 }}>
          {lines.map((line, i) => <div key={i}>{line || '\u00a0'}</div>)}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={run} style={{ display: 'flex', alignItems: 'center', borderTop: '1px solid var(--border)', padding: '8px 14px', gap: 8 }}>
          <span style={{ color: 'var(--accent-light)', fontFamily: 'monospace', fontSize: 12 }}>$</span>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#d4d4d4', fontFamily: 'monospace', fontSize: 12, caretColor: 'var(--accent-light)' }}
            placeholder="type a command…" autoFocus />
          <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}>
            <Send size={12} />
          </button>
        </form>
      </div>
    </div>
  );
}
