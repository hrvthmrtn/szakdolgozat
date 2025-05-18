<script lang="ts">
  import { supabase } from '../../supabaseClient.js';
  import type { User } from '@supabase/supabase-js';
  import { onMount } from 'svelte';

  let user: User | null = null;
  let username: string | null = null;
  let isLoading = true;
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';
  let errorMessage = '';

  onMount(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Hiba a felhasználó lekérésekor:', error);
    } else {
      user = data?.user || null;

      if (user) {
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

  async function handleChangePassword(event: Event) {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      errorMessage = 'A két jelszó nem egyezik!';
      return;
    }

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (loginError) {
        errorMessage = 'A jelenlegi jelszó helytelen!';
        return;
      }

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

  async function handleLogout() {
    await supabase.auth.signOut();
    user = null;
    username = null;
  }
</script>

<svelte:head>
  <title>Iskolai nyilvántartó - Profil</title>
  </svelte:head>

<div class="flex items-center justify-center min-h-screen bg-gray-100">
  <div class="profile-box">
    {#if isLoading}
      <p class="text-center text-gray-600">Betöltés...</p>
    {:else}
      {#if user}
        <h2 class="text-4xl font-bold text-center text-gray-800 mb-8">Felhasználói Profil</h2>

   
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-600">Email</h3>
          <p class="text-2xl text-gray-800 mt-2">{user?.email}</p>
        </div>

      
        {#if username}
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-600">Felhasználónév</h3>
            <p class="text-2xl text-gray-800 mt-2">{username}</p>
          </div>
        {/if}

        
        <form on:submit={handleChangePassword} class="space-y-6 mt-8">
          <h3 class="text-2xl font-semibold text-gray-800">Jelszó Módosítása</h3>
          {#if errorMessage}
            <div class="bg-red-100 text-red-700 p-2 rounded-md text-sm">{errorMessage}</div>
          {/if}
          <div>
            <label for="currentPassword" class="block text-sm font-semibold text-gray-600">Jelenlegi jelszó</label>
            <input
              type="password"
              id="currentPassword"
              bind:value={currentPassword}
              required
              placeholder="Jelenlegi jelszó"
              class="input-field"
            />
          </div>
          <div>
            <label for="newPassword" class="block text-sm font-semibold text-gray-600">Új jelszó</label>
            <input
              type="password"
              id="newPassword"
              bind:value={newPassword}
              required
              placeholder="Új jelszó"
              class="input-field"
            />
          </div>
          <div>
            <label for="confirmPassword" class="block text-sm font-semibold text-gray-600">Új jelszó újra</label>
            <input
              type="password"
              id="confirmPassword"
              bind:value={confirmPassword}
              required
              placeholder="Új jelszó újra"
              class="input-field"
            />
          </div>
          <button type="submit" class="btn-primary">Jelszó Módosítása</button>
        </form>

        <button on:click={handleLogout} class="btn-danger">Kijelentkezés</button>

      {:else}
        <p class="text-center text-gray-700">Nem vagy bejelentkezve.</p>
      {/if}
    {/if}
  </div>
</div>

<style>
  body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    background: #f0f4f8;
    margin: 0;
  }

  .profile-box {
    width: 90%;
    max-width: 800px;
    padding: 2rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .card {
    margin: 1rem auto;
    padding: 1.5rem;
    background: #f9f9f9;
    border-radius: 0.75rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }

  .input-field {
    width: 100%;
    padding: 0.75rem 1rem;
    margin-top: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    font-size: 1rem;
    transition: border-color 0.3s, box-shadow 0.2s;
  }

  .input-field:focus {
    border-color: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
    outline: none;
  }

  .btn-primary {
    width: 100%;
    padding: 0.75rem;
    background: #4CAF50;
    color: white;
    font-weight: bold;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
  }

  .btn-primary:hover {
    background: #45a049;
    transform: translateY(-2px);
  }

  .btn-danger {
    width: 100%;
    padding: 0.75rem;
    background: #f44336;
    color: white;
    font-weight: bold;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
    margin-top: 1rem;
  }

  .btn-danger:hover {
    background: #e53935;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    .profile-box {
      padding: 1.5rem;
    }
  }
</style>
