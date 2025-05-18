<script lang="ts">
  import { supabase } from '../../supabaseClient.js';
  import { onMount } from 'svelte';

  let news = [];
  let isAdmin = false;
  let newArticle = { title: '', content: '', published_at: '', image_url: '' };
  let editingArticle = null; 
  let successMessage: string | null = null;
  let deleteConfirming = false; 
  let articleToDelete = null; 

  let newImageFile: File | null = null;

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

  
  function handleImageChange(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
      newImageFile = files[0];
    }
  }

  async function createNews() {
    if (!newArticle.title || !newArticle.content) {
      alert('Kérlek, töltsd ki a cím és tartalom mezőket!');
      return;
    }
    
    
    if (newImageFile) {
      
      const filePath = `${Date.now()}_${newImageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, newImageFile);
      if (uploadError) {
        console.error('Kép feltöltési hiba:', uploadError);
        alert('Hiba történt a kép feltöltése során.');
        return;
      } else {
        
        const { publicURL, error: urlError } = supabase.storage
          .from('news-images')
          .getPublicUrl(filePath);
        if (urlError) {
          console.error('Kép URL lekérési hiba:', urlError);
        } else {
          newArticle.image_url = publicURL;
        }
      }
    }

    const { error } = await supabase
      .from('news')
      .insert([{ ...newArticle, published_at: new Date().toISOString() }]);

    if (error) {
      console.error('Hiba történt a hír létrehozásakor:', error);
      alert('Hiba történt a hír mentése során.');
    } else {
      successMessage = 'Hír sikeresen létrehozva!';
      loadNews(); 
      newArticle = { title: '', content: '', published_at: '', image_url: '' };
      newImageFile = null;
      setTimeout(() => successMessage = null, 3000);
    }
  }

  async function updateNews() {
    if (!editingArticle) return;

    if (newImageFile) {
      const filePath = `${Date.now()}_${newImageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, newImageFile);
      if (uploadError) {
        console.error('Kép feltöltési hiba:', uploadError);
        alert('Hiba történt a kép feltöltése során.');
        return;
      } else {
        const { publicURL, error: urlError } = supabase.storage
          .from('news-images')
          .getPublicUrl(filePath);
        if (urlError) {
          console.error('Kép URL lekérési hiba:', urlError);
        } else {
          editingArticle.image_url = publicURL;
        }
      }
    }

    const { error } = await supabase
      .from('news')
      .update({
        title: editingArticle.title,
        content: editingArticle.content,
        published_at: new Date().toISOString(),
        image_url: editingArticle.image_url
      })
      .eq('id', editingArticle.id);

    if (error) {
      console.error('Hiba történt a hír módosítása során:', error);
      alert('Hiba történt a hír módosítása során.');
    } else {
      successMessage = 'Hír sikeresen módosítva!';
      loadNews();
      editingArticle = null;
      newImageFile = null;
      setTimeout(() => successMessage = null, 3000);
    }
  }

  function confirmDelete(article) {
    deleteConfirming = true;
    articleToDelete = article;
  }

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


<svelte:head>
  <title>Iskolai nyilvántartó - Hírek</title>
</svelte:head>
<main class="py-10 px-6 max-w-6xl mx-auto">
  <h1 class="text-5xl font-bold text-center mb-12 text-blue-700">Hírek</h1>

  {#if successMessage}
    <div class="alert alert-success">
      {successMessage}
    </div>
  {/if}

  {#if deleteConfirming}
    <div class="alert alert-danger">
      <p class="font-semibold text-lg">Biztosan törölni szeretnéd a hírt?</p>
      <p class="italic text-gray-700">"{articleToDelete?.title}"</p>
      <div class="mt-4 flex space-x-4">
        <button on:click={deleteNews} class="btn btn-danger">
          Igen
        </button>
        <button on:click={() => { deleteConfirming = false; articleToDelete = null; }} class="btn btn-secondary">
          Mégse
        </button>
      </div>
    </div>
  {/if}

  <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
    {#each news as article}
      <div class="card news-card">
        <h3 class="text-2xl font-semibold text-gray-800 mb-2">{article.title}</h3>
        <p class="text-sm text-gray-500 mb-4">{new Date(article.published_at).toLocaleDateString()}</p>
        {#if article.image_url}
          <img src="{article.image_url}" alt="{article.title}" class="mb-4 rounded" style="max-width: 100%; height: auto;">
        {/if}
        <p class="text-gray-700 mb-4">{article.content}</p>

        {#if isAdmin}
          <div class="flex space-x-3">
            <button on:click={() => editingArticle = { ...article }} class="btn btn-primary">
              Módosítás
            </button>
            <button on:click={() => confirmDelete(article)} class="btn btn-danger">
              Törlés
            </button>
          </div>
        {/if}
      </div>
    {/each}
  </div>

  {#if isAdmin}
    {#if editingArticle}
      <div class="card admin-card mt-10">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Hír Módosítása</h2>
        <input bind:value={editingArticle.title} placeholder="Cím" class="admin-input mb-4" />
        <textarea bind:value={editingArticle.content} placeholder="Tartalom" class="admin-input mb-4"></textarea>
        <label class="admin-input mb-4">
          Kép feltöltése:
          <input type="file" accept="image/*" on:change={handleImageChange} />
        </label>
        <div class="flex space-x-4">
          <button on:click={updateNews} class="btn btn-primary">
            Mentés
          </button>
          <button on:click={() => { editingArticle = null; newImageFile = null; }} class="btn btn-secondary">
            Mégse
          </button>
        </div>
      </div>
    {:else}
      <div class="card admin-card mt-10">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Új Hír Létrehozása</h2>
        <input bind:value={newArticle.title} placeholder="Cím" class="admin-input mb-4" />
        <textarea bind:value={newArticle.content} placeholder="Tartalom" class="admin-input mb-4"></textarea>
        <label class="admin-input mb-4">
          Kép feltöltése:
          <input type="file" accept="image/*" on:change={handleImageChange} />
        </label>
        <button on:click={createNews} class="btn btn-success">
          Hír Létrehozása
        </button>
      </div>
    {/if}
  {/if}
</main>

<style>
  main {
    font-family: 'Arial', sans-serif;
  }

  .btn {
    padding: 0.7rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
  }
  
  .btn:hover {
    transform: translateY(-2px);
  }
  
  .btn-primary {
    background: #007bff;
    color: white;
  }
  
  .btn-primary:hover {
    background: #0056b3;
  }
  
  .btn-success {
    background: #28a745;
    color: white;
  }
  
  .btn-success:hover {
    background: #218838;
  }
  
  .btn-danger {
    background: #dc3545;
    color: white;
  }
  
  .btn-danger:hover {
    background: #c82333;
  }
  
  .btn-secondary {
    background: #6c757d;
    color: white;
  }
  
  .btn-secondary:hover {
    background: #5a6268;
  }
  
  .alert {
    padding: 1rem;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: bold;
    text-align: center;
  }
  
  .alert-success {
    background: #d4edda;
    color: #155724;
  }
  
  .alert-danger {
    background: #f8d7da;
    color: #721c24;
  }
  
  .card {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
  
  .news-card {
    padding: 1.5rem;
  }
  
  .admin-card {
    padding: 2rem;
  }
  
  .admin-input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    font-size: 1rem;
    transition: border-color 0.3s, box-shadow 0.2s;
  }
  
  .admin-input:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
    outline: none;
  }
  
  .grid {
    display: grid;
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
