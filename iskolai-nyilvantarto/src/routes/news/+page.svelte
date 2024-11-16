<script lang="ts">
      import { supabase } from '../../supabaseClient.js';
      import { onMount } from 'svelte';
    
      let news = [];
      let isAdmin = false;
      let newArticle = { title: '', content: '', published_at: '' };
      let editingArticle = null; // Szerkesztett hír
      let successMessage: string | null = null;
      let deleteConfirming = false; // Törlés megerősítéséhez
      let articleToDelete = null; // Törlendő hír
    
      // Ellenőrizzük, hogy a felhasználó admin-e
      async function checkAdmin() {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Hiba a felhasználó lekérésekor:', error);
          return;
        }
    
        if (data?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.user.id)
            .single();
    
          if (profileError) {
            console.error('Hiba az admin státusz lekérésekor:', profileError);
          } else {
            isAdmin = profile?.is_admin ?? false;
          }
        }
      }
    
      // Hírek betöltése
      async function loadNews() {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .order('published_at', { ascending: false });
    
        if (error) {
          console.error('Hiba történt a hírek betöltésekor:', error);
        } else {
          news = data;
        }
      }
    
      // Új hír létrehozása
      async function createNews() {
        if (!newArticle.title || !newArticle.content) {
          alert('Kérlek, töltsd ki a cím és tartalom mezőket!');
          return;
        }
    
        const { error } = await supabase
          .from('news')
          .insert([{ ...newArticle, published_at: new Date().toISOString() }]);
    
        if (error) {
          console.error('Hiba történt a hír létrehozásakor:', error);
          alert('Hiba történt a hír mentése során.');
        } else {
          successMessage = 'Hír sikeresen létrehozva!';
          loadNews(); // Hírek újratöltése
          newArticle = { title: '', content: '', published_at: '' }; // Űrlap alaphelyzetbe állítása
          setTimeout(() => successMessage = null, 3000);
        }
      }
    
      // Hír módosítása
      async function updateNews() {
        if (!editingArticle) return;
    
        const { error } = await supabase
          .from('news')
          .update({
            title: editingArticle.title,
            content: editingArticle.content,
            published_at: new Date().toISOString(),
          })
          .eq('id', editingArticle.id);
    
        if (error) {
          console.error('Hiba történt a hír módosítása során:', error);
          alert('Hiba történt a hír módosítása során.');
        } else {
          successMessage = 'Hír sikeresen módosítva!';
          loadNews();
          editingArticle = null; // Szerkesztés befejezése
          setTimeout(() => successMessage = null, 3000);
        }
      }
    
      // Hír törlésének megerősítése
      function confirmDelete(article) {
        deleteConfirming = true;
        articleToDelete = article;
      }
    
      // Hír törlése
      async function deleteNews() {
        if (!articleToDelete) return;
    
        const { error } = await supabase
          .from('news')
          .delete()
          .eq('id', articleToDelete.id);
    
        if (error) {
          console.error('Hiba történt a hír törlése során:', error);
          alert('Hiba történt a hír törlése során.');
        } else {
          successMessage = 'Hír sikeresen törölve!';
          loadNews();
          deleteConfirming = false;
          articleToDelete = null;
          setTimeout(() => successMessage = null, 3000);
        }
      }
    
      onMount(async () => {
        await checkAdmin();
        loadNews();
      });
    </script>
    
    <main class="py-6 px-4 max-w-6xl mx-auto">
      <h1 class="text-3xl font-semibold text-center mb-6">Hírek</h1>
    
      {#if successMessage}
        <div class="bg-green-100 text-green-700 p-4 rounded-md mb-4 text-center">
          {successMessage}
        </div>
      {/if}
    
      {#if deleteConfirming}
        <div class="bg-red-100 text-red-700 p-4 rounded-md mb-4 text-center">
          <p>Biztosan törölni szeretnéd a következő hírt: "{articleToDelete?.title}"?</p>
          <div class="mt-4 space-x-4">
            <button on:click={deleteNews} class="px-4 py-2 bg-red-600 text-white rounded-md">Igen</button>
            <button on:click={() => { deleteConfirming = false; articleToDelete = null; }} class="px-4 py-2 bg-gray-300 rounded-md">Mégse</button>
          </div>
        </div>
      {/if}
    
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each news as article}
          <div class="bg-white p-6 rounded-lg shadow-lg">
            <h3 class="text-xl font-bold mb-2">{article.title}</h3>
            <p class="text-gray-600 text-sm mb-4">{new Date(article.published_at).toLocaleDateString()}</p>
            <p class="text-gray-700">{article.content}</p>
    
            {#if isAdmin}
              <div class="mt-4 flex space-x-2">
                <button on:click={() => editingArticle = { ...article }} class="px-4 py-2 bg-blue-500 text-white rounded-md">Módosítás</button>
                <button on:click={() => confirmDelete(article)} class="px-4 py-2 bg-red-500 text-white rounded-md">Törlés</button>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    
      {#if isAdmin}
        {#if editingArticle}
          <div class="mt-8 bg-white p-6 rounded-lg shadow-lg">
            <h2 class="text-xl font-semibold mb-4">Hír Módosítása</h2>
            <input bind:value={editingArticle.title} placeholder="Cím" class="w-full p-2 border rounded-md mb-4" />
            <textarea bind:value={editingArticle.content} placeholder="Tartalom" class="w-full p-2 border rounded-md mb-4"></textarea>
            <button on:click={updateNews} class="px-4 py-2 bg-blue-500 text-white rounded-md">Mentés</button>
            <button on:click={() => editingArticle = null} class="px-4 py-2 bg-gray-300 rounded-md">Mégse</button>
          </div>
        {:else}
          <div class="mt-8 bg-white p-6 rounded-lg shadow-lg">
            <h2 class="text-xl font-semibold mb-4">Új Hír Létrehozása</h2>
            <input bind:value={newArticle.title} placeholder="Cím" class="w-full p-2 border rounded-md mb-4" />
            <textarea bind:value={newArticle.content} placeholder="Tartalom" class="w-full p-2 border rounded-md mb-4"></textarea>
            <button on:click={createNews} class="px-4 py-2 bg-green-500 text-white rounded-md">Hír Létrehozása</button>
          </div>
        {/if}
      {/if}
    </main>
    
    <style>
      .btn {
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
      }
    </style>
    
