<script lang="ts">
      import { supabase } from '../../supabaseClient.js';
      import { onMount } from 'svelte';
      import type { Event } from '../../events.d.ts';
    
      let events: Event[] = [];
      let isAdmin = false;
      let newEvent = { title: '', description: '', location: '', start_time: '', end_time: '' };
    
      async function checkUser() {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Hiba történt a felhasználó lekérésekor:', error);
          return;
        }
    
        if (data?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.user.id)
            .single();
    
          if (profileError) {
            console.error('Hiba történt az admin státusz lekérésekor:', profileError);
          } else {
            isAdmin = profile?.is_admin ?? false;
          }
        }
      }
    
      async function loadEvents() {
        const { data, error } = await supabase
          .from('events')
          .select('*')
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
          return;
        }
    
        const { data, error } = await supabase
          .from('events')
          .insert([{
            title: newEvent.title,
            description: newEvent.description,
            location: newEvent.location,
            start_time: newEvent.start_time,
            end_time: newEvent.end_time,
            created_by: supabase.auth.user()?.id,
          }]);
    
        if (error) {
          console.error('Hiba történt az esemény létrehozásakor:', error);
        } else {
          loadEvents();
          newEvent = { title: '', description: '', location: '', start_time: '', end_time: '' };
        }
      }
    
      async function deleteEvent(eventId: number) {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventId);
    
        if (error) {
          console.error('Hiba történt az esemény törlésekor:', error);
        } else {
          loadEvents();
        }
      }
    
      onMount(async () => {
        await checkUser();
        loadEvents();
      });
    </script>
    
    <main class="py-4">
      <h1 class="text-3xl text-center mb-6">Események</h1>
    
      <div class="events-list space-y-4">
        {#each events as event}
          <div class="event-card p-6 bg-white shadow-lg rounded-lg">
            <h3 class="text-2xl font-semibold text-gray-700 mb-2">{event.title}</h3>
            <p class="text-gray-600">{event.description}</p>
            <p class="text-gray-600">{event.location}</p>
            <p class="text-gray-500 mt-1">{new Date(event.start_time ?? '').toLocaleString()}</p>
            <p class="text-gray-500">{new Date(event.end_time ?? '').toLocaleString()}</p>
    
            {#if isAdmin}
              <button on:click={() => deleteEvent(event.id)} class="btn btn-danger mt-4">Törlés</button>
            {/if}
          </div>
        {/each}
      </div>
    
      {#if isAdmin}
        <div class="create-event-form mt-8 p-6 bg-white shadow-lg rounded-lg">
          <h2 class="text-2xl font-semibold text-gray-700 mb-4">Új Esemény Létrehozása</h2>
          <input bind:value={newEvent.title} placeholder="Esemény címe" class="input-field" />
          <textarea bind:value={newEvent.description} placeholder="Leírás" class="input-field"></textarea>
          <input type="text" bind:value={newEvent.location} placeholder="Helyszín" class="input-field" />
          <input type="datetime-local" bind:value={newEvent.start_time} placeholder="Kezdés időpontja" class="input-field" />
          <input type="datetime-local" bind:value={newEvent.end_time} placeholder="Befejezés időpontja" class="input-field" />
          <button on:click={createEvent} class="btn btn-primary mt-4">Esemény Létrehozása</button>
        </div>
      {/if}
    </main>
    
    <style>
      .input-field {
        width: 100%;
        padding: 0.75rem;
        margin-top: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 0.375rem;
        font-size: 1rem;
        transition: border-color 0.3s, box-shadow 0.3s;
      }
    
      .input-field:focus {
        border-color: #4CAF50;
        box-shadow: 0 0 8px rgba(76, 175, 80, 0.2);
        outline: none;
      }
    
      .btn {
        padding: 0.75rem 1.5rem;
        font-weight: bold;
        border-radius: 0.375rem;
        transition: background-color 0.3s;
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
    
      .event-card {
        transition: box-shadow 0.3s;
      }
    
      .event-card:hover {
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      }
    </style>
    