'use client';
import React, { useState } from 'react';
import { Users, Plus, Zap, CheckCircle2, Loader2, Trash2, ChevronDown, ChevronUp, Terminal, Brain } from 'lucide-react';

interface SubAgent {
  id: string; name: string; goal: string; status: 'running' | 'done' | 'idle' | 'failed';
  skill: string; tick: number; memory: string[];
}

const SKILLS = ['Web Search', 'Code Gen', 'File RW', 'Browser', 'API Calls', 'Data Analysis', 'Email', 'Sub-Agent Spawn'];
const mkId = () => Math.random().toString(36).slice(2, 9);

export default function AgentsPage() {
  const [agents, setAgents]     = useState<SubAgent[]>([]);
  const [name, setName]         = useState('');
  const [goal, setGoal]         = useState('');
  const [skill, setSkill]       = useState(SKILLS[0]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const deploy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !goal.trim()) return;
    const agent: SubAgent = { id: mkId(), name, goal, status: 'running', skill, tick: 0, memory: [] };
    setAgents(prev => [...prev, agent]);
    setName(''); setGoal('');
    // Simulate ticks
    let t = 0;
    const interval = setInterval(() => {
      t++;
      setAgents(prev => prev.map(a => a.id === agent.id
        ? { ...a, tick: t, memory: [...a.memory.slice(-4), `Tick ${t}: task shard executed`], status: t >= 5 ? 'done' : 'running' }
        : a
      ));
      if (t >= 5) clearInterval(interval);
    }, 1400);
  };

  const stop = (id: string) => setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'idle' } : a));
  const remove = (id: string) => setAgents(prev => prev.filter(a => a.id !== id));

  const STATUS_COLOR: Record<string, string> = {
    running: 'var(--green)', done: 'var(--cyan)', idle: 'var(--text-subtle)', failed: 'var(--red)',
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
          <Users size={18} style={{ display: 'inline', marginRight: 8 }} />Agent Swarm
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Spawn and orchestrate multiple autonomous sub-agents. Each runs its own goal loop independently.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {[['Active', agents.filter(a => a.status === 'running').length, 'var(--green)'],
          ['Completed', agents.filter(a => a.status === 'done').length, 'var(--cyan)'],
          ['Total', agents.length, 'var(--text-muted)']].map(([l, v, c]) => (
          <div key={String(l)} className="card" style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'monospace', color: String(c) }}>{v}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Deploy form */}
      <div className="card" style={{ padding: '16px', marginBottom: 20 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} color="var(--accent-light)" /> Deploy New Agent
        </h2>
        <form onSubmit={deploy} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="input-group">
              <label className="label">Agent Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. ResearchBot" required />
            </div>
            <div className="input-group">
              <label className="label">Primary Skill</label>
              <select value={skill} onChange={e => setSkill(e.target.value)}>
                {SKILLS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="input-group">
            <label className="label">Goal / Prime Directive</label>
            <textarea value={goal} onChange={e => setGoal(e.target.value)}
              placeholder="e.g. Monitor Hacker News every 30 mins, summarise top 5 stories and send to Slack"
              rows={2} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            <Zap size={13} /> Deploy Agent
          </button>
        </form>
      </div>

      {/* Agent list */}
      {agents.length === 0 ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-subtle)' }}>
          <Brain size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.25 }} />
          <div style={{ fontSize: 13 }}>No agents deployed. Fill the form above to spawn your first agent.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {agents.map(agent => (
            <div key={agent.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 0' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[agent.status], flexShrink: 0, boxShadow: agent.status === 'running' ? `0 0 8px ${STATUS_COLOR[agent.status]}` : 'none' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{agent.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.goal}</div>
                </div>
                <span className="badge badge-gray" style={{ fontSize: 10 }}>{agent.skill}</span>
                <span className={`badge ${agent.status === 'running' ? 'badge-green' : agent.status === 'done' ? 'badge-cyan' : 'badge-gray'}`} style={{ fontSize: 10 }}>
                  {agent.status === 'running' && <Loader2 size={8} className="animate-spin" />}
                  {agent.status}
                </span>
                {agent.status === 'running' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => stop(agent.id)} style={{ fontSize: 11 }}>Stop</button>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(p => p === agent.id ? null : agent.id)}>
                  {expanded === agent.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => remove(agent.id)}>
                  <Trash2 size={12} color="var(--red)" />
                </button>
              </div>

              {/* Expanded telemetry */}
              {expanded === agent.id && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 6 }}>
                    <Terminal size={10} style={{ display: 'inline', marginRight: 4 }} />Tick {agent.tick} · Short-term Memory
                  </div>
                  <div style={{ background: '#0d0d0f', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', fontFamily: 'monospace', fontSize: 11, color: '#d4d4d4', lineHeight: 1.8 }}>
                    {agent.memory.length === 0
                      ? <span style={{ color: 'var(--text-subtle)' }}>Waiting for first tick…</span>
                      : agent.memory.map((m, i) => <div key={i}>{m}</div>)
                    }
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
