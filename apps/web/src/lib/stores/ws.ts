import { writable, derived } from 'svelte/store';
import type RunStep from '../types';

const WS_URL = (import.meta.env.PUBLIC_WS_URL as string) ?? 'ws://localhost:3001/ws';

let socket: WebSocket | null = null;
let reconnectDelay = 1000;
const maxDelay = 30000;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
const subscribers = new Map<string, Set<(step: RunStep) => void>>();

export const wsStatus = writable<'connecting' | 'connected' | 'disconnected'>('disconnected');

export const connected = derived(wsStatus, ($s) => $s === 'connected');

function dispatch(runId: string, step: RunStep): void {
  const specific = subscribers.get(runId);
  if (specific) {
    specific.forEach((cb) => cb(step));
  }
  const wildcard = subscribers.get('*');
  if (wildcard) {
    wildcard.forEach((cb) => cb(step));
  }
}

export function connect(): void {
  if (typeof window === 'undefined') return;

  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  wsStatus.set('connecting');
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    wsStatus.set('connected');
    reconnectDelay = 1000;

    if (heartbeatTimer !== null) {
      clearInterval(heartbeatTimer);
    }

    heartbeatTimer = setInterval(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  };

  socket.onmessage = (event: MessageEvent) => {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(event.data as string);
    } catch {
      console.error('[ws] Failed to parse message:', event.data);
      return;
    }

    if (msg.type === 'pong') return;

    if (typeof msg.runId === 'string') {
      dispatch(msg.runId, msg as unknown as RunStep);
    }
  };

  socket.onclose = () => {
    wsStatus.set('disconnected');

    if (heartbeatTimer !== null) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }

    setTimeout(() => {
      reconnect();
    }, reconnectDelay);

    reconnectDelay = Math.min(reconnectDelay * 2, maxDelay);
  };

  socket.onerror = (error: Event) => {
    console.error('[ws] WebSocket error:', error);
  };
}

function reconnect(): void {
  connect();
}

export function disconnect(): void {
  if (heartbeatTimer !== null) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }

  if (socket) {
    socket.close();
    socket = null;
  }
}

export function sendMessage(data: object): void {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

export function onRunStep(runId: string, cb: (step: RunStep) => void): () => void {
  if (!subscribers.has(runId)) {
    subscribers.set(runId, new Set());
  }

  const set = subscribers.get(runId)!;
  set.add(cb);

  return () => {
    set.delete(cb);
    if (set.size === 0) {
      subscribers.delete(runId);
    }
  };
}

if (typeof window !== 'undefined') {
  connect();
}

export default {
  wsStatus,
  connected,
  sendMessage,
  onRunStep,
  connect,
  disconnect,
};

