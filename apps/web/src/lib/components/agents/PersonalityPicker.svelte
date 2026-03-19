<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { settings } from '$lib/api';
  import { addToast } from '$lib/stores/toast';
  import type { Personality } from '$lib/types';

  let value: string = $bindable('default');

  let personalities: Personality[] = $state([]);
  let showAddForm = $state(false);
  let newPersonality = $state({ key: '', name: '', description: '', systemPrompt: '' });
  let saving = $state(false);

  const dispatch = createEventDispatcher();

  const selected = $derived(personalities.find((p) => p.key === value));

  onMount(async () => {
    try {
      const result = await settings.getPersonalities();
      personalities = result;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to load personalities.' });
    }
  });

  function handleChange() {
    dispatch('change', value);
  }

  async function handleSave() {
    if (!newPersonality.key || !newPersonality.name) {
      addToast({ type: 'error', message: 'Key and Name are required.' });
      return;
    }
    saving = true;
    try {
      await settings.addPersonality(newPersonality);
      personalities = [...personalities, { ...newPersonality }];
      value = newPersonality.key;
      dispatch('change', value);
      showAddForm = false;
      newPersonality = { key: '', name: '', description: '', systemPrompt: '' };
      addToast({ type: 'success', message: 'Personality added successfully.' });
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to save personality.' });
    } finally {
      saving = false;
    }
  }

  function handleCancel() {
    showAddForm = false;
    newPersonality = { key: '', name: '', description: '', systemPrompt: '' };
  }
</script>

<div class="input-group">
  <label class="label" for="personality-select">Personality</label>

  <select
    id="personality-select"
    bind:value
    onchange={handleChange}
  >
    {#each personalities as p (p.key)}
      <option value={p.key}>{p.name} -- {p.description}</option>
    {/each}
  </select>

  {#if selected}
    <div class="preview">
      <pre class="mono">{selected.systemPrompt}</pre>
    </div>
  {/if}

  <button
    type="button"
    class="btn btn-ghost btn-sm add-btn"
    onclick={() => (showAddForm = !showAddForm)}
  >
    Ã¯Â¼Â Add Custom
  </button>

  {#if showAddForm}
    <div class="add-form">
      <div class="form-field">
        <label for="new-key">Key</label>
        <input
          id="new-key"
          type="text"
          bind:value={newPersonality.key}
          placeholder="e.g. my-personality"
        />
      </div>

      <div class="form-field">
        <label for="new-name">Name</label>
        <input
          id="new-name"
          type="text"
          bind:value={newPersonality.name}
          placeholder="e.g. My Personality"
        />
      </div>

      <div class="form-field">
        <label for="new-description">Description</label>
        <input
          id="new-description"
          type="text"
          bind:value={newPersonality.description}
          placeholder="Short description"
        />
      </div>

      <div class="form-field">
        <label for="new-system-prompt">System Prompt</label>
        <textarea
          id="new-system-prompt"
          rows={5}
          bind:value={newPersonality.systemPrompt}
          placeholder="Enter the system prompt..."
        ></textarea>
      </div>

      <div class="button-row">
        <button
          type="button"
          class="btn btn-success btn-sm"
          onclick={handleSave}
          disabled={saving}
        >
          {#if saving}
            Saving...
          {:else}
            Save
          {/if}
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          onclick={handleCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .input-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted, #888);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  select {
    width: 100%;
    padding: 6px 10px;
    border-radius: 4px;
    border: 1px solid var(--border, #333);
    background: var(--bg-surface, #1a1a1a);
    color: var(--text, #eee);
    font-size: 13px;
    cursor: pointer;
    outline: none;
    transition: border-color 0.15s;
  }

  select:focus {
    border-color: var(--accent, #7c6bff);
  }

  .preview {
    background: var(--bg-surface, #1a1a1a);
    padding: 10px;
    border-radius: 4px;
    font-size: 11px;
    max-height: 100px;
    overflow-y: auto;
    border: 1px solid var(--border, #333);
  }

  .preview pre.mono {
    margin: 0;
    font-family: 'Fira Code', 'Courier New', monospace;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--text-muted, #aaa);
    font-size: 11px;
  }

  .add-btn {
    align-self: flex-start;
    margin-top: 2px;
  }

  .add-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    background: var(--bg-surface, #1a1a1a);
    border: 1px solid var(--border, #333);
    border-radius: 6px;
    animation: slideDown 0.15s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .form-field label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted, #888);
  }

  .form-field input,
  .form-field textarea {
    width: 100%;
    padding: 6px 10px;
    border-radius: 4px;
    border: 1px solid var(--border, #333);
    background: var(--bg, #111);
    color: var(--text, #eee);
    font-size: 13px;
    outline: none;
    resize: vertical;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }

  .form-field input:focus,
  .form-field textarea:focus {
    border-color: var(--accent, #7c6bff);
  }

  .button-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
</style>

