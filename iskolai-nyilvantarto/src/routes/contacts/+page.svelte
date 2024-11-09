<script lang="ts">
      let name = '';
      let email = '';
      let message = '';
      let isSubmitting = false;
    
      // Kapcsolati üzenet elküldése
      const sendMessage = async () => {
        if (!name || !email || !message) {
          alert("Minden mezőt ki kell tölteni!");
          return;
        }
    
        isSubmitting = true;
    
    
        console.log("Üzenet elküldve:", { name, email, message });
    
        isSubmitting = false;
        alert("Üzenet elküldve! Hamarosan válaszolunk.");
      }
    </script>
    
    <main class="min-h-screen bg-gray-50 flex justify-center items-center">
      <div class="max-w-lg w-full p-8 bg-white shadow-lg rounded-lg">
        <h1 class="text-3xl font-semibold text-center text-gray-800 mb-6">Kapcsolatfelvétel</h1>
        
        <form on:submit|preventDefault={sendMessage}>
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700">Név</label>
            <input type="text" id="name" bind:value={name} class="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Írd be a neved" />
          </div>
    
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700">E-mail cím</label>
            <input type="email" id="email" bind:value={email} class="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Írd be az e-mail címed" />
          </div>
    
          <div class="mb-4">
            <label for="message" class="block text-sm font-medium text-gray-700">Üzenet</label>
            <textarea id="message" bind:value={message} class="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Írd meg az üzeneted" rows="4"></textarea>
          </div>
    
          <div class="flex justify-end">
            <button type="submit" class="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-indigo-700" disabled={isSubmitting}>
              {#if isSubmitting} 
                Küldés...
              {:else} 
                Küldés
              {/if}
            </button>
          </div>
        </form>
      </div>
    </main>
    
    <style>
      main {
        background-color: #f8f9fa;
      }
      .btn {
        background-color: #4c6ef5;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      .btn:hover {
        background-color: #3e54b0;
      }
    </style>
    