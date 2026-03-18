// AgentSwarp V3 — WebSocket real-time telemetry hook
// Streams live agent step events from the FastAPI backend

import { useEffect, useRef, useState, useCallback } from 'react';

type WSStatus = 'connecting' | 'open' | 'closed' | 'error';

interface TelemetryEvent {
  type: 'tick' | 'error' | 'status';
  agent_id: string;
  data: string;
  ts: number;
}

export function useAgentStream(agentId: string | null) {
  const ws = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WSStatus>('closed');
  const [events, setEvents] = useState<TelemetryEvent[]>([]);

  const connect = useCallback(() => {
    if (!agentId) return;
    const url = `${process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000'}/ws/${agentId}`;
    ws.current = new WebSocket(url);
    setStatus('connecting');

    ws.current.onopen = () => setStatus('open');
    ws.current.onclose = () => setStatus('closed');
    ws.current.onerror = () => setStatus('error');
    ws.current.onmessage = (e) => {
      try {
        const evt: TelemetryEvent = JSON.parse(e.data);
        setEvents((prev) => [evt, ...prev].slice(0, 50));
      } catch { /* ignore non-JSON */ }
    };
  }, [agentId]);

  const disconnect = useCallback(() => {
    ws.current?.close();
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { status, events, connect, disconnect };
}
