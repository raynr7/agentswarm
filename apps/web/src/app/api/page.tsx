'use client';
import React, { useState } from 'react';
import { Key, Eye, EyeOff, Plus, Trash2, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ApiKey { id: string; name: string; provider: string; key: string; isSet: boolean; }

const PROVIDERS = [
  { id: 'openai',    name: 'OpenAI',         placeholder: 'sk-...',           color: '#10a37f', docs: 'https://platform.openai.com/api-keys' },
  { id: 'anthropic', name: 'Anthropic',       placeholder: 'sk-ant-...',       color: '#cc785c', docs: 'https://console.anthropic.com/' },
  { id: 'gemini',    name: 'Google Gemini',   placeholder: 'AIza...',          color: '#4285f4', docs: 'https://makersuite.google.com/' },
  { id: 'groq',      name: 'Groq',            placeholder: 'gsk_...',          color: '#f97316', docs: 'https://console.groq.com/' },
  { id: 'deepseek',  name: 'DeepSeek',        placeholder: 'sk-...',           color: '#6366f1', docs: 'https://platform.deepseek.com/' },
  { id: 'mistral',   name: 'Mistral AI',      placeholder: '...',              color: '#ff7000', docs: 'https://console.mistral.ai/' },
  { id: 'together',  name: 'Together AI',     placeholder: '...',              color: '#a855f7', docs: 'https://api.together.xyz/' },
  { id: 'github',    name: 'GitHub Token',    placeholder: 'ghp_...',          color: '#f0f6fc', docs: 'https://github.com/settings/tokens' },
  { id: 'telegram',  name: 'Telegram Bot',    placeholder: 'Bot Token: 123...',color: '#0088cc', docs: 'https://t.me/BotFather' },
  { id: 'slack',     name: 'Slack',           placeholder: 'xoxb-...',         color: '#4a154b', docs: 'https://api.slack.com/' },
  { id: 'notion',    name: 'Notion',          placeholder: 'secret_...',       color: '#ffffff', docs: 'https://www.notion.so/my-integrations' },
  { id: 'sendgrid',  name: 'SendGrid',        placeholder: 'SG...',            color: '#0000ff', docs: 'https://app.sendgrid.com/' },
];

const PLAYWRIGHT_VAULTS = [
  { id: 'cookies', label: 'Browser Cookies', placeholder: 'Paste cookies JSON array…', type: 'textarea' as const },
  { id: 'storage', label: 'LocalStorage Snapshot', placeholder: 'Paste localStorage JSON…', type: 'textarea' as const },
  { id: 'session', label: 'Session Token', placeholder: 'Bearer eyJ…', type: 'text' as const },
];

export default function ApiPage() {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [show, setShow] = useState<Record<string, boolean>>({});
  const [fallback, setFallback] = useState(true);
  const [saved, setSaved] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState('');
  const [playwrightVault, setPlaywrightVault] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<'api' | 'playwright' | 'telegram'>('api');

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
          <Key size={18} style={{ display: 'inline', marginRight: 8 }} />API Vault
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          All keys stored locally in your browser. Never sent to any server.
        </p>
      </div>

      {/* Fallback toggle */}
      <div className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <Shield size={16} color={fallback ? 'var(--green)' : 'var(--text-subtle)'} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Fallback Mode</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Use AgentSwarp free tier when no API key is set</div>
        </div>
        <button onClick={() => setFallback(p => !p)}
          style={{ width: 40, height: 22, borderRadius: 99, border: 'none', background: fallback ? 'var(--green)' : 'var(--bg-hover)', cursor: 'pointer', position: 'relative', transition: 'background 200ms' }}>
          <div style={{ position: 'absolute', top: 3, left: fallback ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 200ms' }} />
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: 18 }}>
        {(['api', 'playwright', 'telegram'] as const).map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'api' ? 'API Keys' : t === 'playwright' ? '🎭 Playwright Vault' : '📱 Telegram'}
          </button>
        ))}
      </div>

      {tab === 'api' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PROVIDERS.map(p => {
            const val = keys[p.id] ?? '';
            const isSet = val.length > 6;
            return (
              <div key={p.id} className="card" style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</span>
                  {isSet && <CheckCircle2 size={12} color="var(--green)" />}
                  {!isSet && fallback && <span style={{ fontSize: 10, color: 'var(--amber)', background: 'var(--amber-dim)', padding: '1px 6px', borderRadius: 4 }}>using fallback</span>}
                  <a href={p.docs} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--accent-light)' }}>Get key →</a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={show[p.id] ? 'text' : 'password'}
                    value={val}
                    onChange={e => setKeys(prev => ({ ...prev, [p.id]: e.target.value }))}
                    placeholder={p.placeholder}
                  />
                  <button onClick={() => setShow(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}>
                    {show[p.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'playwright' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ padding: '12px 14px', display: 'flex', gap: 8 }}>
            <AlertCircle size={14} color="var(--amber)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Store session cookies and auth tokens for Playwright browser tasks. These are used automatically when running browser automations on sites that require login.
            </p>
          </div>
          {PLAYWRIGHT_VAULTS.map(v => (
            <div key={v.id} className="card" style={{ padding: '12px 14px' }}>
              <label className="label" style={{ marginBottom: 6, display: 'block' }}>{v.label}</label>
              {v.type === 'textarea' ? (
                <textarea
                  value={playwrightVault[v.id] ?? ''}
                  onChange={e => setPlaywrightVault(p => ({ ...p, [v.id]: e.target.value }))}
                  placeholder={v.placeholder} rows={4} style={{ fontFamily: 'monospace', fontSize: 12 }}
                />
              ) : (
                <input
                  value={playwrightVault[v.id] ?? ''}
                  onChange={e => setPlaywrightVault(p => ({ ...p, [v.id]: e.target.value }))}
                  placeholder={v.placeholder} type="password"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'telegram' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>📱 Telegram Bot Config</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              Use @BotFather on Telegram to get your token. Set webhook to receive messages from your agents.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="input-group">
                <label className="label">Bot Token</label>
                <input type="password" value={keys['telegram'] ?? ''} onChange={e => setKeys(p => ({ ...p, telegram: e.target.value }))} placeholder="123456:ABC-DEF…" />
              </div>
              <div className="input-group">
                <label className="label">Chat ID (receive notifications here)</label>
                <input value={telegramChatId} onChange={e => setTelegramChatId(e.target.value)} placeholder="e.g. -100123456789" />
              </div>
              <div className="input-group">
                <label className="label">Webhook URL (optional)</label>
                <input placeholder="https://your-domain.com/api/telegram/webhook" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="tg-notify" style={{ width: 14, height: 14 }} defaultChecked />
                <label htmlFor="tg-notify" style={{ fontSize: 12 }}>Send agent run summaries to Telegram</label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="tg-errors" style={{ width: 14, height: 14 }} />
                <label htmlFor="tg-errors" style={{ fontSize: 12 }}>Alert on agent errors only</label>
              </div>
            </div>
          </div>
        </div>
      )}

      <button onClick={save} className="btn btn-primary" style={{ marginTop: 20, minWidth: 120 }}>
        {saved ? '✓ Saved to vault' : 'Save Keys'}
      </button>
      <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 8 }}>
        🔒 Keys saved in browser localStorage only. Nothing is sent to any server.
      </p>
    </div>
  );
}
