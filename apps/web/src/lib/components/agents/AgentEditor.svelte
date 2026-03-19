<script lang="ts">
  import { onMount } from 'svelte';
  import { agents, settings } from '$lib/api';
  import { addToast } from '$lib/stores/toast';
  import PersonalityPicker from './PersonalityPicker.svelte';
  import type { Agent, Tool } from '$lib/types';

  interface Props {
    agent?: Agent | null;
    onSave?: (agent: Agent) => void;
    onCancel?: (() => void) | undefined;
  }

  let { agent = null, onSave = () => {}, onCancel = undefined }: Props = $props();

  let form = $state({
    name: '',
    goal: '',
    personality: 'default',
    model_override: '',
    max_sub_agents: 3,
    trigger_type: 'manual' as 'manual' | 'scheduled' | 'webhook',
    cron_expression: '0 9 * * *',
    tools: [] as string[]
  });

  let saving = $state(false);
  let availableTools = $state<Tool[]>([]);

  const webhookUrl = agent?.id
    ? 'http://localhost:3001/api/agents/' + agent.id + '/webhook'
    : '';

  function cronHumanReadable(cron: string): string {
    switch (cron) {
      case '0 * * * *':
        return 'Every hour';
      case '0 9 * * *':
        return 'Every day at 9am';
      case '0 9 * * 1':
        return 'Every Monday at 9am';
      case '0 9 1 * *':
        return 'First of month at 9am';
      case '*/5 * * * *':
        return 'Every 5 minutes';
      default:
        return 'Custom schedule';
    }
  }

  function toggleTool(tool: Tool) {
    if (form.tools.includes(tool.id)) {
      form.tools = form.tools.filter((t) => t !== tool.id);
    } else {
      form.tools = [...form.tools, tool.id];
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (!form.name.trim()) {
      addToast('Agent name is required', 'error');
      return;
    }
    if (!form.goal.trim()) {
      addToast('Agent goal is required', 'error');
      return;
    }

    saving = true;

    try {
      let result: Agent;
      if (agent) {
        result = await agents.update(agent.id, form);
        addToast('Agent updated successfully', 'success');
      } else {
        result = await agents.create(form);
        addToast('Agent created successfully', 'success');
      }
      onSave(result);
    } catch (err: any) {
      addToast(err.message ?? 'An error occurred', 'error');
    } finally {
      saving = false;
    }
  }

  onMount(async () => {
    try {
      const res = await fetch('/api/tools');
      if (res.ok) {
        availableTools = await res.json();
      }
    } catch {
      // tools fetch failed silently
    }

    if (agent) {
      form.name = agent.name ?? '';
      form.goal = agent.goal ?? '';
      form.personality = agent.personality ?? 'default';
      form.model_override = agent.model_override ?? '';
      form.max_sub_agents = agent.max_sub_agents ?? 3;
      form.trigger_type = (agent.trigger_type as 'manual' | 'scheduled' | 'webhook') ?? 'manual';
      form.cron_expression = agent.cron_expression ?? '0 9 * * *';
      form.tools = agent.tools ?? [];
    }
  });
</script>

<form onsubmit={handleSubmit} style="display:flex; flex-direction:column; gap:16px;">
  <!-- Agent Name -->
  <div class="input-group">
    <label class="label" for="agent-name">Agent Name *</label>
    <input
      id="agent-name"
      bind:value={form.name}
      required
      placeholder="My Agent"
      class="input"
    />
  </div>

  <!-- Goal -->
  <div class="input-group">
    <label class="label" for="agent-goal">Goal *</label>
    <textarea
      id="agent-goal"
      bind:value={form.goal}
      rows={4}
      placeholder="Describe what this agent should do..."
      class="textarea"
    ></textarea>
  </div>

  <!-- Personality Picker -->
  <PersonalityPicker bind:value={form.personality} />

  <!-- Model Override -->
  <div class="input-group">
    <label class="label" for="model-override">Model Override</label>
    <input
      id="model-override"
      bind:value={form.model_override}
      placeholder="gpt-4o / gemini-2.0-flash / llama3.1 (leave empty for default)"
      class="input"
    />
  </div>

  <!-- Max Sub-Agents -->
  <div class="input-group">
    <label class="label" for="max-sub-agents">Max Sub-Agents: {form.max_sub_agents}</label>
    <input
      id="max-sub-agents"
      type="range"
      min={0}
      max={5}
      bind:value={form.max_sub_agents}
      class="range"
    />
  </div>

  <!-- Tools -->
  <div class="input-group">
    <span class="label">Tools</span>
    <div class="tools-grid">
      {#each availableTools as tool (tool.id)}
        <label class="tool-checkbox">
          <input
            type="checkbox"
            value={tool.id}
            checked={form.tools.includes(tool.id)}
            onchange={() => toggleTool(tool)}
          />
          {tool.name}
        </label>
      {/each}
      {#if availableTools.length === 0}
        <span class="no-tools">No tools available</span>
      {/if}
    </div>
  </div>

  <!-- Trigger Type -->
  <div class="input-group">
    <span class="label">Trigger</span>
    <div style="display:flex; gap:16px; align-items:center;">
      <label class="radio-label">
        <input
          type="radio"
          name="trigger_type"
          value="manual"
          checked={form.trigger_type === 'manual'}
          onchange={() => (form.trigger_type = 'manual')}
        />
        Manual
      </label>
      <label class="radio-label">
        <input
          type="radio"
          name="trigger_type"
          value="scheduled"
          checked={form.trigger_type === 'scheduled'}
          onchange={() => (form.trigger_type = 'scheduled')}
        />
        Scheduled
      </label>
      <label class="radio-label">
        <input
          type="radio"
          name="trigger_type"
          value="webhook"
          checked={form.trigger_type === 'webhook'}
          onchange={() => (form.trigger_type = 'webhook')}
        />
        Webhook
      </label>
    </div>
  </div>

  <!-- Scheduled: Cron -->
  {#if form.trigger_type === 'scheduled'}
    <div class="input-group">
      <label class="label" for="cron-expression">Cron Expression</label>
      <input
        id="cron-expression"
        bind:value={form.cron_expression}
        placeholder="0 9 * * *"
        class="input"
      />
      <p class="cron-hint">{cronHumanReadable(form.cron_expression)}</p>
      <a
        href="https://crontab.guru"
        target="_blank"
        rel="noopener noreferrer"
        style="font-size:11px;"
      >crontab.guru -></a>
    </div>
  {/if}

  <!-- Webhook URL -->
  {#if form.trigger_type === 'webhook' && agent}
    <div class="input-group">
      <label class="label" for="webhook-url">Webhook URL</label>
      <input
        id="webhook-url"
        type="text"
        value={webhookUrl}
        readonly
        class="input input--readonly"
        onclick={(e) => (e.currentTarget as HTMLInputElement).select()}
      />
    </div>
  {/if}

  <div class="divider"></div>

  <!-- Form Actions -->
  <div class="form-actions">
    <button type="submit" class="btn btn--success" disabled={saving}>
      {#if saving}
        <span class="spinner"></span>
      {/if}
      {agent ? 'Update' : 'Create'} Agent
    </button>
    {#if onCancel}
      <button type="button" class="btn btn--ghost" onclick={onCancel} disabled={saving}>
        Cancel
      </button>
    {/if}
  </div>
</form>

<style>
  .input-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary, #a0aec0);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .input,
  .textarea {
    background: var(--input-bg, #1a1a2e);
    border: 1px solid var(--border, #2d2d4e);
    border-radius: 8px;
    color: var(--text-primary, #e2e8f0);
    font-size: 14px;
    padding: 10px 12px;
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;
    width: 100%;
    box-sizing: border-box;
  }

  .input:focus,
  .textarea:focus {
    border-color: var(--accent, #6366f1);
  }

  .input--readonly {
    opacity: 0.7;
    cursor: text;
  }

  .textarea {
    resize: vertical;
    min-height: 96px;
  }

  .range {
    width: 100%;
    accent-color: var(--accent, #6366f1);
    cursor: pointer;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .tool-checkbox {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-size: 13px;
    color: var(--text-primary, #e2e8f0);
    padding: 4px 6px;
    border-radius: 4px;
    transition: background 0.15s;
  }

  .tool-checkbox:hover {
    background: var(--hover-bg, rgba(99, 102, 241, 0.08));
  }

  .tool-checkbox input[type='checkbox'] {
    accent-color: var(--accent, #6366f1);
    cursor: pointer;
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  .no-tools {
    font-size: 13px;
    color: var(--text-muted, #718096);
    grid-column: 1 / -1;
  }

  .radio-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: var(--text-primary, #e2e8f0);
    cursor: pointer;
  }

  .radio-label input[type='radio'] {
    accent-color: var(--accent, #6366f1);
    cursor: pointer;
    width: 14px;
    height: 14px;
  }

  .cron-hint {
    font-size: 11px;
    color: var(--text-muted, #718096);
    margin: 0;
  }

  .divider {
    height: 1px;
    background: var(--border, #2d2d4e);
    margin: 4px 0;
  }

  .form-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition:
      background 0.2s,
      opacity 0.2s;
    font-family: inherit;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn--success {
    background: var(--success, #22c55e);
    color: #fff;
  }

  .btn--success:hover:not(:disabled) {
    background: var(--success-hover, #16a34a);
  }

  .btn--ghost {
    background: transparent;
    color: var(--text-secondary, #a0aec0);
    border: 1px solid var(--border, #2d2d4e);
  }

  .btn--ghost:hover:not(:disabled) {
    background: var(--hover-bg, rgba(99, 102, 241, 0.08));
    color: var(--text-primary, #e2e8f0);
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>

