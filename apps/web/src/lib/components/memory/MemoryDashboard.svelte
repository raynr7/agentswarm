<script lang="ts">
  import { onMount } from 'svelte';
  import { memory } from '$lib/api';
  import { addToast } from '$lib/stores/toast';
  import type { Memory, WorkspaceFile } from '$lib/types';

  let { agentId }: { agentId: string } = $props();

  let activeTab: 'kv' | 'vector' | 'files' = $state('kv');
  let kvMemories: Memory[] = $state([]);
  let vectorMemories: Memory[] = $state([]);
  let files: WorkspaceFile[] = $state([]);
  let loading = $state(false);
  let searchQuery = $state('');
  let searching = $state(false);

  onMount(() => {
    loadKV();
  });

  async function loadKV() {
    loading = true;
    try {
      kvMemories = await memory.list(agentId, 'kv');
    } catch (e) {
      addToast('Failed to load KV memories', 'error');
    } finally {
      loading = false;
    }
  }

  async function loadVector() {
    loading = true;
    try {
      vectorMemories = await memory.list(agentId, 'vector');
    } catch (e) {
      addToast('Failed to load vector memories', 'error');
    } finally {
      loading = false;
    }
  }

  async function loadFiles() {
    loading = true;
    try {
      files = await memory.listFiles(agentId);
    } catch (e) {
      addToast('Failed to load files', 'error');
    } finally {
      loading = false;
    }
  }

  function switchTab(tab: 'kv' | 'vector' | 'files') {
    activeTab = tab;
    if (tab === 'kv' && !kvMemories.length) {
      loadKV();
    } else if (tab === 'vector' && !vectorMemories.length) {
      loadVector();
    } else if (tab === 'files' && !files.length) {
      loadFiles();
    }
  }

  async function deleteKV(id: string) {
    if (!confirm('Delete this memory?')) return;
    try {
      await memory.delete(agentId, id);
      addToast('Deleted', 'success');
      kvMemories = kvMemories.filter((m) => m.id !== id);
    } catch (e) {
      addToast('Failed to delete memory', 'error');
    }
  }

  async function deleteVector(id: string) {
    if (!confirm('Delete this memory?')) return;
    try {
      await memory.delete(agentId, id);
      addToast('Deleted', 'success');
      vectorMemories = vectorMemories.filter((m) => m.id !== id);
    } catch (e) {
      addToast('Failed to delete memory', 'error');
    }
  }

  async function deleteFile(id: string) {
    if (!confirm('Delete this memory?')) return;
    try {
      await memory.delete(agentId, id);
      addToast('Deleted', 'success');
      files = files.filter((f) => f.id !== id);
    } catch (e) {
      addToast('Failed to delete file', 'error');
    }
  }

  async function searchVector() {
    if (!searchQuery.trim()) return;
    searching = true;
    try {
      vectorMemories = await memory.search(agentId, searchQuery);
    } catch (e) {
      addToast('Search failed', 'error');
    } finally {
      searching = false;
    }
  }

  function formatBytes(n: number): string {
    if (n < 1024) return n + 'B';
    if (n < 1048576) return (n / 1024).toFixed(1) + 'KB';
    return (n / 1048576).toFixed(1) + 'MB';
  }

  function formatDate(s: string): string {
    return new Date(s).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<div class="memory-dashboard">
  <div class="tab-bar">
    <button
      class="tab"
      class:active={activeTab === 'kv'}
      onclick={() => switchTab('kv')}
    >
      KV Store
    </button>
    <button
      class="tab"
      class:active={activeTab === 'vector'}
      onclick={() => switchTab('vector')}
    >
      Vector Memory
    </button>
    <button
      class="tab"
      class:active={activeTab === 'files'}
      onclick={() => switchTab('files')}
    >
      Workspace Files
    </button>
  </div>

  <div class="tab-content">
    {#if activeTab === 'kv'}
      <div class="tab-panel">
        {#if loading}
          <table class="table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th>Created</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {#each [1, 2, 3] as _}
                <tr class="skeleton-row">
                  <td><div class="skeleton"></div></td>
                  <td><div class="skeleton"></div></td>
                  <td><div class="skeleton"></div></td>
                  <td><div class="skeleton skeleton-btn"></div></td>
                </tr>
              {/each}
            </tbody>
          </table>
        {:else if kvMemories.length === 0}
          <div class="empty-state">
            <p>No key-value memories stored</p>
          </div>
        {:else}
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                  <th>Created</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {#each kvMemories as m}
                  <tr>
                    <td class="mono">{m.key}</td>
                    <td class="truncate" style="max-width:240px">{m.value}</td>
                    <td>{formatDate(m.created_at)}</td>
                    <td>
                      <button
                        class="btn btn-danger btn-sm"
                        onclick={() => deleteKV(m.id)}
                      >ÃÂ</button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    {/if}

    {#if activeTab === 'vector'}
      <div class="tab-panel">
        <div class="search-bar">
          <input
            bind:value={searchQuery}
            placeholder="Search memories..."
            class="search-input"
            onkeydown={(e) => e.key === 'Enter' && searchVector()}
          />
          <button
            class="btn btn-ghost btn-sm"
            onclick={searchVector}
            disabled={searching}
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {#if loading}
          {#each [1, 2, 3] as _}
            <div class="memory-item card skeleton-card">
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text" style="width:60%"></div>
            </div>
          {/each}
        {:else if vectorMemories.length === 0}
          <div class="empty-state">
            <p>No vector memories stored yet</p>
          </div>
        {:else}
          {#each vectorMemories as m}
            <div class="memory-item card">
              <p class="memory-content">
                {m.content?.slice(0, 120)}{m.content && m.content.length > 120 ? '...' : ''}
              </p>
              {#if m.metadata}
                <div class="meta-tags">
                  {#each Object.keys(m.metadata) as key}
                    <span class="meta-tag">{key}</span>
                  {/each}
                </div>
              {/if}
              <div class="memory-footer">
                <span class="timestamp">{formatDate(m.created_at)}</span>
                <button
                  class="btn btn-danger btn-sm"
                  onclick={() => deleteVector(m.id)}
                >ÃÂ</button>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    {/if}

    {#if activeTab === 'files'}
      <div class="tab-panel">
        {#if loading}
          <table class="table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Size</th>
                <th>Type</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each [1, 2, 3] as _}
                <tr class="skeleton-row">
                  <td><div class="skeleton"></div></td>
                  <td><div class="skeleton"></div></td>
                  <td><div class="skeleton"></div></td>
                  <td><div class="skeleton"></div></td>
                  <td><div class="skeleton skeleton-btn"></div></td>
                </tr>
              {/each}
            </tbody>
          </table>
        {:else if files.length === 0}
          <div class="empty-state">
            <p>No workspace files</p>
          </div>
        {:else}
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Size</th>
                  <th>Type</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each files as f}
                  <tr>
                    <td>{f.filename}</td>
                    <td>{formatBytes(f.size)}</td>
                    <td class="mono" style="font-size:11px">{f.mime_type}</td>
                    <td>{formatDate(f.created_at)}</td>
                    <td style="display:flex;gap:6px">
                      <a
                        href="/api/memory/files/{f.id}/download"
                        class="btn btn-ghost btn-sm"
                      >Ã¢ÂÂ</a>
                      <button
                        class="btn btn-danger btn-sm"
                        onclick={() => deleteFile(f.id)}
                      >ÃÂ</button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .memory-dashboard {
    display: flex;
    flex-direction: column;
    gap: 0;
    height: 100%;
  }

  .tab-bar {
    display: flex;
    border-bottom: 1px solid var(--border);
    margin-bottom: 16px;
    gap: 0;
  }

  .tab {
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-muted, #888);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
    margin-bottom: -1px;
  }

  .tab:hover {
    color: var(--text-primary, #fff);
  }

  .tab.active {
    color: var(--accent, #6366f1);
    border-bottom-color: var(--accent, #6366f1);
  }

  .tab-content {
    flex: 1;
    overflow: auto;
  }

  .tab-panel {
    padding: 0;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .table th {
    text-align: left;
    padding: 8px 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted, #888);
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }

  .table td {
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-subtle, rgba(255,255,255,0.05));
    color: var(--text-primary, #e2e8f0);
    vertical-align: middle;
  }

  .table tr:hover td {
    background: var(--bg-hover, rgba(255,255,255,0.03));
  }

  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mono {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 12px;
  }

  .search-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .search-input {
    flex: 1;
    padding: 6px 10px;
    font-size: 13px;
    background: var(--bg-surface, #1e1e2e);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-primary, #e2e8f0);
    outline: none;
    transition: border-color 0.15s;
  }

  .search-input:focus {
    border-color: var(--accent, #6366f1);
  }

  .search-input::placeholder {
    color: var(--text-muted, #888);
  }

  .memory-item {
    margin-bottom: 8px;
    padding: 12px;
    background: var(--bg-surface, #1e1e2e);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .card {
    background: var(--bg-surface, #1e1e2e);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .memory-content {
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-primary, #e2e8f0);
    margin: 0;
  }

  .meta-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 6px;
  }

  .meta-tag {
    font-size: 10px;
    background: var(--bg-surface, #1e1e2e);
    border: 1px solid var(--border);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    color: var(--text-muted, #888);
  }

  .memory-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
  }

  .timestamp {
    font-size: 11px;
    color: var(--text-muted, #888);
  }

  .empty-state {
    padding: 40px 20px;
    text-align: center;
    color: var(--text-muted, #888);
    font-size: 13px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 5px 10px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 5px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: background 0.15s, opacity 0.15s;
    text-decoration: none;
    white-space: nowrap;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-sm {
    padding: 3px 8px;
    font-size: 12px;
    line-height: 1.4;
  }

  .btn-danger {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  .btn-danger:hover {
    background: rgba(239, 68, 68, 0.2);
  }

  .btn-ghost {
    background: transparent;
    border-color: var(--border);
    color: var(--text-secondary, #a0aec0);
  }

  .btn-ghost:hover {
    background: var(--bg-hover, rgba(255,255,255,0.06));
    color: var(--text-primary, #e2e8f0);
  }

  /* Skeleton loading */
  .skeleton {
    height: 14px;
    border-radius: 4px;
    background: linear-gradient(
      90deg,
      var(--bg-surface, #1e1e2e) 25%,
      var(--bg-hover, rgba(255,255,255,0.06)) 50%,
      var(--bg-surface, #1e1e2e) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    width: 80%;
  }

  .skeleton-btn {
    width: 24px;
    height: 24px;
    border-radius: 4px;
  }

  .skeleton-text {
    height: 13px;
    margin-bottom: 6px;
    width: 100%;
  }

  .skeleton-card {
    padding: 12px;
    margin-bottom: 8px;
  }

  .skeleton-row td {
    padding: 10px 12px;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
</style>

