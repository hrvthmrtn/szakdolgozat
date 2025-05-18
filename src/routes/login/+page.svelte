<script lang="ts">
      import { supabase } from '../../supabaseClient.js';
      import { goto } from '$app/navigation';
    
      let email = '';
      let password = '';
      let errorMessage = '';
    

      async function handleLogin(event: Event) {
        event.preventDefault();    

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
    
        if (error) {
          errorMessage = error.message;
          console.error("Hiba a bejelentkezésnél:", error.message);
          return;
        }

        if (data?.user) {
          const user = data.user;
          console.log("Bejelentkezett felhasználó:", user);
          goto('/');
        } else {
          errorMessage = 'Hiba: A felhasználó nem található.';
          console.log("A felhasználó nem található.");
        }
      }
    </script>
    
    <svelte:head>
      <title>Iskolai nyilvántartó - Bejelentkezés</title>
      </svelte:head>

    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="w-full max-w-md bg-white shadow-md rounded-lg p-6 space-y-4">
    
        <h2 class="text-2xl font-semibold text-center text-gray-700">Belépés</h2>
    
    
        <form on:submit={handleLogin} class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-600">E-mail</label>
            <input
              type="email"
              id="email"
              bind:value={email}
              required
              placeholder="Email"
              class="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
    
          <div>
            <label for="password" class="block text-sm font-medium text-gray-600">Jelszó</label>
            <input
              type="password"
              id="password"
              bind:value={password}
              required
              placeholder="Jelszó"
              class="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
    
          {#if errorMessage}
            <div class="text-red-500 text-sm">{errorMessage}</div>
          {/if}
    
          <button type="submit" class="w-full px-4 py-2 text-white bg-primary hover:bg-primary-focus rounded-md">
            Belépés
          </button>
        </form>
    
        <p class="text-sm text-center text-gray-600 mt-4">
          Nincs még fiókod? 
          <a href="/register" class="text-primary hover:underline font-medium">Regisztrálj itt</a>
        </p>
      </div>
    </div>
    
    <style>
      .bg-primary {
        background-color: #4CAF50;
      }
    
      .bg-primary-focus {
        background-color: #45a049;
      }
    
      .focus\:ring-primary {
        --tw-ring-color: #4CAF50;
      }
    </style>
    