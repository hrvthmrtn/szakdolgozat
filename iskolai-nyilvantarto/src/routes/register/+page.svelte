<script lang="ts">
      import { supabase } from '../../supabaseClient.js';
        
      let email = '';
      let username = '';
      let password = '';
      let confirmPassword = '';
        
      // A regisztrációs funkció
      async function handleRegister(event: Event) {
        event.preventDefault(); // Megakadályozza, hogy az oldal újratöltődjön
        
        // Ellenőrizzük, hogy a két jelszó megegyezik-e
        if (password !== confirmPassword) {
          alert('A két jelszó nem egyezik!');
          return;
        }
        
        try {
          // A regisztrációs API hívása a Supabase-en
          const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
          });
    
          // Ellenőrizd a hibát
          if (error) {
            alert(error.message); // Hibakezelés
          } else {
            alert('Sikeres regisztráció!');
            
           
            if (data && data.user) {
              console.log(data.user);
            } else {
              console.log('Nem található felhasználó!');
            }
          }
        } catch (error) {
          console.error('Hiba a regisztráció során:', error);
        }
      }
    </script>
    
    
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="w-full max-w-md bg-white shadow-md rounded-lg p-6 space-y-4">
        <!-- Regisztrációs cím -->
        <h2 class="text-2xl font-semibold text-center text-gray-700">Regisztráció</h2>
    
        <!-- Regisztrációs űrlap -->
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
    
        <!-- Bejelentkezési link -->
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
    