<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';

  interface Props {
    open?: boolean;
    title?: string;
    children?: import('svelte').Snippet;
    footer?: import('svelte').Snippet;
  }

  let {
    open = $bindable(false),
    title = '',
    children,
    footer,
  }: Props = $props();

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open) {
      open = false;
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="modal-backdrop"
    transition:fade={{ duration: 150 }}
    onclick={() => (open = false)}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div
      class="modal-box"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      transition:scale={{ start: 0.95, duration: 150 }}
      onclick={(e) => e.stopPropagation()}
    >
      <div class="modal-header">
        <h2 id="modal-title">{title}</h2>
        <button
          class="btn-ghost btn-sm close-btn"
          onclick={() => (open = false)}
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>

      <div class="modal-body">
        {@render children?.()}
      </div>

      {#if footer}
        <div class="modal-footer">
          {@render footer?.()}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-box {
    position: relative;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 8px;
    min-width: 400px;
    max-width: 560px;
    width: 90%;
    z-index: 1001;
    padding: 0;
  }

  .modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h2 {
    font-size: 15px;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    padding: 4px 8px;
    border-radius: 4px;
    color: var(--text-muted, inherit);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease;
  }

  .close-btn:hover {
    background: var(--bg-hover, rgba(255, 255, 255, 0.08));
  }

  .modal-body {
    padding: 20px;
    overflow-y: auto;
    max-height: 60vh;
  }

  .modal-footer {
    padding: 12px 20px;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>

