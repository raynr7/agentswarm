<script lang="ts">
  import { onMount } from 'svelte';
  import * as settings from '$lib/api/settings';
  import { addToast } from '$lib/stores/toast';
  import Modal from '$lib/components/ui/Modal.svelte';
  import type { AppSettings, Personality } from '$lib/types';

  const builtInKeys = ['default', 'concise', 'creative', 'analyst', 'coder', 'rayn'];

  let appSettings: AppSettings = $state({
    llm_provider: 'openai',
    llm_model: 'gpt-4o',
    voice_enabled: false,
    stt_mode: 'browser',
    tts_mode: 'browser',
    llm_api_key: '',
    ollama_base_url: 'http://localhost:11434',
    elevenlabs_api_key: '',
    elevenlabs_voice_id: '',
  });

  let personalities: Personality[] = $state([]);
  let loading = $state(true);
  let saving = $state(false);
  let testingLLM = $state(false);
  let showClearModal = $state(false);
  let editingPersonalityKey: string | null = $state(null);
  let showAddPersonality = $state(false);
  let newPersonality = $state({
    key: '',
    name: '',
    description: '',
    system_prompt: '',
  });

  let editPersonalityData: Record<string, Partial<Personality>> = $state({});

  onMount(async () => {
    try {
      const [settingsData, personalitiesData] = await Promise.all([
        settings.getSettings(),
        settings.getPersonalities(),
      ]);
      if (settingsData) {
        appSettings = { ...appSettings, ...settingsData };
      }
      if (personalitiesData) {
        personalities = personalitiesData;
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to load settings' });
    } finally {
      loading = false;
    }
  });

  async function saveLLM() {
    saving = true;
    try {
      await settings.saveSettings({
        llm_provider: appSettings.llm_provider,
        llm_model: appSettings.llm_model,
        llm_api_key: appSettings.llm_api_key,
        ollama_base_url: appSettings.ollama_base_url,
      });
      addToast({ type: 'success', message: 'LLM settings saved successfully' });
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to save LLM settings' });
    } finally {
      saving = false;
    }
  }

  async function testLLM() {
    testingLLM = true;
    try {
      const result = await settings.testLLM();
      if (result?.success) {
        addToast({ type: 'success', message: result.message || 'Connection successful!' });
      } else {
        addToast({ type: 'error', message: result?.message || 'Connection test failed' });
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Connection test failed' });
    } finally {
      testingLLM = false;
    }
  }

  async function saveVoice() {
    saving = true;
    try {
      await settings.saveSettings({
        voice_enabled: appSettings.voice_enabled,
        stt_mode: appSettings.stt_mode,
        tts_mode: appSettings.tts_mode,
        elevenlabs_api_key: appSettings.elevenlabs_api_key,
        elevenlabs_voice_id: appSettings.elevenlabs_voice_id,
      });
      addToast({ type: 'success', message: 'Voice settings saved successfully' });
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to save voice settings' });
    } finally {
      saving = false;
    }
  }

  async function addPersonality() {
    if (!newPersonality.key || !newPersonality.name) {
      addToast({ type: 'error', message: 'Key and name are required' });
      return;
    }
    try {
      await settings.createPersonality(newPersonality);
      const personalitiesData = await settings.getPersonalities();
      if (personalitiesData) personalities = personalitiesData;
      showAddPersonality = false;
      newPersonality = { key: '', name: '', description: '', system_prompt: '' };
      addToast({ type: 'success', message: 'Personality added successfully' });
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to add personality' });
    }
  }

  async function savePersonality(key: string) {
    const data = editPersonalityData[key];
    if (!data) return;
    try {
      await settings.updatePersonality(key, data);
      const personalitiesData = await settings.getPersonalities();
      if (personalitiesData) personalities = personalitiesData;
      editingPersonalityKey = null;
      addToast({ type: 'success', message: 'Personality updated successfully' });
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update personality' });
    }
  }

  async function deletePersonality(key: string) {
    if (!confirm(`Delete personality "${key}"? This cannot be undone.`)) return;
    try {
      await settings.deletePersonality(key);
      personalities = personalities.filter((p) => p.key !== key);
      addToast({ type: 'success', message: 'Personality deleted' });
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to delete personality' });
    }
  }

  async function clearMemory() {
    try {
      const res = await fetch('/api/memory/all', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      addToast({ type: 'success', message: 'All memory cleared successfully' });
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to clear memory' });
    } finally {
      showClearModal = false;
    }
  }

  async function resetSettings() {
    if (!confirm('Reset all settings to defaults? This cannot be undone.')) return;
    try {
      await settings.resetSettings();
      const settingsData = await settings.getSettings();
      if (settingsData) appSettings = { ...appSettings, ...settingsData };
      addToast({ type: 'success', message: 'Settings reset to defaults' });
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to reset settings' });
    }
  }

  function providerPlaceholder(provider: string): string {
    switch (provider) {
      case 'openai':
        return 'sk-...';
      case 'groq':
        return 'gsk_...';
      case 'anthropic':
        return 'sk-ant-...';
      case 'gemini':
        return 'AIza...';
      case 'litellm':
        return 'Enter your LiteLLM API key';
      default:
        return 'Enter API key';
    }
  }

  function startEditPersonality(p: Personality) {
    editingPersonalityKey = p.key;
    editPersonalityData[p.key] = {
      name: p.name,
      description: p.description,
      system_prompt: p.system_prompt,
    };
  }

  function cancelEdit() {
    editingPersonalityKey = null;
  }
</script>

{#if loading}
  <div class="loading-wrapper">
    <div class="spinner"></div>
    <p>Loading settings...</p>
  </div>
{:else}
  <div class="settings-page">
    <header class="page-header">
      <h1>Settings</h1>
      <p class="subtitle">Configure AgentSwarp to your preferences</p>
    </header>

    <!-- Section 1: LLM Provider -->
    <section class="card">
      <div class="card-header">
        <h2>LLM Provider</h2>
        <p class="card-desc">Configure your language model provider and credentials</p>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label for="llm-provider">Provider</label>
          <select id="llm-provider" bind:value={appSettings.llm_provider}>
            <option value="openai">OpenAI</option>
            <option value="groq">Groq</option>
            <option value="anthropic">Anthropic</option>
            <option value="ollama">Ollama (Local)</option>
            <option value="gemini">Google Gemini</option>
            <option value="litellm">LiteLLM</option>
          </select>
        </div>

        <div class="form-group">
          <label for="llm-model">Model</label>
          <input
            id="llm-model"
            type="text"
            bind:value={appSettings.llm_model}
            placeholder={appSettings.llm_provider === 'ollama'
              ? 'llama3'
              : appSettings.llm_provider === 'anthropic'
                ? 'claude-3-5-sonnet-20241022'
                : appSettings.llm_provider === 'groq'
                  ? 'llama-3.1-70b-versatile'
                  : appSettings.llm_provider === 'gemini'
                    ? 'gemini-1.5-pro'
                    : 'gpt-4o'}
          />
        </div>

        {#if appSettings.llm_provider === 'ollama'}
          <div class="form-group">
            <label for="ollama-url">Ollama Base URL</label>
            <input
              id="ollama-url"
              type="text"
              bind:value={appSettings.ollama_base_url}
              placeholder="http://localhost:11434"
            />
          </div>
        {:else}
          <div class="form-group">
            <label for="llm-api-key">API Key</label>
            <input
              id="llm-api-key"
              type="password"
              bind:value={appSettings.llm_api_key}
              placeholder={providerPlaceholder(appSettings.llm_provider)}
              autocomplete="off"
            />
          </div>
        {/if}

        <div class="button-row">
          <button
            class="btn btn-secondary"
            onclick={testLLM}
            disabled={testingLLM || saving}
          >
            {#if testingLLM}
              <span class="btn-spinner"></span>
              Testing...
            {:else}
              Test Connection
            {/if}
          </button>
          <button
            class="btn btn-primary"
            onclick={saveLLM}
            disabled={saving || testingLLM}
          >
            {#if saving}
              <span class="btn-spinner"></span>
              Saving...
            {:else}
              Save LLM Settings
            {/if}
          </button>
        </div>
      </div>
    </section>

    <!-- Section 2: Voice -->
    <section class="card">
      <div class="card-header">
        <h2>Voice Settings</h2>
        <p class="card-desc">Configure speech recognition and text-to-speech</p>
      </div>
      <div class="card-body">
        <div class="form-group toggle-group">
          <label class="toggle-label" for="voice-enabled">
            <input
              id="voice-enabled"
              type="checkbox"
              bind:checked={appSettings.voice_enabled}
            />
            <span class="toggle-track"></span>
            Enable Voice Features
          </label>
        </div>

        {#if appSettings.voice_enabled}
          <div class="voice-options">
            <div class="form-group">
              <p class="radio-group-label">Speech-to-Text (STT) Mode</p>
              <div class="radio-group">
                <label class="radio-label">
                  <input
                    type="radio"
                    name="stt_mode"
                    value="browser"
                    bind:group={appSettings.stt_mode}
                  />
                  Browser (Web Speech API)
                </label>
                <label class="radio-label">
                  <input
                    type="radio"
                    name="stt_mode"
                    value="whisper"
                    bind:group={appSettings.stt_mode}
                  />
                  Whisper (OpenAI)
                </label>
              </div>
            </div>

            <div class="form-group">
              <p class="radio-group-label">Text-to-Speech (TTS) Mode</p>
              <div class="radio-group">
                <label class="radio-label">
                  <input
                    type="radio"
                    name="tts_mode"
                    value="browser"
                    bind:group={appSettings.tts_mode}
                  />
                  Browser (Web Speech API)
                </label>
                <label class="radio-label">
                  <input
                    type="radio"
                    name="tts_mode"
                    value="elevenlabs"
                    bind:group={appSettings.tts_mode}
                  />
                  ElevenLabs
                </label>
              </div>
            </div>

            {#if appSettings.tts_mode === 'elevenlabs'}
              <div class="form-group">
                <label for="elevenlabs-key">ElevenLabs API Key</label>
                <input
                  id="elevenlabs-key"
                  type="password"
                  bind:value={appSettings.elevenlabs_api_key}
                  placeholder="Enter ElevenLabs API key"
                  autocomplete="off"
                />
              </div>
              <div class="form-group">
                <label for="elevenlabs-voice">Voice ID</label>
                <input
                  id="elevenlabs-voice"
                  type="text"
                  bind:value={appSettings.elevenlabs_voice_id}
                  placeholder="e.g. 21m00Tcm4TlvDq8ikWAM"
                />
              </div>
            {/if}
          </div>
        {/if}

        <div class="button-row">
          <button
            class="btn btn-primary"
            onclick={saveVoice}
            disabled={saving}
          >
            {#if saving}
              <span class="btn-spinner"></span>
              Saving...
            {:else}
              Save Voice Settings
            {/if}
          </button>
        </div>
      </div>
    </section>

    <!-- Section 3: Personalities -->
    <section class="card">
      <div class="card-header">
        <h2>Personalities</h2>
        <p class="card-desc">Manage AI personalities and system prompts</p>
      </div>
      <div class="card-body">
        <div class="personalities-list">
          {#each personalities as personality (personality.key)}
            <div class="personality-item">
              {#if editingPersonalityKey === personality.key}
                <div class="personality-edit-form">
                  <div class="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      bind:value={editPersonalityData[personality.key].name}
                      placeholder="Personality name"
                    />
                  </div>
                  <div class="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      bind:value={editPersonalityData[personality.key].description}
                      placeholder="Short description"
                    />
                  </div>
                  <div class="form-group">
                    <label>System Prompt</label>
                    <textarea
                      rows={6}
                      bind:value={editPersonalityData[personality.key].system_prompt}
                      placeholder="Enter system prompt..."
                    ></textarea>
                  </div>
                  <div class="button-row">
                    <button class="btn btn-ghost" onclick={cancelEdit}>Cancel</button>
                    <button
                      class="btn btn-primary"
                      onclick={() => savePersonality(personality.key)}
                    >Save</button>
                  </div>
                </div>
              {:else}
                <div class="personality-info">
                  <div class="personality-meta">
                    <span class="personality-name">{personality.name}</span>
                    {#if builtInKeys.includes(personality.key)}
                      <span class="badge">Built-in</span>
                    {/if}
                    {#if personality.description}
                      <p class="personality-desc">{personality.description}</p>
                    {/if}
                  </div>
                  <div class="personality-actions">
                    <button
                      class="btn btn-icon"
                      onclick={() => startEditPersonality(personality)}
                      title="Edit personality"
                    >
                      Ã¢ÂÂÃ¯Â¸Â
                    </button>
                    {#if !builtInKeys.includes(personality.key)}
                      <button
                        class="btn btn-icon btn-icon-danger"
                        onclick={() => deletePersonality(personality.key)}
                        title="Delete personality"
                      >
                        Ã°ÂÂÂÃ¯Â¸Â
                      </button>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>

        {#if showAddPersonality}
          <div class="add-personality-form card-inner">
            <h3>Add Custom Personality</h3>
            <div class="form-group">
              <label for="new-p-key">Key (unique identifier)</label>
              <input
                id="new-p-key"
                type="text"
                bind:value={newPersonality.key}
                placeholder="e.g. my-assistant"
              />
            </div>
            <div class="form-group">
              <label for="new-p-name">Name</label>
              <input
                id="new-p-name"
                type="text"
                bind:value={newPersonality.name}
                placeholder="Display name"
              />
            </div>
            <div class="form-group">
              <label for="new-p-desc">Description</label>
              <input
                id="new-p-desc"
                type="text"
                bind:value={newPersonality.description}
                placeholder="Short description"
              />
            </div>
            <div class="form-group">
              <label for="new-p-prompt">System Prompt</label>
              <textarea
                id="new-p-prompt"
                rows={6}
                bind:value={newPersonality.system_prompt}
                placeholder="Enter system prompt..."
              ></textarea>
            </div>
            <div class="button-row">
              <button
                class="btn btn-ghost"
                onclick={() => {
                  showAddPersonality = false;
                  newPersonality = { key: '', name: '', description: '', system_prompt: '' };
                }}
              >Cancel</button>
              <button class="btn btn-primary" onclick={addPersonality}>Add Personality</button>
            </div>
          </div>
        {:else}
          <button
            class="btn btn-secondary"
            onclick={() => (showAddPersonality = true)}
          >
            + Add Custom Personality
          </button>
        {/if}
      </div>
    </section>

    <!-- Section 4: Danger Zone -->
    <section class="card card-danger">
      <div class="card-header">
        <h2 class="danger-title">Danger Zone</h2>
        <p class="card-desc">Irreversible actions -- proceed with caution</p>
      </div>
      <div class="card-body">
        <div class="danger-row">
          <div class="danger-info">
            <strong>Clear All Memory</strong>
            <p>Permanently delete all conversation memory and context. This cannot be undone.</p>
          </div>
          <button
            class="btn btn-danger"
            onclick={() => (showClearModal = true)}
          >
            Clear Memory
          </button>
        </div>
        <div class="divider"></div>
        <div class="danger-row">
          <div class="danger-info">
            <strong>Reset Settings</strong>
            <p>Reset all settings to their default values. Your API keys will be cleared.</p>
          </div>
          <button class="btn btn-danger" onclick={resetSettings}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </section>
  </div>
{/if}

<Modal bind:open={showClearModal} title="Clear All Memory">
  <div class="modal-body">
    <p>Are you sure you want to clear <strong>all conversation memory</strong>?</p>
    <p class="modal-warning">This action is permanent and cannot be undone. All stored context, history, and memory will be deleted.</p>
  </div>
  <div class="modal-footer">
    <button class="btn btn-ghost" onclick={() => (showClearModal = false)}>Cancel</button>
    <button class="btn btn-danger" onclick={clearMemory}>Yes, Clear Everything</button>
  </div>
</Modal>

<style>
  .settings-page {
    max-width: 760px;
    margin: 0 auto;
    padding: 2rem 1rem 4rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .page-header {
    margin-bottom: 0.5rem;
  }

  .page-header h1 {
    font-size: 1.875rem;
    font-weight: 700;
    margin: 0 0 0.25rem;
    color: var(--color-text-primary, #f1f5f9);
  }

  .subtitle {
    color: var(--color-text-secondary, #94a3b8);
    margin: 0;
    font-size: 0.95rem;
  }

  .card {
    background: var(--color-surface, #1e293b);
    border: 1px solid var(--color-border, #334155);
    border-radius: 0.75rem;
    overflow: hidden;
  }

  .card-danger {
    border-color: var(--color-danger-border, #ef4444);
  }

  .card-header {
    padding: 1.25rem 1.5rem 0;
  }

  .card-header h2 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 0.25rem;
    color: var(--color-text-primary, #f1f5f9);
  }

  .danger-title {
    color: var(--color-danger, #ef4444) !important;
  }

  .card-desc {
    font-size: 0.85rem;
    color: var(--color-text-secondary, #94a3b8);
    margin: 0 0 1rem;
  }

  .card-body {
    padding: 1rem 1.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .form-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-secondary, #94a3b8);
  }

  input[type='text'],
  input[type='password'],
  select,
  textarea {
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: var(--color-input-bg, #0f172a);
    border: 1px solid var(--color-border, #334155);
    border-radius: 0.5rem;
    color: var(--color-text-primary, #f1f5f9);
    font-size: 0.9rem;
    font-family: inherit;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }

  input[type='text']:focus,
  input[type='password']:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: var(--color-accent, #6366f1);
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }

  .button-row {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1.1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary {
    background: var(--color-accent, #6366f1);
    color: #fff;
    border-color: var(--color-accent, #6366f1);
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--color-accent-hover, #4f46e5);
    border-color: var(--color-accent-hover, #4f46e5);
  }

  .btn-secondary {
    background: transparent;
    color: var(--color-text-primary, #f1f5f9);
    border-color: var(--color-border, #334155);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--color-surface-hover, #334155);
  }

  .btn-ghost {
    background: transparent;
    color: var(--color-text-secondary, #94a3b8);
    border-color: transparent;
  }

  .btn-ghost:hover:not(:disabled) {
    background: var(--color-surface-hover, #334155);
  }

  .btn-danger {
    background: var(--color-danger, #ef4444);
    color: #fff;
    border-color: var(--color-danger, #ef4444);
  }

  .btn-danger:hover:not(:disabled) {
    background: #dc2626;
    border-color: #dc2626;
  }

  .btn-icon {
    background: transparent;
    border-color: transparent;
    padding: 0.35rem 0.5rem;
    font-size: 1rem;
    border-radius: 0.375rem;
  }

  .btn-icon:hover {
    background: var(--color-surface-hover, #334155);
  }

  .btn-icon-danger:hover {
    background: rgba(239, 68, 68, 0.15);
  }

  .btn-spinner {
    display: inline-block;
    width: 0.85rem;
    height: 0.85rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Toggle */
  .toggle-group {
    flex-direction: row;
    align-items: center;
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--color-text-primary, #f1f5f9);
    user-select: none;
  }

  .toggle-label input[type='checkbox'] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-track {
    display: inline-block;
    width: 2.5rem;
    height: 1.4rem;
    background: var(--color-border, #334155);
    border-radius: 9999px;
    position: relative;
    transition: background 0.2s;
    flex-shrink: 0;
  }

  .toggle-track::after {
    content: '';
    position: absolute;
    top: 0.15rem;
    left: 0.15rem;
    width: 1.1rem;
    height: 1.1rem;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.2s;
  }

  input[type='checkbox']:checked + .toggle-track {
    background: var(--color-accent, #6366f1);
  }

  input[type='checkbox']:checked + .toggle-track::after {
    transform: translateX(1.1rem);
  }

  .voice-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: var(--color-input-bg, #0f172a);
    border-radius: 0.5rem;
    border: 1px solid var(--color-border, #334155);
  }

  .radio-group-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-secondary, #94a3b8);
    margin: 0 0 0.4rem;
  }

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .radio-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--color-text-primary, #f1f5f9);
    cursor: pointer;
  }

  .radio-label input[type='radio'] {
    accent-color: var(--color-accent, #6366f1);
  }

  /* Personalities */
  .personalities-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .personality-item {
    background: var(--color-input-bg, #0f172a);
    border: 1px solid var(--color-border, #334155);
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
  }

  .personality-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .personality-meta {
    flex: 1;
    min-width: 0;
  }

  .personality-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--color-text-primary, #f1f5f9);
  }

  .personality-desc {
    font-size: 0.8rem;
    color: var(--color-text-secondary, #94a3b8);
    margin: 0.2rem 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .personality-actions {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .badge {
    display: inline-block;
    margin-left: 0.5rem;
    padding: 0.1rem 0.45rem;
    font-size: 0.7rem;
    font-weight: 600;
    background: rgba(99, 102, 241, 0.15);
    color: var(--color-accent, #6366f1);
    border-radius: 9999px;
    border: 1px solid rgba(99, 102, 241, 0.3);
  }

  .personality-edit-form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .add-personality-form {
    padding: 1rem;
    background: var(--color-input-bg, #0f172a);
    border: 1px solid var(--color-border, #334155);
    border-radius: 0.5rem;
  }

  .add-personality-form h3 {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 1rem;
    color: var(--color-text-primary, #f1f5f9);
  }

  .card-inner {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  /* Danger */
  .danger-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .danger-info {
    flex: 1;
  }

  .danger-info strong {
    font-size: 0.9rem;
    color: var(--color-text-primary, #f1f5f9);
  }

  .danger-info p {
    font-size: 0.8rem;
    color: var(--color-text-secondary, #94a3b8);
    margin: 0.2rem 0 0;
  }

  .divider {
    height: 1px;
    background: var(--color-border, #334155);
    margin: 0.25rem 0;
  }

  /* Loading */
  .loading-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 1rem;
    color: var(--color-text-secondary, #94a3b8);
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid var(--color-border, #334155);
    border-top-color: var(--color-accent, #6366f1);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  /* Modal */
  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem 0;
  }

  .modal-body p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-text-primary, #f1f5f9);
  }

  .modal-warning {
    color: var(--color-danger, #ef4444) !important;
    font-size: 0.85rem !important;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border, #334155);
  }
</style>

