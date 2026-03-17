<script>
  import { onMount, fade } from 'svelte';
  import { api } from '$lib/api';

  let agents = [];
  let recentRuns = [];
  let loading = true;

  onMount(async () => {
    try {
      [agents, recentRuns] = await Promise.all([
        api.agents.list(),
        api.runs.list(),
      ]);
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      loading = false;
    }
  });

  function statusColor(status) {
    const colors = { active: 'bg-emerald-400', paused: 'bg-amber-400', draft: 'bg-slate-400' };
    return colors[status] || 'bg-slate-500';
  }

  function runStatusColor(status) {
    const colors = { 
      success: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', 
      fail: 'text-rose-400 bg-rose-400/10 border-rose-400/20', 
      running: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20 animate-pulse', 
      queued: 'text-slate-400 bg-slate-400/10 border-slate-400/20', 
      partial: 'text-amber-400 bg-amber-400/10 border-amber-400/20' 
    };
    return colors[status] || 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  }

  async function runAgent(id) {
    try {
      await api.agents.run(id);
      recentRuns = await api.runs.list();
    } catch (err) {
      alert('Failed to run agent: ' + err.message);
    }
  }
</script>

<div class="flex flex-col h-full space-y-6">
  
  <!-- Sleek Header -->
  <div class="flex items-center justify-between pb-4 border-b border-[var(--border-glass)]">
    <div>
      <h1 class="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">Swarm Dashboard</h1>
      <p class="text-sm text-[var(--text-secondary)] mt-1">Monitor and orchestrate your autonomous workforce.</p>
    </div>
    <a href="/agents/new" class="btn-primary-neon hidden sm:flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      Deploy Agent
    </a>
  </div>

  {#if loading}
    <div class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <div class="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <div class="text-[var(--text-secondary)] font-medium animate-pulse">Initializing Swarm...</div>
      </div>
    </div>
  {:else if agents.length === 0}
    <!-- Empty State -->
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="max-w-md w-full glass-panel rounded-3xl p-10 text-center relative overflow-hidden group">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div class="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center shadow-inner mb-6 border border-white/10">
          <span class="text-4xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">🤖</span>
        </div>
        
        <h2 class="text-2xl font-bold mb-3 tracking-tight">Zero Agents Online</h2>
        <p class="text-[var(--text-secondary)] mb-8 leading-relaxed">Your swarm is currently empty. Deploy your first autonomous agent to begin orchestrating workflows.</p>
        
        <a href="/agents/new" class="btn-primary-neon w-full justify-center group-hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
          Initialize First Agent
        </a>
      </div>
    </div>
  {:else}
    <div class="flex-1 overflow-y-auto pr-2 pb-8 space-y-8">
      
      <!-- Bento Grid: Active Agents -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold tracking-wide text-white/90">Active Roster</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {#each agents as agent}
            <!-- Agent Bento Card -->
            <div class="glass-panel p-5 rounded-2xl smooth-hover border border-[var(--border-glass)] group relative overflow-hidden flex flex-col h-full">
              <!-- Glow effect on hover -->
              <div class="absolute -inset-2 bg-gradient-to-r from-indigo-500/0 via-cyan-400/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 z-0"></div>
              
              <div class="relative z-10 flex flex-col h-full">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 shadow-inner flex items-center justify-center text-2xl group-hover:border-white/20 transition-colors">
                      {agent.icon || '🤖'}
                    </div>
                    <div>
                      <h3 class="font-bold text-[15px] truncate max-w-[120px] sm:max-w-full">{agent.name}</h3>
                      <div class="flex items-center gap-2 mt-0.5">
                        <span class="relative flex h-2 w-2">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full {statusColor(agent.status)} opacity-40"></span>
                          <span class="relative inline-flex rounded-full h-2 w-2 {statusColor(agent.status)}"></span>
                        </span>
                        <span class="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">{agent.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button class="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                  </button>
                </div>
                
                <p class="text-[13px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed flex-1">
                  {agent.goal || 'Awaiting prime directive...'}
                </p>
                
                <div class="mt-5 pt-4 border-t border-[var(--border-glass)] flex items-center gap-3">
                  <button
                    class="btn-fluent flex-1 text-xs justify-center gap-1.5 py-2 group/btn"
                    on:click|preventDefault|stopPropagation={() => runAgent(agent.id)}
                  >
                    <svg class="w-3.5 h-3.5 group-hover/btn:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Execute Run
                  </button>
                  <a href="/agents/{agent.id}" class="btn-fluent bg-transparent border-transparent text-[var(--text-tertiary)] hover:text-white hover:bg-white/5 py-2 px-3">
                    Details
                  </a>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </section>

      <!-- Recent Telemetry / Runs -->
      {#if recentRuns.length > 0}
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold tracking-wide text-white/90">System Telemetry</h2>
            <button class="text-xs text-indigo-400 hover:text-indigo-300 font-medium">View All Logs</button>
          </div>
          
          <div class="glass-panel rounded-2xl overflow-hidden border border-[var(--border-glass)]">
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead class="bg-black/20 text-[var(--text-tertiary)] text-xs uppercase tracking-wider">
                  <tr>
                    <th class="px-6 py-4 font-semibold">Agent Unit</th>
                    <th class="px-6 py-4 font-semibold">Execution Status</th>
                    <th class="px-6 py-4 font-semibold">Action Summary</th>
                    <th class="px-6 py-4 font-semibold text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[var(--border-glass)]">
                  {#each recentRuns.slice(0, 8) as run}
                    <tr class="hover:bg-white-[0.02] transition-colors group">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <span class="text-lg filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">{run.agent_icon || '🤖'}</span>
                          <span class="font-medium text-white/90">{run.agent_name || 'Unknown Protocol'}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide uppercase border {runStatusColor(run.status)}">
                          {run.status}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-[var(--text-secondary)] truncate max-w-[200px] lg:max-w-xs text-[13px]">
                          {run.outcome_summary || 'Awaiting telemetry...'}
                        </div>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <span class="text-[12px] font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors">
                          {new Date(run.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      {/if}
      
    </div>
  {/if}
</div>
