<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { Agent, Run, RunStep } from '$lib/types'
  import { addToast } from '$lib/stores/toast'
  import * as api from '$lib/api'

  interface Props {
    agent: Agent
    showLogs?: boolean
  }

  let { agent, showLogs = false }: Props = $props()

  const dispatch = createEventDispatcher<{ run: { agentId: string } }>()

  let logsOpen = $state(showLogs)
  let steps = $state<RunStep[]>([])
  let loadingLogs = $state(false)
  let lastRun = $state<Run | null>(null)
  let runLoaded = $state(false)

  async function loadLastRun() {
    if (runLoaded) return
    runLoaded = true
    try {
      const runs = await api.runs.list(agent.id, 1)
      lastRun = runs[0] ?? null
    } catch { /* silent */ }
  }

  async function toggleLogs() {
    logsOpen = !logsOpen
    if (logsOpen && steps.length === 0) {
      await loadLogs()
    }
  }

  async function loadLogs() {
    try {
      const runs = await api.runs.list(agent.id, 1)
      const run = runs[0]
      if (!run) return
      lastRun = run
      loadingLogs = true
      const allSteps = await api.runs.getSteps(run.id)
      steps = allSteps.slice(-5)
    } catch {
      addToast('Failed to load logs', 'error')
    } finally {
      loadingLogs = false
    }
  }

  async function handleRun() {
    try {
      dispatch('run', { agentId: agent.id })
      await api.agents.run(agent.id)
      addToast(`${agent.name} started`, 'success')
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Failed to run agent', 'error')
    }
  }

  function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const s = Math.floor(diff / 1000)
    if (s < 60) return `${s}s ago`
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  const stepIcon: Record<string, string> = {
    thought: 'ð­',
    tool_call: 'â¡',
    tool_result: 'â',
    sub_agent: 'â',
    message: 'ð¬',
  }

  $effect(() => {
    loadLastRun()
  })
</script>

<div
  class="agent-card card card-hover"
  class:is-running={agent.status === 'running'}
  class:is-error={agent.status === 'error'}
>
  <div class="card-top">
    <span
      class="status-dot"
      class:idle={agent.status === 'idle'}
      class:running={agent.status === 'running'}
      class:error={agent.status === 'error'}
      title={agent.status}
    ></span>
    <span class="agent-name">{agent.name}</span>
    <span class="personality-badge mono">{agent.personality ?? 'default'}</span>
    {#if agent.status === 'running'}
      <span class="queue-badge">â live</span>
    {/if}
  </div>

  <p class="agent-goal">{agent.goal}</p>

  <div class="card-bottom">
    {#if lastRun}
      <span class="badge badge-{lastRun.status}">{lastRun.status}</span>
      <span class="run-time">{relativeTime(lastRun.started_at)}</span>
    {:else}
      <span class="badge badge-pending">never run</span>
    {/if}
    {#if agent.model_override}
      <span class="model-pill mono">{agent.model_override}</span>
    {/if}
  </div>

  <div class="hover-actions">
    <button class="btn btn-success btn-sm" onclick={handleRun}>â¶ Run</button>
    <a class="btn btn-ghost btn-sm" href="/agents/{agent.id}">â Edit</a>
    <button class="btn btn-ghost btn-sm" onclick={toggleLogs}>
      {logsOpen ? 'â²' : 'â¼'} Logs
    </button>
  </div>

  {#if logsOpen}
    <div class="logs-panel">
      {#if loadingLogs}
        <div class="skeleton" style="height:12px; margin-bottom:6px;"></div>
        <div class="skeleton" style="height:12px; margin-bottom:6px; width:80%;"></div>
        <div class="skeleton" style="height:12px; width:60%;"></div>
      {:else if steps.length === 0}
        <span class="no-logs">No steps recorded yet</span>
      {:else}
        {#each steps as step (step.id)}
          <div class="log-line">
            <span class="log-icon">{stepIcon[step.type] ?? 'Â·'}</span>
            <span class="log-content">{step.content.slice(0, 80)}{step.content.length > 80 ? 'â¦' : ''}</span>
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  .agent-card {
    position: relative;
    overflow: hidden;
    transition: border-color 150ms, box-shadow 150ms, transform 150ms;
  }

  .agent-card.is-running {
    border-left: 2px solid var(--accent);
    box-shadow: 0 0 12px var(--accent-dim);
  }

  .agent-card.is-error {
    border-left: 2px solid var(--danger);
  }

  .card-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-dot.idle { background: #555; }
  .status-dot.running {
    background: var(--accent);
    animation: pulseDot 1s infinite alternate;
  }
  .status-dot.error { background: var(--danger); }

  .agent-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--text);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .personality-badge {
    font-size: 10px;
    padding: 1px 6px;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--text-muted);
    white-space: nowrap;
  }

  .queue-badge {
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
    color: var(--accent);
    animation: pulseDot 1s infinite alternate;
  }

  .agent-goal {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 10px;
  }

  .card-bottom {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .run-time {
    font-size: 11px;
    color: var(--text-muted);
  }

  .model-pill {
    font-size: 10px;
    padding: 1px 6px;
    background: var(--bg-elevated);
    border-radius: 999px;
    color: var(--text-muted);
    border: 1px solid var(--border);
  }

  .hover-actions {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, var(--bg-surface) 70%, transparent);
    padding: 12px;
    display: flex;
    gap: 6px;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 150ms ease, transform 150ms ease;
    pointer-events: none;
  }

  .agent-card:hover .hover-actions {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .logs-panel {
    margin-top: 12px;
    border-top: 1px solid var(--border);
    padding-top: 10px;
    max-height: 200px;
    overflow-y: auto;
    animation: slideUp 150ms ease forwards;
  }

  .log-line {
    display: flex;
    gap: 6px;
    align-items: flex-start;
    padding: 2px 0;
  }

  .log-icon {
    font-size: 11px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .log-content {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .no-logs {
    font-size: 12px;
    color: var(--text-muted);
    font-style: italic;
  }
</style>