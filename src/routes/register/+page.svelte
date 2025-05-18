<script lang="ts">
  import { supabase } from '../../supabaseClient.js';
  import bcrypt from 'bcryptjs';

  let email = '';
  let username = '';
  let password = '';
  let confirmPassword = '';


  async function handleRegister(event: Event) {
    event.preventDefault(); 

    if (password !== confirmPassword) {
      alert('A két jelszó nem egyezik!');
      return;
    }

    try {
    
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (data?.user) {
        const userId = data.user.id;
     
        const hashedPassword = await bcrypt.hash(password, 10);

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId, 
              email: email,
              username: username,
              password: hashedPassword,
            },
          ]);

        if (profileError) {
          console.error('Hiba a profil mentésekor:', profileError);
          alert('Hiba történt a profil mentése során!');
        } else {
          alert('Sikeres regisztráció és profil létrehozás!');
        }
      } else {
        alert('Nem található felhasználó!');
      }
    } catch (error) {
      console.error('Hiba a regisztráció során:', error);
      alert('Hiba történt a regisztráció során!');
    }
  }
</script>

<svelte:head>
  <title>Iskolai nyilvántartó - Regisztráció</title>
  </svelte:head>

<div class="flex items-center justify-center min-h-screen bg-gray-100">
  <div class="w-full max-w-md bg-white shadow-md rounded-lg p-6 space-y-4">

    <h2 class="text-2xl font-semibold text-center text-gray-700">Regisztráció</h2>


    <form class="space-y-4" on:submit={handleRegister}>
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
        <label for="username" class="block text-sm font-medium text-gray-600">Felhasználónév</label>
        <input
          type="text"
          id="username"
          bind:value={username}
          required
          placeholder="Felhasználónév"
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
      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-600">Jelszó újra</label>
        <input
          type="password"
          id="confirmPassword"
          bind:value={confirmPassword}
          required
          placeholder="Jelszó újra"
          class="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <button type="submit" class="w-full px-4 py-2 text-white bg-primary hover:bg-primary-focus rounded-md">
        Regisztrálok
      </button>
    </form>


    <p class="text-sm text-center text-gray-600 mt-4">
      Már van fiókod?
      <a href="/login" class="text-primary hover:underline font-medium">Jelentkezz be itt</a>
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
