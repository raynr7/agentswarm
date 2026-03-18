'use client';
import React, { useState } from 'react';
import { BookOpen, ChevronRight, ChevronDown, ExternalLink } from 'lucide-react';

const DOCS: { section: string; articles: { title: string; content: string }[] }[] = [
  {
    section: 'Getting Started',
    articles: [
      { title: 'What is AgentSwarp?', content: `AgentSwarp is an autonomous AI studio. You describe a goal, and the engine runs a multi-phase loop:\n\n**Think → Research → Plan → Observe → Code → Test → Retry**\n\nAgents run continuously in the background, use 3-tier memory (short/long/vector), and can call 100+ tools — from web scraping to browser automation to sending Telegram messages.` },
      { title: 'Login & API keys', content: `Login is **optional** — AgentSwarp works out of the box with the free fallback tier.\n\nFor full power, go to **API Vault** and add your:\n- OpenAI / Anthropic / Gemini key (any one is enough)\n- Telegram Bot Token (for notifications)\n- GitHub token (for code agents)\n\nAll keys are stored in your browser localStorage. Nothing is ever sent to a server.` },
      { title: 'Modes', content: `AgentSwarp has 3 modes (switch in the sidebar):\n\n**✦ Agent Mode** — Chat with agents, run autonomous loops, manage memory.\n\n**🌐 Website Builder** — Describe a website and get a fully generated, live-preview site.\n\n**< / > Code Mode** — Focused coding assistant with code search, diff, and test generation.` },
    ],
  },
  {
    section: 'Studio',
    articles: [
      { title: 'Agentic Loop', content: `The Studio runs your goal through a structured loop:\n\n1. **Think** — Parse goal intent\n2. **Research** — Gather context (web, memory, tools)\n3. **Plan** — Break into subtasks\n4. **Observe** — Verify environment state\n5. **Code** — Write or execute actions\n6. **Test** — Validate output\n7. **Retry** — If test fails, loop back automatically\n\nYou can watch each phase in the trace panel below every response.` },
      { title: 'File Uploads', content: `Click the 📎 button in the chat input to attach:\n- PDFs, DOCXs, TXTs for document Q&A\n- Images for vision tasks\n- CSVs for data analysis\n- Code files for review / refactor\n\nFiles are processed locally and injected into the agent context.` },
      { title: 'Chat Actions', content: `On any agent response you can:\n- **👍/👎** Like or dislike to train personalization\n- **🔄 Regenerate** — Get a new response for the same prompt\n- **✏️ Edit** — Modify your user prompt and re-run\n- **📋 Copy** — Copy text to clipboard\n- **⬇️ Download** — Export the full chat as .md or .json` },
    ],
  },
  {
    section: 'Tools & Browser',
    articles: [
      { title: '100+ Tools', content: `AgentSwarp ships with 100+ tools across:\n- **Web**: Search, scrape, screenshot, HTTP\n- **Browser**: Playwright automation (navigate, click, type, screenshot)\n- **AI**: LLM chat, embeddings, OCR, image gen, STT/TTS\n- **File**: Read, write, CSV, PDF, DOCX\n- **Comm**: Email, Telegram, Slack, Discord\n- **API**: GitHub, Stripe, Notion, Airtable, Jira\n- **Infra**: Docker, Cron, Webhook, Env manager` },
      { title: 'Playwright Browser Automation', content: `The **Browser** page lets you:\n1. Enter a target URL\n2. Describe your goal in plain English\n3. Watch Playwright execute the task with a live log\n\nFor sites that need login, store your session cookies in **API Vault → Playwright Vault**.` },
    ],
  },
  {
    section: 'Website Builder',
    articles: [
      { title: 'Generating Websites', content: `In **Website Builder mode**, describe any website:\n\n_"A 2026-style saas landing page for an AI tool with pricing, testimonials, and a dark glassmorphic hero"_\n\nAgentSwarp generates complete HTML/CSS/JS, shows a live preview, and lets you download the ZIP or deploy to Vercel instantly.` },
    ],
  },
  {
    section: 'MCP & Integrations',
    articles: [
      { title: 'Model Context Protocol (MCP)', content: `AgentSwarp includes a built-in MCP server at port 8001.\n\nConnect it to Claude Desktop, Cursor, or any MCP client:\n\`\`\`json\n{\n  "mcpServers": {\n    "agentswarp": {\n      "command": "python",\n      "args": ["-m", "apps.api.mcp_server"]\n    }\n  }\n}\`\`\`` },
      { title: 'Telegram Notifications', content: `Go to **API Vault → Telegram** to configure your bot token and chat ID.\n\nAgentSwarp will send:\n- Summary after every agent run\n- Error alerts (optional)\n- Scheduled digest reports\n\nCreate a bot at @BotFather on Telegram, then paste the token into the API Vault.` },
    ],
  },
];

export default function DocsPage() {
  const [open, setOpen] = useState<string>('What is AgentSwarp?');

  return (
    <div style={{ maxWidth: 760, display: 'flex', gap: 24 }}>
      {/* Left TOC */}
      <div style={{ width: 200, flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Documentation</div>
        {DOCS.map(s => (
          <div key={s.section} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 8px' }}>{s.section}</div>
            {s.articles.map(a => (
              <button key={a.title} onClick={() => setOpen(a.title)}
                style={{ width: '100%', textAlign: 'left', background: open === a.title ? 'rgba(124,58,237,0.12)' : 'none', border: 'none', borderRadius: 6, padding: '5px 8px', fontSize: 12, color: open === a.title ? 'var(--accent-light)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
                <ChevronRight size={10} /> {a.title}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Right content */}
      <div style={{ flex: 1 }}>
        {DOCS.flatMap(s => s.articles).filter(a => a.title === open).map(a => (
          <div key={a.title} className="fade-up">
            <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>{a.title}</h1>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.9, whiteSpace: 'pre-line' }}>
              {a.content.split('\n').map((line, i) => {
                const bold = line.replace(/\*\*(.+?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
                const code = bold.replace(/`(.+?)`/g, (_, m) => `<code style="background:var(--bg-elevated);padding:1px 5px;border-radius:3px;font-family:monospace;font-size:11px">${m}</code>`);
                return <div key={i} dangerouslySetInnerHTML={{ __html: code || '&nbsp;' }} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
