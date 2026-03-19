// apps/web/src/lib/types.ts
// AgentSwarp - Shared TypeScript Interfaces

export interface Agent {
  id: string;
  name: string;
  goal: string;
  personality: string;
  status: 'idle' | 'running' | 'error';
  model_override?: string;
  max_sub_agents: number;
  created_at: string;
  updated_at: string;
}

export interface Run {
  id: string;
  agent_id: string;
  agent_name?: string;
  status: 'running' | 'success' | 'fail' | 'partial';
  started_at: string;
  finished_at?: string;
  summary?: string;
  step_count: number;
  duration_ms?: number;
}

export interface RunStep {
  id: string;
  run_id: string;
  type: 'thought' | 'tool_call' | 'tool_result' | 'sub_agent' | 'message';
  content: string;
  tool_name?: string;
  input?: string;
  output?: string;
  status?: 'running' | 'success' | 'fail';
  created_at: string;
}

export interface Memory {
  id: string;
  agent_id: string;
  key?: string;
  value?: string;
  content?: string;
  type: 'kv' | 'vector';
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface WorkspaceFile {
  id: string;
  agent_id: string;
  filename: string;
  path: string;
  size: number;
  mime_type: string;
  created_at: string;
}

export interface Personality {
  key: string;
  name: string;
  description: string;
  systemPrompt: string;
}

export interface AppSettings {
  llm_provider: string;
  llm_model: string;
  llm_api_key?: string;
  ollama_base_url?: string;
  voice_enabled: boolean;
  stt_mode: 'browser' | 'whisper';
  tts_mode: 'browser' | 'elevenlabs';
  elevenlabs_voice_id?: string;
  elevenlabs_api_key?: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

