<script lang="ts">
	import { supabase } from '../supabaseClient.js';
	import '../app.css';
	import { onMount } from 'svelte';
    
	let navLinks = [
	  { name: "Főoldal", href: "/" },
	  { name: "Hírek", href: "/news" },
	  { name: "Események", href: "/events" },
	  { name: "Profil", href: "/profile" },
	  { name: "Kapcsolat", href: "/contacts" },
	];
    
	let isMenuOpen = false;
	let isLoggedIn = false;
	let userEmail = '';
    
	function toggleMenu() {
	  isMenuOpen = !isMenuOpen;
	}
    
	async function handleLogout() {
	  await supabase.auth.signOut();
	  isLoggedIn = false;
	}
    
	onMount(async () => {
	  const { data, error } = await supabase.auth.getUser();
	  if (error) {
	    console.error('Hiba a felhasználó lekérésekor:', error);
	  } else {
	    if (data?.user) {
		isLoggedIn = true;
		userEmail = data.user.email || '';
	    }
	  }
	});
    </script>
    
    <!-- Navbar -->
    <nav class="navbar bg-base-100 shadow-lg">
	<!-- Bal oldal: cím -->
	<div class="navbar-start">
	  <a href="/" class="text-xl font-bold px-4">Iskolai nyilvántartó</a>
	</div>
    
	<!-- Középső rész: Navigációs linkek nagy képernyőn -->
	<div class="navbar-center hidden lg:flex">
	  <ul class="menu menu-horizontal p-0">
	    {#each navLinks as link}
		<li><a href={link.href} class="font-semibold text-gray-700 hover:text-primary">{link.name}</a></li>
	    {/each}
    
	    <!-- Statistics és Data linkek csak bejelentkezett felhasználóknak -->
	    {#if isLoggedIn}
		<li><a href="/statistics" class="font-semibold text-gray-700 hover:text-primary">Statisztika</a></li>
		<li><a href="/data" class="font-semibold text-gray-700 hover:text-primary">Továbbtanulási űrlap</a></li>
		<li><button on:click={handleLogout} class="font-semibold text-gray-700 hover:text-primary">Kijelentkezés</button></li>
	    {:else}
		<li><a href="/login" class="font-semibold text-gray-700 hover:text-primary">Belépés</a></li>
	    {/if}
	  </ul>
	</div>
    
	<!-- Jobb oldal: Mobil menü -->
	<div class="navbar-end lg:hidden">
	  <button class="btn btn-ghost btn-circle" on:click={toggleMenu} aria-label="Toggle menu">
	    <!-- ikon -->
	    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
	    </svg>
	  </button>
	</div>
    </nav>
    
    <!-- Mobil lenyíló menü -->
    {#if isMenuOpen}
	<div class="lg:hidden bg-base-100 shadow-lg">
	  <ul class="menu menu-vertical p-2">
	    {#each navLinks as link}
		<li>
		  <a href={link.href} class="block px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200" on:click={() => (isMenuOpen = false)}>
		    {link.name}
		  </a>
		</li>
	    {/each}
    
	    <!-- Statistics és Data linkek csak bejelentkezett felhasználóknak mobil menüben -->
	    {#if isLoggedIn}
		<li><a href="/statistics" class="block px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200" on:click={() => (isMenuOpen = false)}>Statisztika</a></li>
		<li><a href="/data" class="block px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200" on:click={() => (isMenuOpen = false)}>Továbbtanulási űrlap</a></li>
		<li><button on:click={handleLogout} class="block px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200">Kijelentkezés</button></li>
	    {:else}
		<li><a href="/login" class="block px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200">Belépés</a></li>
	    {/if}
	  </ul>
	</div>
    {/if}
    
    <!-- Oldalak tartalma -->
    <main class="p-4">
	<slot />
    </main>
    
