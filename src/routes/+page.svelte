<script lang="ts">
      import { supabase } from '../supabaseClient.js';
      import { onMount } from 'svelte';
      import { goto } from '$app/navigation';
      import type { User } from '@supabase/supabase-js';
    
      let user: User | null = null;
    
  
      onMount(async () => {
        const { data } = await supabase.auth.getUser();
        user = data.user;
      });
    

      async function logout() {
        await supabase.auth.signOut();
        user = null;
        goto('/');

      }
    </script>
    
    <svelte:head>
      <title>Iskolai nyilvántartó - Főoldal</title>
      </svelte:head>

    <main class="min-h-screen bg-gray-50">
      <section class="bg-primary text-white text-center py-16 px-4">
        <h1 class="text-4xl font-bold mb-4">Iskolai nyilvántartó</h1>
        <p class="text-lg mb-6">Ezen az oldalon rögzítheted az iskolai és munkahelyi adataidat, valamint nyomon követheted a karriered fejlődését.</p>
    
        {#if user}
          <div class="mb-6">
            <p class="text-xl">Üdvözlünk, {user.email}!</p>
            <button class="btn btn-danger mt-4" on:click={logout}>Kijelentkezés</button>
          </div>
        {:else}
          <div>
            <p class="mb-4">Regisztrálj, hogy kitölthesd a végzés utáni űrlapot!</p>
            <a href="/login" class="btn btn">Bejelentkezés</a>
          </div>
        {/if}
      </section>
    
      <section class="py-12 px-4">
        <h2 class="text-3xl font-semibold text-center mb-6">Miért fontos az Iskolai nyilvántartó?</h2>
        <p class="text-lg text-gray-700 text-center mb-6 max-w-3xl mx-auto">
          Az Iskolai nyilvántartó oldal lehetővé teszi, hogy megtekinthesd, az iskolából végzett diákok milyen irányban folytatták pályafutásukat. Regisztrált felhasználóink részletes információkat oszthatnak meg tanulmányaikról, például hogy mely egyetemet, kart és szakot választották, valamint arról, hogy milyen munkahelyen helyezkedtek el, milyen területen dolgoznak, és milyen tapasztalatokat szereztek. Ezek az adatok segítenek abban, hogy átfogó képet kapjunk a diákok jövőbeni lehetőségeiről és karrierútjukról.
        </p>
        <div class="text-center">
          <a href="/register" class="btn btn-primary">Regisztrálj most</a>
        </div>
      </section>
    
      <section class="bg-gray-100 py-12 px-4">
        <h2 class="text-3xl font-semibold text-center mb-8">Fő Funkciók</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="bg-white p-6 rounded-lg shadow-lg">
            <h3 class="text-xl font-semibold mb-4">Személyre szabott profil</h3>
            <p>Hozd létre és kezeld személyes profilodat, ahol rögzítheted tanulmányi irányodat és szakmai fejlődésed mérföldköveit.</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-lg">
            <h3 class="text-xl font-semibold mb-4">Munkahelyi tapasztalatok</h3>
            <p>Rögzítsd szakmai tapasztalataidat, kövesd nyomon munkaterületeidet és jövedelmed alakulását a karriered során.</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-lg">
            <h3 class="text-xl font-semibold mb-4">Részletes statisztikák</h3>
            <p>Tekintsd meg az átfogó statisztikákat, amelyek betekintést nyújtanak az iskolád végzőseinek pályafutásáról és szakmai előrehaladásáról.</p>
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
    