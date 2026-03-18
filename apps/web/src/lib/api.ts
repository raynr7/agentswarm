// AgentSwarp V3 — Typed API Client
// Communicates with the FastAPI backend securely via JWT Bearer tokens

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const TOKEN_KEY = 'agentswarp-token';

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);
const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      req<{ token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }).then((r) => { setToken(r.token); return r; }),
    logout: () => clearToken(),
    isLoggedIn: () => !!getToken(),
  },
  agents: {
    list: () => req<Agent[]>('/agents'),
    deploy: (cfg: AgentCreate) => req<{ agent_id: string; status: string; personality: string }>('/agents/deploy', {
      method: 'POST', body: JSON.stringify(cfg),
    }),
    stop: (id: string) => req<{ status: string }>(`/agents/${id}`, { method: 'DELETE' }),
    telemetry: (id: string) => req<AgentTelemetry>(`/agents/${id}/telemetry`),
  },
  memory: {
    get: (agentId: string) => req<MemorySnapshot>(`/memory/${agentId}`),
    search: (query: string, agentId?: string) => req<{ results: VectorResult[] }>('/memory/search', {
      method: 'POST', body: JSON.stringify({ query, agent_id: agentId }),
    }),
  },
  personalities: {
    list: () => req<Personality[]>('/personalities'),
  },
  health: () => req<{ status: string; agents: number }>('/health'),
};

// ---- Types ----------------------------------------------------------------

export interface Agent {
  id: string;
  name: string;
  goal: string;
  personality: { name: string; prompt: string };
}

export interface AgentCreate {
  name: string;
  goal: string;
  personality?: string;
}

export interface AgentTelemetry {
  id: string;
  config: Record<string, unknown>;
  short_term_memory: { ts: number; text: string }[];
  vector_store_size: number;
}

export interface MemorySnapshot {
  short_term: { ts: number; text: string }[];
  long_term: Record<string, unknown>;
  vector_count: number;
}

export interface VectorResult {
  id: string;
  agent_id: string;
  content: string;
  ts: number;
}

export interface Personality {
  key: string;
  name: string;
}
