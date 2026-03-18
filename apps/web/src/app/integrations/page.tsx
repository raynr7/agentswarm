'use client';
import React, { useState } from 'react';
import {
  PlugZap, CheckCircle2, Circle, ExternalLink, Search,
  Bot, Globe, MessageSquare, FileText, Database, Code2,
  Zap, Mail, Calendar, Github, Slack, Send, Bell, TableProperties
} from 'lucide-react';

interface Integration {
  name: string; desc: string; cat: string; icon: React.ElementType;
  status: 'connected' | 'available'; color: string;
}

const INTEGRATIONS: Integration[] = [
  // AI Models
  { name: 'OpenAI GPT-4o',      desc: 'GPT-4o, GPT-4o-mini, o1, o3',              cat: 'AI Models', icon: Bot,           status: 'available', color: '#10a37f' },
  { name: 'Anthropic Claude',   desc: 'Claude 3.5 Sonnet, Haiku, Opus',             cat: 'AI Models', icon: Bot,           status: 'available', color: '#cc785c' },
  { name: 'Google Gemini',      desc: 'Gemini 2.0 Flash, Pro, Ultra',               cat: 'AI Models', icon: Bot,           status: 'available', color: '#4285f4' },
  { name: 'Groq',               desc: 'Llama3, Mixtral at 500+ tok/s',              cat: 'AI Models', icon: Zap,           status: 'available', color: '#f97316' },
  { name: 'Deepseek',           desc: 'DeepSeek-V3, R1 reasoning model',            cat: 'AI Models', icon: Bot,           status: 'available', color: '#6366f1' },
  { name: 'Mistral AI',         desc: 'Mistral Large, Codestral',                   cat: 'AI Models', icon: Bot,           status: 'available', color: '#ff7000' },
  { name: 'Ollama (Local)',      desc: 'Run Llama3, Phi3, Gemma locally',           cat: 'AI Models', icon: Bot,           status: 'available', color: '#22c55e' },
  { name: 'Together AI',        desc: 'Open-source models at scale',                cat: 'AI Models', icon: Bot,           status: 'available', color: '#a855f7' },

  // Communication
  { name: 'Telegram',           desc: 'Bot API, webhooks, message relay',           cat: 'Messaging', icon: Send,          status: 'available', color: '#0088cc' },
  { name: 'Slack',              desc: 'Channel messages, workflows, events',        cat: 'Messaging', icon: Slack,         status: 'available', color: '#4a154b' },
  { name: 'Discord',            desc: 'Bot messages, slash commands',               cat: 'Messaging', icon: MessageSquare, status: 'available', color: '#5865f2' },
  { name: 'Email (SMTP)',        desc: 'Send/receive email via SMTP/IMAP',           cat: 'Messaging', icon: Mail,          status: 'available', color: '#ef4444' },
  { name: 'WhatsApp',           desc: 'Business API message relay',                 cat: 'Messaging', icon: MessageSquare, status: 'available', color: '#25d366' },

  // Productivity
  { name: 'Notion',             desc: 'Read/write pages, databases',                cat: 'Productivity', icon: FileText,   status: 'available', color: '#ffffff' },
  { name: 'Google Calendar',    desc: 'Create, read, update events',                cat: 'Productivity', icon: Calendar,   status: 'available', color: '#4285f4' },
  { name: 'Google Sheets',      desc: 'Read/write spreadsheet data',                cat: 'Productivity', icon: TableProperties, status: 'available', color: '#34a853' },
  { name: 'Airtable',           desc: 'Base management, record CRUD',               cat: 'Productivity', icon: Database,   status: 'available', color: '#ff6b35' },
  { name: 'Linear',             desc: 'Issue tracking, project management',         cat: 'Productivity', icon: CheckCircle2, status: 'available', color: '#5e6ad2' },
  { name: 'Jira',               desc: 'Tickets, sprints, boards',                   cat: 'Productivity', icon: CheckCircle2, status: 'available', color: '#0052cc' },

  // Dev
  { name: 'GitHub',             desc: 'Repos, PRs, issues, actions',                cat: 'Dev', icon: Github,            status: 'connected', color: '#f0f6fc' },
  { name: 'Vercel',             desc: 'Deploy, preview, logs',                      cat: 'Dev', icon: Zap,               status: 'available', color: '#ffffff' },
  { name: 'Supabase',           desc: 'Auth, DB, storage, edge functions',          cat: 'Dev', icon: Database,          status: 'available', color: '#3ecf8e' },
  { name: 'Playwright MCP',     desc: 'Browser automation via MCP protocol',        cat: 'Dev', icon: Globe,             status: 'available', color: '#2dd4bf' },

  // MCP Servers
  { name: 'AgentSwarp MCP',     desc: 'Native tool server for Claude Desktop etc',  cat: 'MCP', icon: Zap,               status: 'connected', color: '#a78bfa' },
  { name: 'Brave Search MCP',   desc: 'Live web search via MCP',                    cat: 'MCP', icon: Globe,             status: 'available', color: '#fb923c' },
  { name: 'Filesystem MCP',     desc: 'Local file read/write via MCP',              cat: 'MCP', icon: FileText,          status: 'available', color: '#60a5fa' },
  { name: 'Puppeteer MCP',      desc: 'Headless browser control via MCP',           cat: 'MCP', icon: Globe,             status: 'available', color: '#4ade80' },
];

const CATS = ['All', ...Array.from(new Set(INTEGRATIONS.map(i => i.cat)))];

export default function IntegrationsPage() {
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');
  const [connected, setConnected] = useState<Set<string>>(
    new Set(INTEGRATIONS.filter(i => i.status === 'connected').map(i => i.name))
  );

  const filtered = INTEGRATIONS.filter(i =>
    (cat === 'All' || i.cat === cat) &&
    (i.name.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: 960 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
          <PlugZap size={18} style={{ display: 'inline', marginRight: 8 }} />Integrations
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Connect AI models, messaging, productivity tools, and MCP servers. API keys managed in{' '}
          <a href="/api" style={{ color: 'var(--accent-light)' }}>API Vault →</a>
        </p>
      </div>

      {/* Connected count */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <div className="card" style={{ padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="dot dot-green" />
          <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{connected.size}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>connected</span>
        </div>
        <div className="card" style={{ padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <Circle size={7} color="var(--text-subtle)" />
          <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{INTEGRATIONS.length - connected.size}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>available</span>
        </div>
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search integrations…" style={{ paddingLeft: 30 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATS.map(c => (
            <button key={c} className={`tool-pill ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 8 }}>
        {filtered.map(item => {
          const isConn = connected.has(item.name);
          return (
            <div key={item.name} className="card card-hover" style={{ padding: '14px 14px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-hover)', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <item.icon size={16} color={item.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{item.name}</span>
                  {isConn && <CheckCircle2 size={12} color="var(--green)" />}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 8 }}>{item.desc}</div>
                <button
                  onClick={() => setConnected(p => { const n = new Set(p); isConn ? n.delete(item.name) : n.add(item.name); return n; })}
                  className={`btn btn-sm ${isConn ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ fontSize: 11 }}>
                  {isConn ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
