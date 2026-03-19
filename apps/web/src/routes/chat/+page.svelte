<script lang="ts">
  import { onMount } from 'svelte'
  import { addToast } from '$lib/stores/toast.ts'
  import * as api from '$lib/api.ts'
  import type { Agent } from '$lib/types.ts'

  interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }

  let messages = $state<Message[]>([])
  let input = $state('')
  let sending = $state(false)
  let agentId = $state('')
  let agents = $state<Agent[]>([])
  let messagesEl = $state<HTMLDivElement | null>(null)
  let textareaEl = $state<HTMLTextAreaElement | null>(null)

  onMount(async () => {
    try {
      agents = await api.agents.list()
      if (agents.length > 0) agentId = agents[0].id
    } catch {
      addToast('Failed to load agents', 'error')
    }
  })

  function formatTime(d: Date): string {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  function nanoid(): string {
    return Math.random().toString(36).slice(2, 10)
  }

  async function send() {
    if (!input.trim() || sending || !agentId) return
    const content = input.trim()
    input = ''
    resizeTextarea()

    messages = [...messages, { id: nanoid(), role: 'user', content, timestamp: new Date() }]
    scrollToBottom()
    sending = true

    try {
      const res = await fetch(`/api/agents/${agentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('agentswarp-token') ?? ''}` },
        body: JSON.stringify({ message: content })
      })
      if (res.status === 404) {
        addToast('This agent does not support chat yet', 'warning')
        return
      }
      if (!res.ok) throw new Error('Chat failed')
      const data = await res.json() as { reply: string }
      messages = [...messages, { id: nanoid(), role: 'assistant', content: data.reply, timestamp: new Date() }]
      scrollToBottom()
    } catch {
      addToast('Failed to get response', 'error')
    } finally {
      sending = false
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function resizeTextarea() {
    if (!textareaEl) return
    textareaEl.style.height = 'auto'
    textareaEl.style.height = Math.min(textareaEl.scrollHeight, 144) + 'px'
  }

  function scrollToBottom() {
    setTimeout(() => messagesEl?.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' }), 50)
  }
</script>

<div class="chat-page">
  <div class="chat-header">
    <span class="label">Talk to:</span>
    <select bind:value={agentId} class="agent-select">
      {#each agents as agent}
        <option value={agent.id}>{agent.name}</option>
      {/each}
      {#if agents.length === 0}
        <option disabled>No agents yet</option>
      {/if}
    </select>
  </div>

  <div class="messages" bind:this={messagesEl}>
    {#if messages.length === 0}
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="28" r="20" stroke="#ccc" stroke-width="2"/>
          <circle cx="24" cy="26" r="3" fill="#ccc"/>
          <circle cx="40" cy="26" r="3" fill="#ccc"/>
          <path d="M24 34 Q32 40 40 34" stroke="#ccc" stroke-width="2" fill="none" stroke-linecap="round"/>
          <path d="M20 48 L14 58 M44 48 L50 58" stroke="#ccc" stroke-width="2" stroke-linecap="round"/>
          <rect x="22" y="6" width="20" height="6" rx="3" fill="#ccc"/>
        </svg>
        <p>Start a conversation</p>
        <span>Select an agent and send a message</span>
      </div>
    {/if}

    {#each messages as msg (msg.id)}
      <div class="message {msg.role} slide-up">
        <div class="bubble">{msg.content}</div>
        <span class="time">{formatTime(msg.timestamp)}</span>
      </div>
    {/each}

    {#if sending}
      <div class="message assistant">
        <div class="bubble typing">
          <span></span><span></span><span></span>
        </div>
      </div>
    {/if}
  </div>

  <div class="input-bar">
    <div class="input-wrap">
      <textarea
        bind:this={textareaEl}
        bind:value={input}
        oninput={resizeTextarea}
        onkeydown={handleKeydown}
        placeholder="Message the agent... (Enter to send, Shift+Enter for newline)"
        rows="1"
        disabled={sending || !agentId}
      ></textarea>
      <button class="send-btn btn btn-default" onclick={send} disabled={sending || !input.trim() || !agentId} title="Send">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M14 2L2 7l5 2 2 5 5-12z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  </div>
</div>

<style>
  .chat-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 48px);
    max-width: 760px;
    margin: 0 auto;
    position: relative;
  }

  .chat-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 0 12px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .chat-header .label {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
  }

  .agent-select {
    width: auto;
    min-width: 160px;
    font-size: 13px;
    padding: 4px 28px 4px 10px;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 24px 0 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 12px;
    color: var(--text-muted);
    padding: 60px 0;
  }

  .empty-state p {
    font-size: 16px;
    font-weight: 500;
    color: var(--text);
    margin: 0;
  }

  .empty-state span {
    font-size: 13px;
    color: var(--text-muted);
  }

  .message {
    display: flex;
    flex-direction: column;
    gap: 4px;
    animation: slideUp 150ms ease forwards;
  }

  .message.user {
    align-items: flex-end;
  }

  .message.assistant {
    align-items: flex-start;
  }

  .bubble {
    padding: 10px 16px;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .message.user .bubble {
    background: #18181b;
    color: #ffffff;
    border-radius: 18px 18px 4px 18px;
    max-width: 70%;
  }

  .message.assistant .bubble {
    background: #ffffff;
    color: #111111;
    border: 1px solid #e5e5e5;
    border-radius: 18px 18px 18px 4px;
    max-width: 80%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }

  .time {
    font-size: 11px;
    color: var(--text-muted);
    padding: 0 4px;
  }

  .typing {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 14px 16px;
  }

  .typing span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #aaa;
    animation: pulseDot 1s infinite;
  }

  .typing span:nth-child(2) { animation-delay: 0.2s; }
  .typing span:nth-child(3) { animation-delay: 0.4s; }

  .input-bar {
    position: sticky;
    bottom: 0;
    background: var(--bg);
    border-top: 1px solid var(--border);
    padding: 12px 0 16px;
    flex-shrink: 0;
  }

  .input-wrap {
    position: relative;
  }

  .input-wrap textarea {
    padding: 10px 48px 10px 16px;
    border-radius: 12px;
    border: 1px solid var(--border);
    font-size: 14px;
    line-height: 1.5;
    resize: none;
    min-height: 44px;
    max-height: 144px;
    transition: border-color 150ms;
  }

  .input-wrap textarea:focus {
    border-color: var(--text-muted);
    box-shadow: none;
  }

  .send-btn {
    position: absolute;
    right: 8px;
    bottom: 8px;
    width: 32px;
    height: 32px;
    padding: 0;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 768px) {
    .chat-page { max-width: 100%; padding: 0 16px; }
    .message.user .bubble { max-width: 85%; }
    .message.assistant .bubble { max-width: 90%; }
  }
</style>