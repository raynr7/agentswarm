<script>
  import { page } from '$app/stores';
  
  let sidebarOpen = false;
  
  const navItems = [
    { href: '/', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/agents', label: 'Swarm', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { href: '/canvas', label: 'Canvas', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
    { href: '/tasks', label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { href: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
  ];
</script>

<!-- Ambient Aurora Orbs (AgentZero styling base) -->
<div class="aurora-bg-element w-[600px] h-[600px] bg-indigo-500/20 top-[-200px] left-[-200px]"></div>
<div class="aurora-bg-element w-[500px] h-[500px] bg-cyan-500/20 bottom-[-100px] right-[-100px]" style="animation-direction: reverse;"></div>

<div class="flex h-screen w-full overflow-hidden text-[#f8fafc] max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 gap-6 z-10 relative">
  
  <!-- Sleek Floating Sidebar -->
  <aside 
    class="hidden lg:flex flex-col w-[260px] glass-nav rounded-[24px] shadow-2xl overflow-hidden animate-slide-in relative group"
  >
    <!-- Top Branding -->
    <div class="p-6 flex items-center gap-3 border-b border-[var(--border-glass)]">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-neon">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
      </div>
      <div>
        <h1 class="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">AgentSwarp</h1>
      </div>
    </div>

    <!-- Navigation List -->
    <nav class="flex-1 py-6 px-4 space-y-2">
      {#each navItems as item}
        <a 
          href={item.href}
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group/link"
          class:bg-white={ $page.url.pathname === item.href }
          class:bg-opacity-10={ $page.url.pathname === item.href }
          class:text-white={ $page.url.pathname === item.href }
          class:text-gray-400={ $page.url.pathname !== item.href }
          class:hover:text-white={ $page.url.pathname !== item.href }
          class:hover:bg-white={ $page.url.pathname !== item.href }
          class:hover:bg-opacity-5={ $page.url.pathname !== item.href }
        >
          {#if $page.url.pathname === item.href}
            <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.6)]"></div>
          {/if}
          <svg class="w-5 h-5 transition-transform duration-300 group-hover/link:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon}></path></svg>
          <span class="font-medium tracking-wide text-[15px]">{item.label}</span>
        </a>
      {/each}
    </nav>
    
    <!-- User Profile Footer -->
    <div class="p-4 mt-auto">
      <div class="p-3 rounded-2xl bg-white bg-opacity-5 border border-white border-opacity-10 flex items-center gap-3 cursor-pointer smooth-hover">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="User" class="w-10 h-10 rounded-full bg-gray-800" />
        <div class="flex-1 overflow-hidden">
          <p class="text-sm font-semibold truncate">Admin User</p>
          <p class="text-xs text-gray-400 truncate">Swarp OS v3</p>
        </div>
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
      </div>
    </div>
  </aside>

  <!-- Main Workspace Area -->
  <main class="flex-1 flex flex-col min-w-0 h-full">
    
    <!-- Mobile Header (Visible only on small screens) -->
    <header class="lg:hidden glass-panel rounded-2xl mb-4 p-4 flex justify-between items-center z-20">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <span class="font-bold">AgentSwarp</span>
      </div>
      <button on:click={() => sidebarOpen = !sidebarOpen} class="p-2 rounded-lg bg-white/5">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>
    </header>

    <!-- Content Slot container - the "Canvas" area -->
    <div class="flex-1 overflow-hidden rounded-[24px] glass-panel p-6 sm:p-8 animate-fade-up flex flex-col relative">
      <slot />
    </div>

  </main>
</div>

<style>
  :global(#svelte) {
    height: 100%;
    width: 100%;
  }
</style>
