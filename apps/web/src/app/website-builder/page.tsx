'use client';
import React, { useState } from 'react';
import { Monitor, Sparkles, Download, Loader2, ExternalLink, Cpu } from 'lucide-react';

const EXAMPLES = [
  'A stunning 2026 SaaS landing page for an AI tool with dark glassmorphic hero, pricing section, and testimonials',
  'A minimal portfolio for a developer with animated project cards, skills section, and dark mode',
  'A neon cyberpunk e-commerce site selling digital assets with glowing product cards',
  'A modern crypto dashboard with live price charts, gradient cards, and dark theme',
];

const PLACEHOLDER_HTML = (prompt: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>AgentSwarp Generated — ${prompt.slice(0,40)}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#09090b;color:#fff;font-family:'Inter',sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center}
    nav{width:100%;padding:18px 5%;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.08)}
    .logo{font-weight:700;font-size:18px;background:linear-gradient(90deg,#a78bfa,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .nav-links{display:flex;gap:24px;font-size:13px;color:#71717a}
    .hero{max-width:800px;text-align:center;padding:80px 20px 40px}
    .badge{background:rgba(124,58,237,0.15);color:#a78bfa;border:1px solid rgba(124,58,237,0.3);padding:4px 14px;border-radius:99px;font-size:12px;margin-bottom:24px;display:inline-block}
    h1{font-size:clamp(32px,5vw,60px);font-weight:700;line-height:1.1;margin-bottom:20px;background:linear-gradient(135deg,#fff 50%,#71717a);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .subtitle{font-size:16px;color:#71717a;line-height:1.7;max-width:600px;margin:0 auto 36px}
    .cta{display:flex;gap:12px;justify-content:center}
    .btn-p{background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;border:none;cursor:pointer}
    .btn-s{background:transparent;color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;border:1px solid rgba(255,255,255,0.1);cursor:pointer}
    .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:60px 5%;max-width:1100px;width:100%}
    .card{background:#111113;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:24px;transition:border-color .2s}
    .card:hover{border-color:rgba(124,58,237,0.4)}
    .icon{font-size:28px;margin-bottom:12px}
    h3{font-size:16px;font-weight:600;margin-bottom:8px}
    p{font-size:13px;color:#71717a;line-height:1.6}
  </style>
</head>
<body>
  <nav>
    <div class="logo">⚡ AgentSwarp</div>
    <div class="nav-links"><a style="color:inherit">Features</a><a style="color:inherit">Pricing</a><a style="color:inherit">Docs</a></div>
    <button class="btn-p" style="padding:8px 16px;font-size:13px">Get Started</button>
  </nav>
  <section class="hero">
    <div class="badge">✦ AI-Powered · Autonomous · 2026</div>
    <h1>Build autonomous agents<br/>without code</h1>
    <p class="subtitle">Designed from your prompt: "${prompt.slice(0,80)}…"</p>
    <div class="cta">
      <button class="btn-p">Start Building →</button>
      <button class="btn-s">View Demo</button>
    </div>
  </section>
  <div class="cards">
    ${['🧠 Memory','⚡ Speed','🌐 Browser','🔌 Integrations','🤖 Autonomy','🔒 Secure'].map(f=>`<div class="card"><div class="icon">${f.split(' ')[0]}</div><h3>${f.slice(2)}</h3><p>AI-generated feature block for your 2026-style site.</p></div>`).join('')}
  </div>
</body>
</html>`;

export default function WebsiteBuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setHtml(PLACEHOLDER_HTML(prompt));
    setLoading(false);
  };

  const download = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'agentswarp-site.html'; a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
          <Monitor size={16} style={{ display: 'inline', marginRight: 8 }} />Website Builder
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Describe any website → get production-ready HTML/CSS/JS in seconds.</p>
      </div>

      {/* Generator area */}
      <div style={{ display: 'flex', gap: 16, flex: 1, overflow: 'hidden' }}>
        {/* Left: prompt */}
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="Describe the website you want…  e.g. A dark glassmorphic SaaS landing page with pricing and testimonials"
            rows={6} style={{ fontFamily: 'inherit' }} />
          <button onClick={generate} disabled={loading || !prompt.trim()} className="btn btn-primary">
            {loading ? <><Loader2 size={13} className="animate-spin" /> Generating…</> : <><Sparkles size={13} /> Generate Site</>}
          </button>
          {html && (
            <button onClick={download} className="btn btn-secondary">
              <Download size={13} /> Download HTML
            </button>
          )}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <div className="label" style={{ marginBottom: 8 }}>Examples</div>
            {EXAMPLES.map(ex => (
              <button key={ex} onClick={() => setPrompt(ex)} className="btn btn-ghost btn-sm"
                style={{ width: '100%', textAlign: 'left', marginBottom: 4, display: 'block', whiteSpace: 'normal', lineHeight: 1.4, height: 'auto', padding: '6px 8px' }}>
                {ex.slice(0, 60)}…
              </button>
            ))}
          </div>
        </div>

        {/* Right: preview */}
        <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: '#09090b' }}>
          {html ? (
            <iframe srcDoc={html} style={{ width: '100%', height: '100%', border: 'none' }} title="Preview" />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--text-subtle)' }}>
              <Cpu size={32} style={{ opacity: 0.25 }} />
              <div style={{ fontSize: 13 }}>Your generated site preview will appear here</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
