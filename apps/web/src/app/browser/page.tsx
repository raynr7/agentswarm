'use client';
import React, { useState } from 'react';
import { Globe, Send, Loader2, Camera, Terminal, StopCircle } from 'lucide-react';

export default function BrowserPage() {
  const [url, setUrl]       = useState('');
  const [goal, setGoal]     = useState('');
  const [running, setRunning] = useState(false);
  const [log, setLog]       = useState<string[]>([]);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const appendLog = (msg: string) => setLog(prev => [...prev, msg]);

  const runPlaywright = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !goal) return;
    setRunning(true);
    setLog([]);
    setScreenshot(null);

    appendLog(`▶ Starting Playwright session`);
    appendLog(`  → Target: ${url}`);
    appendLog(`  → Goal: ${goal}`);

    try {
      const res = await fetch('http://localhost:8000/browser/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('agentswarp-token') ?? ''}` },
        body: JSON.stringify({ url, goal }),
      });
      if (res.ok) {
        const data = await res.json();
        (data.steps ?? []).forEach((s: string) => appendLog(s));
        if (data.screenshot) setScreenshot(data.screenshot);
        appendLog(`✅ Task completed successfully.`);
      } else {
        // Demo mode: simulate steps
        await simulateSteps(url, goal);
      }
    } catch {
      await simulateSteps(url, goal);
    }
    setRunning(false);
  };

  const simulateSteps = async (url: string, goal: string) => {
    const steps = [
      `  [Browser] Launching Chromium headless…`,
      `  [Browser] Navigating to ${url}…`,
      `  [Browser] Page loaded (DOM ready)`,
      `  [Agent]   Observing page structure…`,
      `  [Agent]   Goal: "${goal}"`,
      `  [Agent]   Planning interaction steps…`,
      `  [Browser] Executing Step 1: Locate target element`,
      `  [Browser] Executing Step 2: Interact / Extract`,
      `  [Browser] Taking screenshot…`,
      `  [Agent]   Verifying result…`,
      `  ✅ Done — task completed in demo mode (connect FastAPI for live runs)`,
    ];
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 400));
      appendLog(step);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
      {/* Left: controls */}
      <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
            <Globe size={16} style={{ display: 'inline', marginRight: 6 }} />
            Browser Automation
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Powered by Playwright headless Chromium.</p>
        </div>

        <form onSubmit={runPlaywright} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="input-group">
            <label className="label">Target URL</label>
            <input value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com" required />
          </div>
          <div className="input-group">
            <label className="label">Agent Goal</label>
            <textarea value={goal} onChange={e => setGoal(e.target.value)}
              placeholder="e.g. Find all product prices and extract them…"
              rows={4} required />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={running} className="btn btn-primary" style={{ flex: 1 }}>
              {running ? <><Loader2 size={13} className="animate-spin" /> Running…</> : <><Send size={13} /> Run Task</>}
            </button>
            {running && (
              <button type="button" onClick={() => setRunning(false)} className="btn btn-secondary">
                <StopCircle size={13} />
              </button>
            )}
          </div>
        </form>

        {/* Quick examples */}
        <div>
          <div className="label" style={{ marginBottom: 6 }}>Quick examples</div>
          {[
            ['https://news.ycombinator.com', 'Get top 5 stories'],
            ['https://github.com/trending', 'List trending repos'],
            ['https://weather.com', 'Extract today\'s weather'],
          ].map(([u, g]) => (
            <button key={u} className="btn btn-ghost btn-sm"
              style={{ width:'100%', justifyContent:'flex-start', marginBottom: 4 }}
              onClick={() => { setUrl(u); setGoal(g); }}>
              » {g}
            </button>
          ))}
        </div>
      </div>

      {/* Right: log + screenshot */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
        {/* Log */}
        <div style={{ flex: 1, background: '#0d0d0f', border: '1px solid var(--border)', borderRadius: 8, overflow: 'auto', padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: 'var(--text-subtle)', fontSize: 11 }}>
            <Terminal size={11} /> LIVE OUTPUT
            {running && <span style={{ color: 'var(--green)' }}>● RUNNING</span>}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#d4d4d4', lineHeight: 1.8 }}>
            {log.length === 0 ? (
              <span style={{ color: 'var(--text-subtle)' }}>Waiting for a task to start…</span>
            ) : (
              log.map((line, i) => <div key={i}>{line}</div>)
            )}
          </div>
        </div>

        {/* Screenshot panel */}
        {screenshot && (
          <div className="card" style={{ padding: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 6 }}>
              <Camera size={11} style={{ display: 'inline', marginRight: 4 }} />Screenshot
            </div>
            <img src={`data:image/png;base64,${screenshot}`} alt="Browser screenshot"
              style={{ width: '100%', borderRadius: 6, border: '1px solid var(--border)' }} />
          </div>
        )}
      </div>
    </div>
  );
}
