'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot, Send, Loader2, Check, X, RefreshCw, ChevronDown, ChevronUp,
  ThumbsUp, ThumbsDown, Copy, Download, Paperclip, Pencil, Zap, Brain,
  Cpu, Sparkles
} from 'lucide-react';

interface TraceStep { phase: string; icon: string; detail: string; status: 'done' | 'running' | 'error'; }
interface Message {
  id: string; role: 'user' | 'agent'; content: string;
  trace?: TraceStep[]; liked?: boolean | null; file?: string;
}

const PHASE_ICONS: Record<string, string> = {
  Think: '💭', Research: '🔍', Plan: '📋', Observe: '👁', Code: '💻', Test: '🧪', Retry: '🔄',
};

const PERSONAS = [
  { key: 'default', label: '⚡ GravityClaw' },
  { key: 'elon',    label: '🚀 Elon Mode' },
  { key: 'srk',     label: '🎬 SRK Mode' },
  { key: 'rayn',    label: '⚡ Rayn Mode' },
];

const MODELS = [
  'GPT-4o', 'Claude 3.5 Sonnet', 'Gemini 2.0 Flash', 'Groq Llama3',
  'DeepSeek-V3', 'Mistral Large', 'Ollama (Local)',
];

async function* runLoop(goal: string): AsyncGenerator<TraceStep> {
  for (const phase of ['Think', 'Research', 'Plan', 'Observe', 'Code', 'Test']) {
    yield { phase, icon: PHASE_ICONS[phase], detail: `Running ${phase}: "${goal.slice(0, 40)}…"`, status: 'running' };
    await new Promise(r => setTimeout(r, 600));
    yield { phase, icon: PHASE_ICONS[phase], detail: `${phase} complete.`, status: 'done' };
  }
}

export default function StudioPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [persona, setPersona] = useState(PERSONAS[0].key);
  const [model, setModel] = useState(MODELS[0]);
  const [running, setRunning] = useState(false);
  const [showTrace, setShowTrace] = useState<Record<string, boolean>>({});
  const [file, setFile] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const runAgent = useCallback(async (goal: string, fileAttachment?: string) => {
    setRunning(true);
    setFile(null);

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: goal, file: fileAttachment };
    const agentId = (Date.now() + 1).toString();
    const agentMsg: Message = { id: agentId, role: 'agent', content: '', trace: [] };

    setMessages(prev => [...prev, userMsg, agentMsg]);

    const steps: TraceStep[] = [];
    for await (const step of runLoop(goal)) {
      steps.push(step);
      setMessages(prev => prev.map(m => m.id === agentId ? { ...m, trace: [...steps] } : m));
    }

    const persona_label = PERSONAS.find(p => p.key === persona)?.label ?? 'Agent';
    setMessages(prev => prev.map(m => m.id === agentId ? {
      ...m,
      content: `[${persona_label} · ${model}] Task complete. All ${steps.filter(s => s.status === 'done').length} phases passed.\n\nBased on your goal: **"${goal}"** — I've completed the agentic loop. You can regenerate for a different approach or like/dislike to personalise future responses.`,
      trace: steps
    } : m));

    setRunning(false);
  }, [persona, model]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const goal = (editing ? input : input).trim();
    if (!goal || running) return;
    const attachedFile = file ?? undefined;
    setInput('');
    setEditing(null);
    if (editing) {
      setMessages(prev => prev.filter(m => m.id !== editing && !m.trace));
    }
    await runAgent(goal, attachedFile);
  };

  const regenerate = async (msg: Message) => {
    const prev = messages.findIndex(m => m.id === msg.id);
    const userMsg = [...messages].slice(0, prev).reverse().find(m => m.role === 'user');
    if (!userMsg || running) return;
    setMessages(p => p.filter(m => m.id !== msg.id));
    await runAgent(userMsg.content);
  };

  const copyMsg = (content: string) => navigator.clipboard.writeText(content);

  const downloadChat = () => {
    const md = messages.map(m =>
      m.role === 'user' ? `**You:** ${m.content}` : `**Agent:** ${m.content}`
    ).join('\n\n---\n\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `agentswarp-chat-${Date.now()}.md`; a.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f.name);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 104px)' }}>
      {/* Top strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Bot size={14} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>Studio</div>
          <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>Think → Research → Plan → Observe → Code → Test → Retry</div>
        </div>
        <select value={model} onChange={e => setModel(e.target.value)}
          style={{ width: 'auto', fontSize: 11, padding: '4px 8px' }}>
          {MODELS.map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={persona} onChange={e => setPersona(e.target.value)}
          style={{ width: 'auto', fontSize: 11, padding: '4px 8px' }}>
          {PERSONAS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
        {messages.length > 0 && (
          <button onClick={downloadChat} className="btn btn-secondary btn-sm">
            <Download size={11} /> Export
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        {messages.length === 0 && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)', gap: 8 }}>
            <Sparkles size={28} style={{ opacity: 0.25 }} />
            <div style={{ fontSize: 13, fontWeight: 500 }}>Describe a goal for the agent</div>
            <div style={{ fontSize: 11 }}>Attach files with 📎. Watch the agentic loop trace.</div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={msg.id} style={{ display: 'flex', gap: 10, marginBottom: 14, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-elevated)', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>
              {msg.role === 'user' ? 'U' : <Bot size={12} />}
            </div>

            <div style={{ maxWidth: '76%' }}>
              {/* File attachment tag */}
              {msg.file && (
                <div style={{ fontSize: 10, color: 'var(--cyan)', background: 'var(--cyan-dim)', padding: '2px 8px', borderRadius: 4, marginBottom: 4, display: 'inline-block' }}>
                  📎 {msg.file}
                </div>
              )}

              {/* Agent trace */}
              {msg.trace && msg.trace.length > 0 && msg.role === 'agent' && (
                <div className="card" style={{ marginBottom: 6, padding: '8px 12px' }}>
                  <button onClick={() => setShowTrace(p => ({ ...p, [msg.id]: !p[msg.id] }))}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', width: '100%' }}>
                    <RefreshCw size={10} /> Loop Trace
                    {(showTrace[msg.id] ?? true) ? <ChevronUp size={10} style={{ marginLeft: 'auto' }} /> : <ChevronDown size={10} style={{ marginLeft: 'auto' }} />}
                  </button>
                  {(showTrace[msg.id] ?? true) && (
                    <div style={{ marginTop: 8 }}>
                      {msg.trace.map((s, si) => (
                        <div key={si} className="trace-step">
                          <div className="trace-icon" style={{ background: s.status === 'done' ? 'var(--green-dim)' : s.status === 'error' ? 'var(--red-dim)' : 'var(--accent-glow)' }}>
                            {s.status === 'running' ? <Loader2 size={9} /> : s.status === 'done' ? <Check size={9} color="var(--green)" /> : <X size={9} color="var(--red)" />}
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
                <div style={{ display: 'flex', gap: 4, marginTop: 5, alignItems: 'center' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setMessages(p => p.map(m => m.id === msg.id ? { ...m, liked: true } : m))}
                    style={{ padding: '3px 6px', color: msg.liked === true ? 'var(--green)' : 'var(--text-subtle)' }}>
                    <ThumbsUp size={11} />
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setMessages(p => p.map(m => m.id === msg.id ? { ...m, liked: false } : m))}
                    style={{ padding: '3px 6px', color: msg.liked === false ? 'var(--red)' : 'var(--text-subtle)' }}>
                    <ThumbsDown size={11} />
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => copyMsg(msg.content)} title="Copy" style={{ padding: '3px 6px' }}>
                    <Copy size={11} />
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => regenerate(msg)} title="Regenerate" style={{ padding: '3px 6px' }} disabled={running}>
                    <RefreshCw size={11} />
                  </button>
                </div>
              )}
              {msg.role === 'user' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setInput(msg.content); setEditing(msg.id); inputRef.current?.focus(); }}
                    style={{ padding: '3px 6px', fontSize: 10, color: 'var(--text-subtle)' }}>
                    <Pencil size={10} /> Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        {file && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--cyan)', background: 'var(--cyan-dim)', padding: '2px 8px', borderRadius: 4 }}>📎 {file}</span>
            <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}><X size={11} /></button>
          </div>
        )}
        {editing && (
          <div style={{ fontSize: 11, color: 'var(--amber)', marginBottom: 6 }}>✏️ Editing prompt — press Enter to resubmit</div>
        )}
        <form onSubmit={submit} style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          <input ref={fileRef as React.RefObject<HTMLInputElement>} type="file" style={{ display: 'none' }} onChange={onFileChange} />
          <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-ghost btn-sm" style={{ padding: '8px 9px', flexShrink: 0 }}>
            <Paperclip size={14} />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(e as unknown as React.FormEvent); } }}
            disabled={running}
            placeholder={running ? 'Agent is running the loop…' : 'Describe a goal, ask anything, or attach a file… (Enter to send)'}
            rows={2}
            style={{ flex: 1, resize: 'none', padding: '8px 12px' }}
          />
          <button type="submit" disabled={running || !input.trim()} className="btn btn-primary" style={{ padding: '8px 14px', flexShrink: 0 }}>
            {running ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </form>
      </div>
    </div>
  );
}
