<script lang="ts">
  import { supabase } from '../../supabaseClient.js';
  import { onMount } from 'svelte';

  let name = '';
  let email = '';
  let message = '';
  let isSubmitting = false;
  let isReadOnly = false;

  onMount(async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Hiba a felhasználói adatok lekérésekor:", error);
      return;
    }

    if (data?.user) {
      email = data.user.email || '';

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error("Hiba a felhasználói név lekérésekor:", profileError);
      } else {
        name = profile?.username || 'Felhasználó';
        isReadOnly = true;
      }
    }
  });

  const sendMessage = async () => {
    if (!name || !email || !message) {
      alert("Minden mezőt ki kell tölteni!");
      return;
    }

    isSubmitting = true;

    console.log("Üzenet elküldve:", { name, email, message });

    isSubmitting = false;
    message = '';
    alert("Üzenet elküldve! Hamarosan válaszolunk.");
  };
</script>
<svelte:head>
  <title>Iskolai nyilvántartó - Kapcsolat</title>
  </svelte:head>
<main class="min-h-screen bg-gray-50 flex justify-center items-center">
  <div class="max-w-lg w-full p-8 bg-white shadow-xl rounded-lg">
    <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">Kapcsolatfelvétel</h1>
    
    <form on:submit|preventDefault={sendMessage} class="space-y-6">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">Név</label>
        <input
          type="text"
          id="name"
          bind:value={name}
          class="form-input"
          placeholder="Írd be a neved"
          readonly={isReadOnly}
        />
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">E-mail cím</label>
        <input
          type="email"
          id="email"
          bind:value={email}
          class="form-input"
          placeholder="Írd be az e-mail címed"
          readonly={isReadOnly}
        />
      </div>

      <div>
        <label for="message" class="block text-sm font-medium text-gray-700">Üzenet</label>
        <textarea
          id="message"
          bind:value={message}
          class="form-input resize-none"
          placeholder="Írd meg az üzeneted"
          rows="4"
        ></textarea>
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          class="btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Küldés..." : "Küldés"}
        </button>
      </div>
    </form>
  </div>
</main>

<style>
  main {
    background-color: #f4f5f7;
  }

  .form-input {
    width: 100%;
    padding: 0.75rem;
    margin: 0.5rem 0;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    background-color: #f9fafb;
    transition: border-color 0.3s ease;
  }

  .form-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    outline: none;
  }

  .form-input[readonly] {
    background-color: #e5e7eb;
    cursor: not-allowed;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    background-color: #6366f1;
    color: white;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }

  .btn:hover {
    background-color: #4f46e5;
    transform: translateY(-2px);
  }

  .btn:disabled {
    background-color: #a5b4fc;
    cursor: not-allowed;
  }
</style>
