<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="error-page">
  <div class="error-content">
    <div class="error-icon" aria-hidden="true">Ã¢ÂÂ Ã¯Â¸Â</div>

    <h1 class="error-code">Error {$page.status}</h1>

    <p class="error-message">{$page.error?.message ?? 'An unexpected error occurred.'}</p>

    {#if $page.error?.stack}
      <details class="stack-details">
        <summary>View stack trace</summary>
        <pre class="stack-trace">{$page.error.stack}</pre>
      </details>
    {/if}

    <div class="error-actions">
      <a href="/" class="btn btn-secondary"><- Back to Home</a>
      <button
        class="btn btn-primary"
        onclick={() => window.location.reload()}
      >
        Try Again
      </button>
    </div>
  </div>
</div>

<style>
  .error-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
    background: var(--color-bg, #f3f4f6);
  }

  .error-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.25rem;
    max-width: 540px;
    width: 100%;
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 16px;
    padding: 3rem 2.5rem;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
  }

  .error-icon {
    font-size: 3.5rem;
    line-height: 1;
    margin-bottom: 0.25rem;
  }

  .error-code {
    font-size: 2rem;
    font-weight: 800;
    color: var(--color-text-primary, #111);
    margin: 0;
  }

  .error-message {
    font-size: 1.05rem;
    color: var(--color-text-secondary, #555);
    margin: 0;
    line-height: 1.6;
  }

  .stack-details {
    width: 100%;
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 8px;
    overflow: hidden;
    text-align: left;
  }

  .stack-details summary {
    padding: 0.65rem 1rem;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    background: var(--color-surface-alt, #f9fafb);
    color: var(--color-text-primary, #111);
    user-select: none;
    list-style: none;
  }

  .stack-details summary::-webkit-details-marker {
    display: none;
  }

  .stack-details[open] summary {
    border-bottom: 1px solid var(--color-border, #e5e7eb);
  }

  .stack-trace {
    margin: 0;
    padding: 1rem;
    font-size: 0.78rem;
    line-height: 1.6;
    overflow-x: auto;
    background: var(--color-code-bg, #1e1e2e);
    color: var(--color-code-text, #cdd6f4);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .error-actions {
    display: flex;
    gap: 0.85rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 0.5rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.6rem 1.4rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
    cursor: pointer;
    border: none;
    transition: background 0.15s, opacity 0.15s;
  }

  .btn-primary {
    background: var(--color-primary, #6366f1);
    color: #fff;
  }

  .btn-primary:hover {
    opacity: 0.88;
  }

  .btn-secondary {
    background: var(--color-surface-alt, #f3f4f6);
    color: var(--color-text-primary, #111);
    border: 1px solid var(--color-border, #d1d5db);
  }

  .btn-secondary:hover {
    background: var(--color-border, #e5e7eb);
  }
</style>
