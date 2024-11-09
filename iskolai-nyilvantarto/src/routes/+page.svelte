<script lang="ts">
      import { supabase } from '../supabaseClient.js';
      import { onMount } from 'svelte';
      import { goto } from '$app/navigation'; // Az új navigációs módszer
      import type { User } from '@supabase/supabase-js';
    
      let user: User | null = null;
    
      // Ellenőrzés, hogy a felhasználó be van-e jelentkezve
      onMount(async () => {
        const { data } = await supabase.auth.getUser();
        user = data.user;
      });
    
      // Kilépés
      async function logout() {
        await supabase.auth.signOut();
        user = null; // Azonnali felhasználó adat törlés
        // Itt átirányíthatod a főoldalra, vagy frissítheted az oldalt
        goto('/'); // Átirányítás a főoldalra
        // Ha szeretnéd, hogy az oldal frissüljön, ezt használhatod helyette:
        // window.location.reload(); 
      }
    </script>
    
    <main class="min-h-screen bg-gray-50">
      <!-- Hero szakasz -->
      <section class="bg-primary text-white text-center py-16 px-4">
        <h1 class="text-4xl font-bold mb-4">Iskolai nyilvántartó</h1>
        <p class="text-lg mb-6">Ezen az oldalon rögzítheted az iskolai és munkahelyi adataidat, valamint nyomon követheted a karriered fejlődését.</p>
    
        <!-- Bejelentkezett felhasználóknak üdvözlés -->
        {#if user}
          <div class="mb-6">
            <p class="text-xl">Üdvözlünk, {user.email}!</p>
            <button class="btn btn-danger mt-4" on:click={logout}>Kijelentkezés</button>
          </div>
        {:else}
          <div>
            <p class="mb-4">Regisztrálj, hogy hozzáférj a személyre szabott funkciókhoz!</p>
            <a href="/login" class="btn btn">Bejelentkezés</a>
          </div>
        {/if}
      </section>
    
      <!-- Oldal leírás -->
      <section class="py-12 px-4">
        <h2 class="text-3xl font-semibold text-center mb-6">Miért fontos az Iskolai Nyilvántartó?</h2>
        <p class="text-lg text-gray-700 text-center mb-6 max-w-3xl mx-auto">
          Az Iskolai Nyilvántartó oldal segít abban, hogy nyomon követhesd iskolai előmeneteledet és munkahelyi tapasztalataidat. Regisztrált felhasználóink részletes információkat adhatnak meg a tanulmányi előrehaladásukról, a munkahelyi tapasztalataikról, jövedelmükről és más fontos adatokról, amelyeket később felhasználhatnak a karrierük fejlesztésében.
        </p>
        <div class="text-center">
          <a href="/register" class="btn btn-primary">Regisztrálj most</a>
        </div>
      </section>
    
      <!-- Funkciók -->
      <section class="bg-gray-100 py-12 px-4">
        <h2 class="text-3xl font-semibold text-center mb-8">Funkciók</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="bg-white p-6 rounded-lg shadow-lg">
            <h3 class="text-xl font-semibold mb-4">Személyre szabott profil</h3>
            <p>Állítsd be a tanulmányi előrehaladásodat, dolgozz a karriereden és kövesd a fejlődésedet.</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-lg">
            <h3 class="text-xl font-semibold mb-4">Munkahelyi tapasztalat</h3>
            <p>Adja hozzá a munkahelyi tapasztalataidat és kövesd a jövedelmed alakulását.</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-lg">
            <h3 class="text-xl font-semibold mb-4">Pontos statisztikák</h3>
            <p>Nyújtunk átfogó statisztikákat, amelyek segítenek megérteni a tanulmányi és munkahelyi előrehaladásodat.</p>
          </div>
        </div>
      </section>
    </main>
    
    <style>
      .bg-primary {
        background-color: #4CAF50;
      }
    
      .btn {
        display: inline-block;
        padding: 10px 20px;
        border-radius: 5px;
        font-weight: bold;
        text-decoration: none;
        text-align: center;
        cursor: pointer;
      }
    
      .btn-primary {
        background-color: #4CAF50;
        color: white;
      }
    
      .btn-primary:hover {
        background-color: #45a049;
      }
    
      .btn-danger {
        background-color: #e53935;
        color: white;
      }
    
      .btn-danger:hover {
        background-color: #d32f2f;
      }
    </style>
    