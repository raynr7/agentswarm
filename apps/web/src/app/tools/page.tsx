'use client';
import React, { useState, useMemo } from 'react';
import { Search, ExternalLink, ChevronRight } from 'lucide-react';

interface Tool { name: string; desc: string; cat: string; badge?: string; }

const TOOLS: Tool[] = [
  // Web
  { name:'Web Search',      desc:'Search Google, Bing, DuckDuckGo in real-time',          cat:'Web',        badge:'Built-in'  },
  { name:'Scrape URL',      desc:'Extract clean text/HTML from any URL',                   cat:'Web'  },
  { name:'Screenshot URL',  desc:'Take a visual screenshot of any webpage',               cat:'Web'  },
  { name:'RSS Reader',      desc:'Fetch and parse RSS/Atom feeds',                         cat:'Web'  },
  { name:'HTTP Request',    desc:'Make arbitrary GET/POST/PUT/DELETE HTTP calls',          cat:'Web'  },
  { name:'Link Extractor',  desc:'Extract all hyperlinks from a document',                 cat:'Web'  },
  { name:'Wayback Machine', desc:'Retrieve historical snapshots from archive.org',        cat:'Web'  },
  { name:'Sitemap Parser',  desc:'Read sitemaps for structured page discovery',            cat:'Web'  },

  // Browser (Playwright)
  { name:'Browser Navigate',   desc:'Open a browser and go to a URL',                   cat:'Browser',  badge:'Playwright' },
  { name:'Browser Click',      desc:'Click on a page element by selector',              cat:'Browser',  badge:'Playwright' },
  { name:'Browser Type',       desc:'Type into an input field',                          cat:'Browser',  badge:'Playwright' },
  { name:'Browser Screenshot', desc:'Capture a full-page or element screenshot',        cat:'Browser',  badge:'Playwright' },
  { name:'Browser Extract',    desc:'Pull text/attributes from the DOM',                 cat:'Browser',  badge:'Playwright' },
  { name:'Browser Scroll',     desc:'Scroll up, down, or to an element',               cat:'Browser',  badge:'Playwright' },
  { name:'Browser Wait',       desc:'Wait for a selector or network idle',               cat:'Browser',  badge:'Playwright' },
  { name:'Browser Submit',     desc:'Fill and submit a form automatically',             cat:'Browser',  badge:'Playwright' },
  { name:'Browser Record',     desc:'Record a browser session as a script',             cat:'Browser',  badge:'Playwright' },
  { name:'Browser PDF',        desc:'Export a page as PDF',                             cat:'Browser',  badge:'Playwright' },

  // Code
  { name:'Python Exec',     desc:'Execute Python code in a sandboxed environment',        cat:'Code' },
  { name:'JS Exec',         desc:'Execute JavaScript/Node.js code',                       cat:'Code' },
  { name:'Shell Command',   desc:'Run shell commands (bash/powershell)',                   cat:'Code' },
  { name:'Code Review',     desc:'AI-powered code review and suggestions',                cat:'Code' },
  { name:'Code Explain',    desc:'Explain any code block in plain English',               cat:'Code' },
  { name:'Code Refactor',   desc:'Automatically refactor and clean up code',              cat:'Code' },
  { name:'Test Generator',  desc:'Auto-generate unit tests for functions',                cat:'Code' },
  { name:'Regex Builder',   desc:'Build and test regular expressions',                    cat:'Code' },
  { name:'SQL Builder',     desc:'Generate and run SQL queries',                          cat:'Code' },
  { name:'API Mock',        desc:'Mock API endpoints for testing',                        cat:'Code' },

  // File & Data
  { name:'Read File',       desc:'Read contents of any file from disk',                   cat:'File' },
  { name:'Write File',      desc:'Write or append text to a file',                        cat:'File' },
  { name:'CSV Parser',      desc:'Parse, filter, and aggregate CSV data',                 cat:'File' },
  { name:'JSON Transform',  desc:'Query and transform JSON with jq-style syntax',        cat:'File' },
  { name:'PDF Extract',     desc:'Extract text from PDF documents',                       cat:'File' },
  { name:'DOCX Read',       desc:'Read Word document content',                            cat:'File' },
  { name:'Image OCR',       desc:'Extract text from images using OCR',                   cat:'File' },
  { name:'Zip/Unzip',       desc:'Compress or extract archive files',                     cat:'File' },
  { name:'Diff Files',      desc:'Compare two files and show differences',               cat:'File' },
  { name:'File Search',     desc:'Search for files matching a pattern',                   cat:'File' },

  // Memory
  { name:'Short-term Store','desc':'Store key-value data for the current session',        cat:'Memory', badge:'Built-in' },
  { name:'Long-term KV',    desc:'Persist data across agent runs',                        cat:'Memory', badge:'Built-in' },
  { name:'Vector Search',   desc:'Semantic search over stored embeddings',               cat:'Memory', badge:'Built-in' },
  { name:'Remember Fact',   desc:"Commit a fact to the agent's long-term memory",       cat:'Memory' },
  { name:'Forget',          desc:'Remove specific memories or keys',                      cat:'Memory' },
  { name:'Memory Recap',    desc:'Summarize and compress older memories',                cat:'Memory' },

  // AI & LLM
  { name:'LLM Chat',        desc:'Call any LLM (GPT-4, Claude, Gemini, Ollama)',        cat:'AI' },
  { name:'Summarize',       desc:'Condense long text into a concise summary',            cat:'AI' },
  { name:'Translate',       desc:'Translate between 100+ languages',                     cat:'AI' },
  { name:'Sentiment',       desc:'Analyze sentiment and emotion in text',                cat:'AI' },
  { name:'Extract Entities',desc:'Named entity recognition from documents',              cat:'AI' },
  { name:'Embeddings',      desc:'Generate vector embeddings for any text',              cat:'AI' },
  { name:'Image Gen',       desc:'Generate images from text prompts (DALL·E / SDXL)',   cat:'AI' },
  { name:'Image Describe',  desc:'Describe images in natural language',                  cat:'AI' },
  { name:'Speech-to-Text',  desc:'Transcribe audio files to text',                       cat:'AI' },
  { name:'Text-to-Speech',  desc:'Convert text to spoken audio',                         cat:'AI' },
  { name:'Classify',        desc:'Zero-shot text classification',                         cat:'AI' },
  { name:'ReRank',          desc:'Re-rank search results by relevance',                   cat:'AI' },

  // Communication
  { name:'Send Email',      desc:'Send an email via SMTP / SendGrid',                    cat:'Comm' },
  { name:'Read Email',      desc:'Read and filter inbox via IMAP',                       cat:'Comm' },
  { name:'Send Slack',      desc:'Post a message to a Slack channel',                    cat:'Comm' },
  { name:'Send Discord',    desc:'Post a message to a Discord channel',                  cat:'Comm' },
  { name:'Send Telegram',   desc:'Send Telegram messages via bot API',                   cat:'Comm' },
  { name:'Send SMS',        desc:'Send SMS via Twilio / Vonage',                         cat:'Comm' },
  { name:'Send WhatsApp',   desc:'Send WhatsApp messages via API',                       cat:'Comm' },
  { name:'Calendar Event',  desc:'Create and manage Google Calendar events',             cat:'Comm' },
  { name:'Read Calendar',   desc:'Read upcoming events from calendar',                   cat:'Comm' },
  { name:'Notion Write',    desc:'Create or update Notion pages',                        cat:'Comm' },
  { name:'Notion Read',     desc:'Query Notion databases',                               cat:'Comm' },

  // APIs & Integrations
  { name:'GitHub Commits',  desc:'Read, create, and manage git commits',                 cat:'API',  badge:'MCP' },
  { name:'GitHub PR',       desc:'Open and manage pull requests',                        cat:'API',  badge:'MCP' },
  { name:'GitHub Issues',   desc:'Create and update issues',                             cat:'API',  badge:'MCP' },
  { name:'Stripe Charge',   desc:'Create Stripe payment sessions',                       cat:'API'  },
  { name:'Stripe Webhook',  desc:'Listen and process Stripe webhook events',            cat:'API'  },
  { name:'Jira Task',       desc:'Create and update Jira tickets',                       cat:'API'  },
  { name:'Linear Task',     desc:'Create and manage Linear issues',                      cat:'API'  },
  { name:'Airtable Read',   desc:'Query Airtable bases and records',                     cat:'API'  },
  { name:'Airtable Write',  desc:'Create/update Airtable records',                       cat:'API'  },
  { name:'Shopify Orders',  desc:'Read and manage Shopify store orders',                 cat:'API'  },
  { name:'Twitter Post',    desc:'Post tweets via the Twitter API',                      cat:'API'  },
  { name:'LinkedIn Post',   desc:'Schedule and post LinkedIn content',                   cat:'API'  },
  { name:'YouTube Search',  desc:'Search YouTube and get video metadata',               cat:'API'  },
  { name:'Google Sheets',   desc:'Read/write Google Sheets spreadsheets',               cat:'API'  },
  { name:'Google Docs',     desc:'Create and edit Google Docs',                          cat:'API'  },

  // Data & Analytics
  { name:'SQL Query',       desc:'Execute SQL against connected databases',              cat:'Data' },
  { name:'PostgreSQL',      desc:'Full CRUD against PostgreSQL databases',               cat:'Data' },
  { name:'Redis Get/Set',   desc:'Read and write Redis key-value cache',                cat:'Data' },
  { name:'MongoDB Query',   desc:'Run queries against MongoDB collections',              cat:'Data' },
  { name:'Chart Generator', desc:'Create charts from data (bar, line, pie)',             cat:'Data' },
  { name:'Data Aggregator', desc:'Group, aggregate, and pivot datasets',                 cat:'Data' },
  { name:'Excel Export',    desc:'Export data to .xlsx files',                           cat:'Data' },

  // Infrastructure
  { name:'Docker Run',      desc:'Start and stop Docker containers',                     cat:'Infra' },
  { name:'Cron Schedule',   desc:'Schedule agents to run on a cron',                     cat:'Infra' },
  { name:'Webhook Listen',  desc:'Listen for incoming webhook events',                   cat:'Infra' },
  { name:'Env Manager',     desc:'Read and set environment variables',                   cat:'Infra' },
  { name:'Log Stream',      desc:'Stream log output to the UI in real-time',             cat:'Infra' },
  { name:'Health Check',    desc:'Ping services and report uptime',                      cat:'Infra' },
  { name:'Deploy Script',   desc:'Run deployment scripts remotely',                      cat:'Infra' },

  // MCP
  { name:'MCP Connect',     desc:'Connect any MCP-compatible client or server',         cat:'MCP',  badge:'MCP' },
  { name:'MCP Tool List',   desc:'Discover tools from a connected MCP server',          cat:'MCP',  badge:'MCP' },
  { name:'MCP Invoke',      desc:'Call a tool on a remote MCP server',                  cat:'MCP',  badge:'MCP' },
  { name:'Claude Desktop',  desc:'Bridge AgentSwarp tools into Claude Desktop',         cat:'MCP',  badge:'MCP' },
  { name:'Cursor Editor',   desc:'Automatically edit code files via MCP + Cursor',      cat:'MCP',  badge:'MCP' },
];

const CATS = ['All', ...Array.from(new Set(TOOLS.map(t => t.cat)))];

const BADGE_STYLE: Record<string, React.CSSProperties> = {
  'Playwright': { background:'var(--cyan-dim)', color:'var(--cyan)' },
  'Built-in':  { background:'var(--green-dim)', color:'var(--green)' },
  'MCP':       { background:'var(--accent-glow)', color:'var(--accent-light)' },
};

export default function ToolsPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');

  const filtered = useMemo(() =>
    TOOLS.filter(t =>
      (cat === 'All' || t.cat === cat) &&
      (t.name.toLowerCase().includes(search.toLowerCase()) ||
       t.desc.toLowerCase().includes(search.toLowerCase()))
    ), [search, cat]);

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Tools Hub</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          {TOOLS.length} tools across {CATS.length - 1} categories. Click any tool to invoke it in Studio.
        </p>
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tools…" style={{ paddingLeft: 30 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATS.map(c => (
            <button key={c} className={`tool-pill ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginBottom: 12 }}>
        Showing {filtered.length} tools
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 8 }}>
        {filtered.map(tool => (
          <div key={tool.name} className="card card-hover" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
              <div style={{ fontWeight: 500, fontSize: 13 }}>{tool.name}</div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {tool.badge && <span className="badge" style={{ ...BADGE_STYLE[tool.badge], fontSize: 10, padding: '1px 6px' }}>{tool.badge}</span>}
                <span className="badge badge-gray">{tool.cat}</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{tool.desc}</div>
            <a href={`/studio?tool=${encodeURIComponent(tool.name)}`}
              style={{ fontSize: 11, color: 'var(--accent-light)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
              Use in Studio <ChevronRight size={10} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
