'use client';
import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';

const THEMES = [
  { id: 'dark',    name: 'Dark',       bg: '#09090b', accent: '#7c3aed', preview: ['#09090b','#111113','#7c3aed'] },
  { id: 'oled',    name: 'OLED Black', bg: '#000000', accent: '#a78bfa', preview: ['#000000','#0a0a0a','#a78bfa'] },
  { id: 'purple',  name: 'Deep Space', bg: '#0d0618', accent: '#a855f7', preview: ['#0d0618','#160926','#a855f7'] },
  { id: 'ocean',   name: 'Ocean',      bg: '#041018', accent: '#06b6d4', preview: ['#041018','#071e2d','#06b6d4'] },
  { id: 'neon',    name: 'Neon City',  bg: '#070710', accent: '#f0abfc', preview: ['#070710','#100a1e','#f0abfc'] },
  { id: 'forest',  name: 'Forest',     bg: '#060e0c', accent: '#22c55e', preview: ['#060e0c','#0b1a15','#22c55e'] },
  { id: 'ember',   name: 'Ember',      bg: '#0f0700', accent: '#f97316', preview: ['#0f0700','#1c0d00','#f97316'] },
  { id: 'light',   name: 'Light',      bg: '#f9f9fb', accent: '#6d28d9', preview: ['#f9f9fb','#ffffff','#6d28d9'] },
];

const FONTS = ['Inter', 'JetBrains Mono', 'Geist', 'SF Pro', 'Outfit', 'Plus Jakarta Sans'];
const DENSITIES = ['Compact', 'Default', 'Comfortable'];
const RADII = ['Sharp (0px)', 'Subtle (4px)', 'Rounded (8px)', 'Pill (16px)'];

export default function ThemesPage() {
  const [theme, setTheme] = useState('dark');
  const [font, setFont] = useState('Inter');
  const [density, setDensity] = useState('Default');
  const [radius, setRadius] = useState('Rounded (8px)');
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
          <Palette size={18} style={{ display: 'inline', marginRight: 8 }} />Themes
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Customise the look and feel of AgentSwarp.</p>
      </div>

      {/* Color themes */}
      <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)', marginBottom: 10 }}>Color Theme</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 26 }}>
        {THEMES.map(t => (
          <button key={t.id} onClick={() => setTheme(t.id)}
            style={{ cursor: 'pointer', border: `2px solid ${theme === t.id ? 'var(--accent-light)' : 'var(--border)'}`, borderRadius: 10, overflow: 'hidden', background: 'none', padding: 0, position: 'relative' }}>
            {/* Preview swatch */}
            <div style={{ display: 'flex', flexDirection: 'column', height: 60 }}>
              <div style={{ flex: 1, background: t.preview[0] }} />
              <div style={{ height: 16, background: t.preview[1], display: 'flex', alignItems: 'center', paddingLeft: 6, gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.preview[2] }} />
                <div style={{ width: 24, height: 3, borderRadius: 2, background: t.preview[2], opacity: 0.4 }} />
              </div>
            </div>
            <div style={{ padding: '6px 8px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.name}</span>
              {theme === t.id && <Check size={11} color="var(--accent-light)" />}
            </div>
          </button>
        ))}
      </div>

      {/* Font */}
      <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)', marginBottom: 10 }}>Font</h2>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        {FONTS.map(f => (
          <button key={f} className={`tool-pill ${font === f ? 'active' : ''}`} onClick={() => setFont(f)}
            style={{ fontFamily: f }}>{f}</button>
        ))}
      </div>

      {/* Density */}
      <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)', marginBottom: 10 }}>Density</h2>
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {DENSITIES.map(d => (
          <button key={d} className={`tool-pill ${density === d ? 'active' : ''}`} onClick={() => setDensity(d)}>{d}</button>
        ))}
      </div>

      {/* Border radius */}
      <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)', marginBottom: 10 }}>Border Radius</h2>
      <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
        {RADII.map(r => (
          <button key={r} className={`tool-pill ${radius === r ? 'active' : ''}`} onClick={() => setRadius(r)}>{r}</button>
        ))}
      </div>

      {/* Preview card */}
      <div className="card" style={{ marginBottom: 20, padding: '16px', border: '1px dashed var(--border-strong)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 10 }}>Preview</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,var(--accent),var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14 }}>⚡</span>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, fontFamily: font }}>AgentSwarp</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Autonomous Studio</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button className="btn btn-primary btn-sm">Deploy</button>
            <button className="btn btn-secondary btn-sm">Cancel</button>
          </div>
        </div>
      </div>

      <button onClick={save} className="btn btn-primary">
        {saved ? '✓ Theme applied!' : 'Apply Theme'}
      </button>
    </div>
  );
}
