<script lang="ts">
  interface Props {
    variant?: 'default' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    href?: string | undefined;
    onclick?: (() => void) | undefined;
  }

  let {
    variant = 'default',
    size = 'md',
    loading = false,
    disabled = false,
    type = 'button',
    href = undefined,
    onclick = undefined,
  }: Props = $props();

  const computedClass = $derived(
    ['btn', `btn--${variant}`, `btn--${size}`].join(' ')
  );

  const isDisabled = $derived(disabled || loading);
</script>

{#if href}
  <a
    {href}
    role="button"
    class={computedClass}
    aria-disabled={isDisabled}
    tabindex={isDisabled ? -1 : 0}
    onclick={isDisabled ? (e: MouseEvent) => e.preventDefault() : onclick}
  >
    {#if loading}
      <svg
        class="spinner"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="8"
          cy="8"
          r="6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-dasharray="28"
          stroke-dashoffset="10"
        />
      </svg>
    {/if}
    <slot />
  </a>
{:else}
  <button
    {type}
    class={computedClass}
    disabled={isDisabled}
    aria-disabled={isDisabled}
    aria-busy={loading}
    {onclick}
  >
    {#if loading}
      <svg
        class="spinner"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="8"
          cy="8"
          r="6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-dasharray="28"
          stroke-dashoffset="10"
        />
      </svg>
    {/if}
    <slot />
  </button>
{/if}

<style>
  .btn {
    --btn-bg: var(--color-primary, #6366f1);
    --btn-bg-hover: var(--color-primary-hover, #4f46e5);
    --btn-color: #ffffff;
    --btn-border: transparent;
    --btn-border-hover: transparent;
    --btn-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: inherit;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    border-radius: 0.375rem;
    border: 1px solid var(--btn-border);
    background-color: var(--btn-bg);
    color: var(--btn-color);
    cursor: pointer;
    text-decoration: none;
    box-shadow: var(--btn-shadow);
    transition:
      background-color 150ms ease,
      border-color 150ms ease,
      color 150ms ease,
      opacity 150ms ease,
      box-shadow 150ms ease;
    user-select: none;
    position: relative;
    outline: none;
  }

  .btn:focus-visible {
    outline: 2px solid var(--btn-bg);
    outline-offset: 2px;
  }

  .btn:hover:not(:disabled):not([aria-disabled='true']) {
    background-color: var(--btn-bg-hover);
    border-color: var(--btn-border-hover);
  }

  .btn:active:not(:disabled):not([aria-disabled='true']) {
    opacity: 0.9;
    transform: translateY(1px);
  }

  /* Disabled state */
  .btn:disabled,
  .btn[aria-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.55;
    pointer-events: none;
  }

  a.btn[aria-disabled='true'] {
    pointer-events: none;
    cursor: not-allowed;
    opacity: 0.55;
  }

  /* Variants */
  .btn--default {
    --btn-bg: var(--color-primary, #6366f1);
    --btn-bg-hover: var(--color-primary-hover, #4f46e5);
    --btn-color: #ffffff;
    --btn-border: transparent;
    --btn-border-hover: transparent;
  }

  .btn--ghost {
    --btn-bg: transparent;
    --btn-bg-hover: rgba(99, 102, 241, 0.08);
    --btn-color: var(--color-primary, #6366f1);
    --btn-border: var(--color-primary, #6366f1);
    --btn-border-hover: var(--color-primary, #6366f1);
    --btn-shadow: none;
  }

  .btn--danger {
    --btn-bg: var(--color-danger, #ef4444);
    --btn-bg-hover: var(--color-danger-hover, #dc2626);
    --btn-color: #ffffff;
    --btn-border: transparent;
    --btn-border-hover: transparent;
  }

  .btn--danger:focus-visible {
    outline-color: var(--color-danger, #ef4444);
  }

  .btn--success {
    --btn-bg: var(--color-success, #22c55e);
    --btn-bg-hover: var(--color-success-hover, #16a34a);
    --btn-color: #ffffff;
    --btn-border: transparent;
    --btn-border-hover: transparent;
  }

  .btn--success:focus-visible {
    outline-color: var(--color-success, #22c55e);
  }

  /* Sizes */
  .btn--sm {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
    min-height: 1.875rem;
  }

  .btn--md {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
    min-height: 2.25rem;
  }

  .btn--lg {
    font-size: 1rem;
    padding: 0.625rem 1.25rem;
    min-height: 2.75rem;
  }

  /* Spinner */
  .spinner {
    flex-shrink: 0;
    animation: spin 0.75s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>

