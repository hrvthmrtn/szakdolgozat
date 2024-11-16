<script lang="ts">
  import { supabase } from '../../supabaseClient.js';
  import type { User } from '@supabase/supabase-js';

  import { onMount } from 'svelte';

  let user: User | null = null; // A bejelentkezett felhasználó
  let username: string | null = null; // A felhasználónevet tároljuk
  let isLoading = true; // A betöltési állapot
  let currentPassword = ''; // Jelenlegi jelszó
  let newPassword = ''; // Új jelszó
  let confirmPassword = ''; // Új jelszó megerősítése
  let errorMessage = ''; // Hibák tárolása

  // On mount: lekérjük a bejelentkezett felhasználót és profilját
  onMount(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.log('Hiba a felhasználó lekérésekor:', error);
    } else {
      user = data?.user || null; // A felhasználó adatainak beállítása

      if (user) {
        // Profil adatainak lekérése
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Hiba a profil adatainak lekérésekor:', profileError);
        } else {
          username = profileData?.username || null;
        }
      }
    }
    isLoading = false;
  });

  // Jelszó módosítása
  async function handleChangePassword(event: Event) {
    event.preventDefault();

    // Ellenőrizzük, hogy a két jelszó megegyezik-e
    if (newPassword !== confirmPassword) {
      errorMessage = 'A két jelszó nem egyezik!';
      return;
    }

    try {
      // Jelenlegi jelszó ellenőrzése
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (loginError) {
        errorMessage = 'A jelenlegi jelszó helytelen!';
        return;
      }

      // Ha a jelenlegi jelszó helyes, módosíthatjuk az új jelszót
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        errorMessage = error.message;
      } else {
        alert('A jelszó sikeresen módosítva!');
      }
    } catch (error) {
      console.error('Hiba a jelszó módosítása során:', error);
      errorMessage = 'Hiba történt a jelszó módosításakor.';
    }
  }

  // Kijelentkezés
  async function handleLogout() {
    await supabase.auth.signOut();
    user = null;
    username = null;
  }
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-100">
  <div class="w-full max-w-md bg-white shadow-md rounded-lg p-6 space-y-4">
    {#if isLoading}
      <p>Betöltés...</p>
    {:else}
      {#if user}
        <h2 class="text-2xl font-semibold text-center text-gray-700">Profil</h2>

        <!-- Felhasználói információk -->
        <div class="space-y-4">
          <div class="text-lg text-gray-600">E-mail cím: {user?.email}</div>
          {#if username}
            <div class="text-lg text-gray-600">Felhasználónév: {username}</div>
          {/if}
        </div>

        <!-- Jelszó módosítása -->
        <form on:submit={handleChangePassword} class="space-y-4 mt-4">
          <h3 class="text-lg font-semibold">Jelszó módosítása</h3>
          {#if errorMessage}
            <div class="text-red-500 text-sm">{errorMessage}</div>
          {/if}
          <div>
            <label for="currentPassword" class="block text-sm font-medium text-gray-600">Jelenlegi jelszó</label>
            <input
              type="password"
              id="currentPassword"
              bind:value={currentPassword}
              required
              placeholder="Jelenlegi jelszó"
              class="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-600">Új jelszó</label>
            <input
              type="password"
              id="newPassword"
              bind:value={newPassword}
              required
              placeholder="Új jelszó"
              class="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-600">Új jelszó újra</label>
            <input
              type="password"
              id="confirmPassword"
              bind:value={confirmPassword}
              required
              placeholder="Új jelszó újra"
              class="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button type="submit" class="w-full px-4 py-2 text-white bg-primary hover:bg-primary-focus rounded-md">
            Jelszó módosítása
          </button>
        </form>

        <!-- Kijelentkezés -->
        <button on:click={handleLogout} class="w-full px-4 py-2 mt-4 text-white bg-red-600 hover:bg-red-700 rounded-md">
          Kijelentkezés
        </button>

      {:else}
        <p>Nem vagy bejelentkezve.</p>
      {/if}
    {/if}
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
