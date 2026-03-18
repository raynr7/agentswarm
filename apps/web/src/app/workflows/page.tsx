'use client';
import React, { useState } from 'react';
import { Workflow, Plus, Play, Pause, Trash2, ChevronRight, Zap } from 'lucide-react';

const DEMO_WORKFLOWS = [
  { id:'wf1', name:'Daily Research Digest', steps:['Web Search', 'Summarize', 'Send Email'], status:'active',  runs:14 },
  { id:'wf2', name:'GitHub PR Monitor',     steps:['GitHub PR', 'LLM Chat', 'Send Slack'],   status:'paused',  runs:7  },
  { id:'wf3', name:'Competitor Tracker',    steps:['Scrape URL', 'Summarize', 'Airtable Write'], status:'active', runs:3 },
];

export default function WorkflowsPage() {
  const [flows, setFlows] = useState(DEMO_WORKFLOWS);
  const toggle = (id: string) =>
    setFlows(p => p.map(f => f.id === id ? { ...f, status: f.status==='active'?'paused':'active' } : f));

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
            <Workflow size={18} style={{ display:'inline', marginRight: 8 }} />Workflows
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize: 13 }}>Chain tools and agents into automated pipelines.</p>
        </div>
        <button className="btn btn-primary"><Plus size={13} /> New Workflow</button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
        {flows.map(wf => (
          <div key={wf.id} className="card" style={{ padding:'14px 16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap: 8, fontWeight:500, marginBottom: 6 }}>
                  {wf.name}
                  <span className={`badge ${wf.status==='active'?'badge-green':'badge-gray'}`}>
                    <span className={`dot ${wf.status==='active'?'dot-green':'dot-gray'}`} />
                    {wf.status}
                  </span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap: 4, flexWrap:'wrap' }}>
                  {wf.steps.map((s, i) => (
                    <React.Fragment key={s}>
                      <span style={{ fontSize:11, background:'var(--bg-elevated)', border:'1px solid var(--border-strong)', borderRadius:4, padding:'2px 8px', color:'var(--text-muted)' }}>{s}</span>
                      {i < wf.steps.length-1 && <ChevronRight size={10} color="var(--text-subtle)" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div style={{ fontSize:11, color:'var(--text-subtle)', marginRight: 12 }}>{wf.runs} runs</div>
              <div style={{ display:'flex', gap: 6 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => toggle(wf.id)}>
                  {wf.status==='active' ? <Pause size={12} /> : <Play size={12} />}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setFlows(p=>p.filter(f=>f.id!==wf.id))}>
                  <Trash2 size={12} color="var(--red)" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:'32px 20px', textAlign:'center', marginTop: 16, color:'var(--text-subtle)' }}>
        <Zap size={24} style={{ margin:'0 auto 10px', display:'block', opacity:0.3 }} />
        <div style={{ fontSize:13, marginBottom: 8 }}>Create a new workflow</div>
        <button className="btn btn-primary btn-sm"><Plus size={12} /> Build Workflow</button>
      </div>
    </div>
  );
}
