'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Loader2, Check, X, Search, Code2, Brain,
  RefreshCw, ChevronDown, ChevronUp, Zap
} from 'lucide-react';

interface Message {
  role: 'user' | 'agent';
  content: string;
  trace?: TraceStep[];
}

interface TraceStep {
  phase: string;
  icon: string;
  detail: string;
  status: 'done' | 'running' | 'error';
}

const PHASE_ICONS: Record<string, string> = {
  Think: '💭', Research: '🔍', Plan: '📋',
  Observe: '👁', Code: '💻', Test: '🧪', Retry: '🔄', Done: '✅',
};

const PERSONAS = ['GravityClaw', 'Elon Mode', 'SRK Mode', 'Rayn Mode'];

// Simulates the agentic loop for demo purposes
async function* runAgentLoop(goal: string): AsyncGenerator<TraceStep> {
  const phases = ['Think', 'Research', 'Plan', 'Observe', 'Code', 'Test'];
  for (const phase of phases) {
    yield { phase, icon: PHASE_ICONS[phase], detail: `Executing ${phase.toLowerCase()} step for: "${goal.slice(0,40)}..."`, status: 'running' };
    await new Promise(r => setTimeout(r, 700));
    yield { phase, icon: PHASE_ICONS[phase], detail: `${phase} complete.`, status: 'done' };
  }
}

export default function StudioPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [persona, setPersona] = useState(PERSONAS[0]);
  const [running, setRunning] = useState(false);
  const [showTrace, setShowTrace] = useState<Record<number, boolean>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || running) return;
    const goal = input.trim();
    setInput('');
    setRunning(true);

    const userMsg: Message = { role: 'user', content: goal };
    setMessages(prev => [...prev, userMsg]);

    const agentMsg: Message = { role: 'agent', content: '', trace: [] };
    setMessages(prev => [...prev, agentMsg]);
    const agentIdx = messages.length + 1;

    const stepsMap: TraceStep[] = [];
    for await (const step of runAgentLoop(goal)) {
      stepsMap.push(step);
      setMessages(prev => {
        const updated = [...prev];
        if (updated[agentIdx]) updated[agentIdx] = { ...updated[agentIdx], trace: [...stepsMap] };
        return updated;
      });
    }

    setMessages(prev => {
      const updated = [...prev];
      if (updated[agentIdx]) updated[agentIdx] = {
        ...updated[agentIdx],
        content: `I've completed the task using the ${persona} personality. All ${stepsMap.length} phases passed.`,
        trace: stepsMap,
      };
      return updated;
    });
    setRunning(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 120px)' }}>
      {/* Top strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={15} color="var(--accent-light)" />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>Agent Studio</div>
          <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Think → Research → Plan → Observe → Code → Test → Retry loop</div>
        </div>
        <div style={{ flex: 1 }} />
        <select value={persona} onChange={e => setPersona(e.target.value)}
          style={{ width: 'auto', padding: '5px 10px', fontSize: 12 }}>
          {PERSONAS.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0, paddingRight: 4 }}>
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)' }}>
            <Zap size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
            <div style={{ fontSize: 13, fontWeight: 500 }}>Type a goal and let the agent loop run</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Think → Research → Plan → Observe → Code → Test → Retry</div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="chat-msg" style={{ flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-elevated)', border: '1px solid var(--border-strong)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>
              {msg.role === 'user' ? 'U' : <Bot size={13} />}
            </div>
            <div style={{ maxWidth: '75%' }}>
              {msg.trace && msg.trace.length > 0 && msg.role === 'agent' && (
                <div className="card" style={{ marginBottom: 6, padding: '10px 12px' }}>
                  <button onClick={() => setShowTrace(p => ({ ...p, [i]: !p[i] }))}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', width: '100%' }}>
                    <RefreshCw size={11} /> Agentic Loop Trace
                    {showTrace[i] ? <ChevronUp size={11} style={{ marginLeft: 'auto' }} /> : <ChevronDown size={11} style={{ marginLeft: 'auto' }} />}
                  </button>
                  {(showTrace[i] ?? true) && (
                    <div style={{ marginTop: 8 }}>
                      {msg.trace.map((step, si) => (
                        <div key={si} className="trace-step">
                          <div className="trace-icon" style={{ background: step.status === 'done' ? 'var(--green-dim)' : step.status === 'error' ? 'var(--red-dim)' : 'var(--accent-glow)' }}>
                            {step.status === 'running' ? <Loader2 size={10} className="animate-spin" /> :
                             step.status === 'done' ? <Check size={10} color="var(--green)" /> :
                             <X size={10} color="var(--red)" />}
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{step.icon} {step.phase}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 1 }}>{step.detail}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {msg.content && (
                <div className={`chat-bubble ${msg.role === 'user' ? 'user' : ''}`}>
                  {!msg.content && running && msg.role === 'agent' ? <Loader2 size={14} className="animate-spin" /> : msg.content}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={submit} style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} disabled={running}
          placeholder={running ? 'Agent is running…' : 'Describe a goal for the agent to accomplish…'}
          style={{ flex: 1 }} />
        <button type="submit" disabled={running || !input.trim()} className="btn btn-primary" style={{ padding: '7px 14px' }}>
          {running ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </form>
    </div>
  );
}
