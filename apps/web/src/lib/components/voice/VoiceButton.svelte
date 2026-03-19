<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { addToast } from '$lib/stores/toast';

  let {
    onTranscript = () => {},
    ttsText = null,
    class: className = ''
  }: {
    onTranscript?: (text: string) => void;
    ttsText?: string | null;
    class?: string;
  } = $props();

  let supported = $state(false);
  let recording = $state(false);
  let speaking = $state(false);
  let muted = $state(false);

  let recognition: any = null;

  function initRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      onTranscript(event.results[0][0].transcript);
    };
    recognition.onerror = () => {
      addToast('Voice recognition error', 'error');
      recording = false;
    };
    recognition.onend = () => {
      recording = false;
    };
  }

  function startRecording() {
    if (!recognition) initRecognition();
    recognition.start();
    recording = true;
    setTimeout(() => {
      if (recording) stopRecording();
    }, 10000);
  }

  function stopRecording() {
    recognition?.stop();
    recording = false;
  }

  function toggleRecording() {
    recording ? stopRecording() : startRecording();
  }

  $effect(() => {
    if (ttsText && !muted) {
      const utt = new SpeechSynthesisUtterance(ttsText);
      speaking = true;
      utt.onend = () => {
        speaking = false;
      };
      window.speechSynthesis?.speak(utt);
    }
  });

  onMount(() => {
    supported =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  });

  onDestroy(() => {
    recognition?.stop();
    window.speechSynthesis?.cancel();
  });
</script>

{#if supported}
  <div class="voice-controls {className}">
    <button
      class="btn btn-ghost voice-btn"
      class:recording
      onclick={toggleRecording}
      title={recording ? 'Stop listening' : 'Start voice input'}
    >
      {#if recording}
        Ã°ÂÂÂ
      {:else}
        Ã°ÂÂÂ¤
      {/if}
    </button>

    <button
      class="btn btn-ghost voice-btn"
      onclick={() => (muted = !muted)}
      title={muted ? 'Unmute TTS' : 'Mute TTS'}
    >
      {muted ? 'Ã°ÂÂÂ' : 'Ã°ÂÂÂ'}
    </button>

    {#if speaking}
      <span class="speaking-indicator">Ã¢ÂÂ</span>
    {/if}
  </div>
{/if}

<style>
  .voice-controls {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .voice-btn {
    padding: 6px;
    font-size: 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: box-shadow 0.2s ease;
  }

  .voice-btn.recording {
    box-shadow: 0 0 0 4px rgba(255, 68, 68, 0.3);
    animation: pulse 1s infinite;
  }

  .speaking-indicator {
    color: var(--accent, #7c3aed);
    animation: pulse 1s infinite;
    font-size: 10px;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>

