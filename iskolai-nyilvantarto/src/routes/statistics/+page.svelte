<!-- Data.svelte -->
<script lang="ts">
      import { supabase } from '../../supabaseClient.js';
      import { onMount } from 'svelte';
      import { goto } from '$app/navigation';
    
      onMount(async () => {
        const { data, error } = await supabase.auth.getUser();
    
        if (error || !data?.user) {
          console.error('Hozzáférés megtagadva. Kérjük, jelentkezzen be.');
          goto('/login'); // Átirányítás a bejelentkezési oldalra
        }
      });
    </script>
    
    <main>
      
    </main>
    