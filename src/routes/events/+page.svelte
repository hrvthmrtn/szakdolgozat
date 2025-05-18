<script lang="ts">
  import { supabase } from '../../supabaseClient.js';
  import { onMount } from 'svelte';

  let events = [];
  let isUserLoggedIn = false;
  let isAdmin = false; 
  let newEvent = { title: '', description: '', location: '', start_time: '', end_time: '' };
  let editingEvent = null;
  let isDeleteConfirming = false; 
  let eventToDelete = null;
  let successMessage: string | null = null;


  async function checkUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Hiba történt a felhasználó lekérésekor:', error);
      return;
    }

    if (data?.user) {
      isUserLoggedIn = true;


      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Hiba történt az admin jogosultság ellenőrzésekor:', profileError);
      } else {
        isAdmin = profile?.is_admin || false;
      }
    }
  }


  async function loadEvents() {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        profiles (username)
      `)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Hiba történt az események betöltésekor:', error);
    } else {
      events = data;
    }
  }


  async function createEvent() {
    if (!newEvent.title || !newEvent.start_time || !newEvent.end_time) {
      console.error('Minden mezőt ki kell tölteni!');
      alert('Kérlek, töltsd ki a cím, kezdési és befejezési idő mezőket!');
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error('Nincs bejelentkezve felhasználó', userError);
      return;
    }

    const created_by = userData.user.id;

    const { data, error } = await supabase
      .from('events')
      .insert([{
        title: newEvent.title,
        description: newEvent.description || null,
        location: newEvent.location || null,
        start_time: newEvent.start_time,
        end_time: newEvent.end_time,
        created_by: created_by,
      }]);

    if (error) {
      console.error('Hiba történt az esemény létrehozásakor:', error);
      alert('Hiba történt az esemény mentése során.');
    } else {
      successMessage = 'Esemény sikeresen létrehozva!';
      loadEvents();
      newEvent = { title: '', description: '', location: '', start_time: '', end_time: '' }; 
      setTimeout(() => successMessage = null, 3000); 
    }
  }


  async function updateEvent() {
    if (editingEvent) {
      const { error } = await supabase
        .from('events')
        .update({
          title: editingEvent.title,
          description: editingEvent.description,
          location: editingEvent.location,
          start_time: editingEvent.start_time,
          end_time: editingEvent.end_time,
        })
        .eq('id', editingEvent.id);

      if (error) {
        console.error('Hiba történt az esemény módosítása során:', error);
        alert('Hiba történt az esemény módosítása során.');
      } else {
        successMessage = 'Esemény sikeresen módosítva!';
        loadEvents(); 
        editingEvent = null; 
        setTimeout(() => successMessage = null, 3000);
      }
    }
  }


  function confirmDelete(event) {
    isDeleteConfirming = true;
    eventToDelete = event;
  }


  async function deleteEvent() {
    if (eventToDelete) {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventToDelete.id);

      if (error) {
        console.error('Hiba történt az esemény törlésénél:', error);
        alert('Hiba történt az esemény törlése során.');
      } else {
        successMessage = 'Esemény sikeresen törölve!';
        loadEvents(); 
        isDeleteConfirming = false; 
        eventToDelete = null;
        setTimeout(() => successMessage = null, 3000);
      }
    }
  }

  onMount(async () => {
    await checkUser();
    loadEvents();
  });
</script>

<svelte:head>
  <title>Iskolai nyilvántartó - Események</title>
  </svelte:head>

<main class="py-4">
  <h1 class="text-3xl text-center mb-6">Események</h1>

  {#if successMessage}
    <div class="success-message bg-green-100 text-green-700 text-center p-4 rounded-lg mb-6">
      {successMessage}
    </div>
  {/if}

  {#if isDeleteConfirming}
    <div class="delete-confirm bg-red-100 text-red-700 text-center p-4 rounded-lg mb-6">
      <p>Biztosan törölni szeretnéd az eseményt: "{eventToDelete?.title}"?</p>
      <button on:click={deleteEvent} class="btn btn-danger mt-4">Igen</button>
      <button on:click={() => { isDeleteConfirming = false; eventToDelete = null; }} class="btn btn-secondary mt-4">Mégse</button>
    </div>
  {/if}

  <div class="events-list space-y-4">
    {#each events as event}
      <div class="event-card p-6 bg-white shadow-lg rounded-lg">
        <h3 class="text-2xl font-semibold text-gray-700 mb-2">{event.title}</h3>
        <p class="text-gray-600">{event.description}</p>
        <p class="text-gray-600">{event.location}</p>
        <p class="text-gray-500 mt-1">{new Date(event.start_time ?? '').toLocaleString()}</p>
        <p class="text-gray-500">{new Date(event.end_time ?? '').toLocaleString()}</p>
        <p class="text-gray-400 text-sm mt-1">Létrehozta: {event.profiles?.username}</p>

        {#if isAdmin}
          <div class="button-group mt-4 flex space-x-4">
            <button on:click={() => editingEvent = { ...event }} class="btn btn-warning">Módosítás</button>
            <button on:click={() => confirmDelete(event)} class="btn btn-danger">Törlés</button>
          </div>
        {/if}
      </div>
    {/each}
  </div>

  {#if isAdmin}
    {#if editingEvent}
      <div class="create-event-form mt-8 p-6 bg-white shadow-lg rounded-lg">
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Esemény Módosítása</h2>
        <input bind:value={editingEvent.title} placeholder="Esemény címe" class="input-field" />
        <textarea bind:value={editingEvent.description} placeholder="Leírás" class="input-field"></textarea>
        <input type="text" bind:value={editingEvent.location} placeholder="Helyszín" class="input-field" />
        <input type="datetime-local" bind:value={editingEvent.start_time} class="input-field" />
        <input type="datetime-local" bind:value={editingEvent.end_time} class="input-field" />
        <button on:click={updateEvent} class="btn btn-primary mt-4">Esemény Módosítása</button>
        <button on:click={() => editingEvent = null} class="btn btn-secondary mt-4">Mégse</button>
      </div>
    {/if}

    {#if !editingEvent}
      <div class="create-event-form mt-8 p-6 bg-white shadow-lg rounded-lg">
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Új Esemény Létrehozása</h2>
        <input bind:value={newEvent.title} placeholder="Esemény címe" class="input-field" />
        <textarea bind:value={newEvent.description} placeholder="Leírás" class="input-field"></textarea>
        <input type="text" bind:value={newEvent.location} placeholder="Helyszín" class="input-field" />
        <input type="datetime-local" bind:value={newEvent.start_time} class="input-field" />
        <input type="datetime-local" bind:value={newEvent.end_time} class="input-field" />
        <button on:click={createEvent} class="btn btn-primary mt-4">Esemény Létrehozása</button>
      </div>
    {/if}
  {/if}
</main>

<style>
  .input-field {
    width: 100%;
    padding: 0.75rem;
    margin: 0.5rem 0;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
  }
  .btn-primary { background-color: #3490dc; color: #fff; }
  .btn-danger { background-color: #e3342f; color: #fff; }
  .btn-warning { background-color: #f6993f; color: #fff; }
  .btn-secondary { background-color: #6c757d; color: #fff; }
</style>
