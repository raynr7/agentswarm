'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot, Send, Loader2, Check, X, RefreshCw, ChevronDown, ChevronUp,
  ThumbsUp, ThumbsDown, Copy, Download, Paperclip, Pencil, Sparkles,
  Plus, RotateCcw, MessageSquare, Trash2, History
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────
interface TraceStep { phase: string; icon: string; detail: string; status: 'done' | 'running' | 'error'; }
interface ChatMessage { id: string; role: 'user' | 'agent'; content: string; trace?: TraceStep[]; liked?: boolean | null; file?: string; }
interface Session { id: string; name: string; messages: ChatMessage[]; created: Date; }

// ── Constants ───────────────────────────────────────────────────────────────
const PHASE_ICONS: Record<string, string> = {
  Think: '💭', Research: '🔍', Plan: '📋', Observe: '👁', Code: '💻', Test: '🧪',
};

const FOCUS_MODES = [
  { key: 'precise',   label: 'Precise',   desc: 'Concise, accurate answers' },
  { key: 'builder',   label: 'Builder',   desc: 'Code-first, shipping mindset' },
  { key: 'analyst',   label: 'Analyst',   desc: 'Data-driven, thorough reasoning' },
  { key: 'creative',  label: 'Creative',  desc: 'Exploratory, open-ended thinking' },
];

const MODELS = [
  'GPT-4o', 'Claude 3.5 Sonnet', 'Gemini 2.0 Flash',
  'Groq Llama3-70B', 'DeepSeek-V3', 'Mistral Large', 'Ollama (Local)',
];

// ── Agentic loop simulation ──────────────────────────────────────────────────
async function* runLoop(goal: string): AsyncGenerator<TraceStep> {
  for (const phase of ['Think', 'Research', 'Plan', 'Observe', 'Code', 'Test']) {
    yield { phase, icon: PHASE_ICONS[phase], detail: `${phase}: "${goal.slice(0, 50)}…"`, status: 'running' };
    await new Promise(r => setTimeout(r, 550));
    yield { phase, icon: PHASE_ICONS[phase], detail: `${phase} complete.`, status: 'done' };
  }
}

const mkId = () => Math.random().toString(36).slice(2, 10);
const mkSession = (): Session => ({ id: mkId(), name: `Session ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, messages: [], created: new Date() });

// ── Components ───────────────────────────────────────────────────────────────
export default function StudioPage() {
  const [sessions, setSessions]     = useState<Session[]>([mkSession()]);
  const [activeId, setActiveId]     = useState<string>('');
  const [input, setInput]           = useState('');
  const [focus, setFocus]           = useState(FOCUS_MODES[0].key);
  const [model, setModel]           = useState(MODELS[0]);
  const [running, setRunning]       = useState(false);
  const [showTrace, setShowTrace]   = useState<Record<string, boolean>>({});
  const [file, setFile]             = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const fileRef                     = useRef<HTMLInputElement>(null);
  const bottomRef                   = useRef<HTMLDivElement>(null);
  const inputRef                    = useRef<HTMLTextAreaElement>(null);

  // Init active session
  useEffect(() => { if (!activeId && sessions.length) setActiveId(sessions[0].id); }, [sessions, activeId]);

  const activeSession = sessions.find(s => s.id === activeId) ?? sessions[0];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeSession?.messages]);

  const updateMessages = useCallback((id: string, fn: (prev: ChatMessage[]) => ChatMessage[]) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, messages: fn(s.messages) } : s));
  }, []);

  const newSession = () => {
    const s = mkSession();
    setSessions(prev => [s, ...prev]);
    setActiveId(s.id);
  };

  const deleteSession = (id: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      if (activeId === id && next.length) setActiveId(next[0].id);
      return next.length ? next : [mkSession()];
    });
  };

  const resetSession = () => {
    setSessions(prev => prev.map(s => s.id === activeId ? { ...s, messages: [] } : s));
  };

  const runAgent = useCallback(async (goal: string, sid: string, fileAttachment?: string) => {
    setRunning(true);
    setFile(null);

    const uid = mkId();
    const aid = mkId();
    const userMsg: ChatMessage = { id: uid, role: 'user', content: goal, file: fileAttachment };
    const agentMsg: ChatMessage = { id: aid, role: 'agent', content: '', trace: [] };
    updateMessages(sid, prev => [...prev, userMsg, agentMsg]);

    const steps: TraceStep[] = [];
    for await (const step of runLoop(goal)) {
      steps.push(step);
      updateMessages(sid, prev => prev.map(m => m.id === aid ? { ...m, trace: [...steps] } : m));
    }

    const fm = FOCUS_MODES.find(f => f.key === focus)?.label ?? 'Precise';
    updateMessages(sid, prev => prev.map(m => m.id === aid ? {
      ...m,
      content: `[${fm} · ${model}] Task complete — all phases passed.\n\nGoal: "${goal}"\n\nI've completed the full agentic loop (Think→Research→Plan→Observe→Code→Test). Use 👍/👎 to refine future responses, or press **Regenerate** for an alternative.`,
      trace: steps,
    } : m));
    setRunning(false);
  }, [focus, model, updateMessages]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const goal = input.trim();
    if (!goal || running || !activeId) return;
    const attach = file ?? undefined;
    setInput('');
    await runAgent(goal, activeId, attach);
  };

  const regenerate = async (msg: ChatMessage) => {
    const msgs = activeSession?.messages ?? [];
    const idx = msgs.findIndex(m => m.id === msg.id);
    const userMsg = [...msgs].slice(0, idx).reverse().find(m => m.role === 'user');
    if (!userMsg || running) return;
    updateMessages(activeId, prev => prev.filter(m => m.id !== msg.id));
    await runAgent(userMsg.content, activeId);
  };

  const copyMsg = (content: string) => navigator.clipboard.writeText(content);

  const downloadChat = () => {
    const md = (activeSession?.messages ?? []).map(m =>
      m.role === 'user' ? `**You:** ${m.content}` : `**Agent:** ${m.content}`
    ).join('\n\n---\n\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `${activeSession?.name ?? 'chat'}-${Date.now()}.md`; a.click();
  };

  const msgs = activeSession?.messages ?? [];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 49px)', overflow: 'hidden' }}>

      {/* Sessions sidebar (hidden by default on smaller screens) */}
      {showSessions && (
        <div style={{ width: 220, borderRight: '1px solid var(--border)', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '10px 8px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sessions</span>
            <button onClick={newSession} className="btn btn-primary btn-sm" style={{ padding: '3px 7px', fontSize: 10 }}>
              <Plus size={10} /> New
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
            {sessions.map(s => (
              <div key={s.id} onClick={() => setActiveId(s.id)}
                style={{ padding: '8px 12px', cursor: 'pointer', background: s.id === activeId ? 'rgba(124,58,237,0.12)' : 'none', borderLeft: s.id === activeId ? '2px solid var(--accent-light)' : '2px solid transparent', display: 'flex', alignItems: 'center', gap: 6, group: 'true' }}>
                <MessageSquare size={12} color={s.id === activeId ? 'var(--accent-light)' : 'var(--text-subtle)'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: s.id === activeId ? 'var(--text)' : 'var(--text-muted)', fontWeight: s.id === activeId ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{s.messages.length} msgs</div>
                </div>
                <button onClick={e => { e.stopPropagation(); deleteSession(s.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-subtle)', opacity: 0 }} className="session-delete">
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main chat pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0 0 0 0' }}>
        {/* Top toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px 8px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <button onClick={() => setShowSessions(p => !p)} className="btn btn-ghost btn-sm" title="Session history">
            <History size={13} />
          </button>
          <button onClick={newSession} className="btn btn-ghost btn-sm" title="New session">
            <Plus size={13} /> New
          </button>
          <button onClick={resetSession} className="btn btn-ghost btn-sm" title="Reset session">
            <RotateCcw size={13} /> Reset
          </button>
          <div style={{ flex: 1 }} />
          {/* Focus mode */}
          <select value={focus} onChange={e => setFocus(e.target.value)}
            style={{ width: 'auto', fontSize: 11, padding: '4px 8px', maxWidth: 120 }}>
            {FOCUS_MODES.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
          {/* Model */}
          <select value={model} onChange={e => setModel(e.target.value)}
            style={{ width: 'auto', fontSize: 11, padding: '4px 8px', maxWidth: 160 }}>
            {MODELS.map(m => <option key={m}>{m}</option>)}
          </select>
          {msgs.length > 0 && (
            <button onClick={downloadChat} className="btn btn-secondary btn-sm">
              <Download size={11} /> Export
            </button>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {msgs.length === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-subtle)', height: '100%' }}>
              <Sparkles size={28} style={{ opacity: 0.2 }} />
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>Agent Swarp Studio</div>
              <div style={{ fontSize: 12, textAlign: 'center', maxWidth: 320, lineHeight: 1.7 }}>
                Describe a goal. The agent runs a full loop:<br />
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--accent-light)' }}>Think → Research → Plan → Observe → Code → Test</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
                {['Search the web for X', 'Write a Python script', 'Analyse this CSV', 'Build a landing page'].map(s => (
                  <button key={s} onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {msgs.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', gap: 10, marginBottom: 16, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-elevated)', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>
                {msg.role === 'user' ? '◉' : <Bot size={11} />}
              </div>

              <div style={{ maxWidth: '78%' }}>
                {msg.file && (
                  <div style={{ fontSize: 10, color: 'var(--cyan)', background: 'var(--cyan-dim)', padding: '2px 8px', borderRadius: 4, marginBottom: 4, display: 'inline-block' }}>
                    📎 {msg.file}
                  </div>
                )}
                {/* Loop trace */}
                {msg.trace && msg.trace.length > 0 && msg.role === 'agent' && (
                  <div className="card" style={{ marginBottom: 6, padding: '8px 12px' }}>
                    <button onClick={() => setShowTrace(p => ({ ...p, [msg.id]: !p[msg.id] }))}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', width: '100%' }}>
                      <RefreshCw size={10} /> Agentic Loop
                      {(showTrace[msg.id] ?? true) ? <ChevronUp size={10} style={{ marginLeft: 'auto' }} /> : <ChevronDown size={10} style={{ marginLeft: 'auto' }} />}
                    </button>
                    {(showTrace[msg.id] ?? true) && (
                      <div style={{ marginTop: 8 }}>
                        {msg.trace.map((s, si) => (
                          <div key={si} className="trace-step">
                            <div className="trace-icon" style={{ background: s.status === 'done' ? 'var(--green-dim)' : s.status === 'error' ? 'var(--red-dim)' : 'var(--accent-glow)', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {s.status === 'running' ? <Loader2 size={9} className="animate-spin" /> : s.status === 'done' ? <Check size={9} color="var(--green)" /> : <X size={9} color="var(--red)" />}
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 600 }}>{s.icon} {s.phase}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{s.detail}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Bubble */}
                {msg.content && (
                  <div className={`chat-bubble ${msg.role === 'user' ? 'user' : ''}`} style={{ whiteSpace: 'pre-line', fontSize: 13 }}>
                    {msg.content}
                  </div>
                )}

                {/* Actions */}
                {msg.role === 'agent' && msg.content && (
                  <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSessions(p => p.map(s => s.id === activeId ? { ...s, messages: s.messages.map(m => m.id === msg.id ? { ...m, liked: true } : m) } : s))}
                      style={{ padding: '3px 5px', color: msg.liked === true ? 'var(--green)' : 'var(--text-subtle)' }}>
                      <ThumbsUp size={10} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSessions(p => p.map(s => s.id === activeId ? { ...s, messages: s.messages.map(m => m.id === msg.id ? { ...m, liked: false } : m) } : s))}
                      style={{ padding: '3px 5px', color: msg.liked === false ? 'var(--red)' : 'var(--text-subtle)' }}>
                      <ThumbsDown size={10} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => copyMsg(msg.content)} style={{ padding: '3px 5px' }}><Copy size={10} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => regenerate(msg)} disabled={running} style={{ padding: '3px 5px' }}><RefreshCw size={10} /></button>
                  </div>
                )}
                {msg.role === 'user' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 3 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setInput(msg.content); inputRef.current?.focus(); }}
                      style={{ padding: '2px 5px', fontSize: 10, color: 'var(--text-subtle)' }}>
                      <Pencil size={9} /> Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
          {file && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--cyan)', background: 'var(--cyan-dim)', padding: '2px 8px', borderRadius: 4 }}>📎 {file}</span>
              <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}><X size={10} /></button>
            </div>
          )}
          <form onSubmit={submit} style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
            <input ref={fileRef as React.RefObject<HTMLInputElement>} type="file" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f.name); }} />
            <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-ghost btn-sm" style={{ padding: '8px 9px', flexShrink: 0 }} title="Attach file">
              <Paperclip size={13} />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(e as unknown as React.FormEvent); } }}
              disabled={running}
              placeholder={running ? 'Agent is running…' : 'Describe a goal, ask anything, or attach a file… (↵ to send)'}
              rows={2}
              style={{ flex: 1, resize: 'none', padding: '8px 12px', fontFamily: 'inherit' }}
            />
            <button type="submit" disabled={running || !input.trim()} className="btn btn-primary" style={{ padding: '8px 14px', flexShrink: 0 }}>
              {running ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
