<script lang="ts">
      import { supabase } from '../../supabaseClient.js';
      import { onMount } from 'svelte';
      import { goto } from '$app/navigation';
    
      let option = '';
      let university = '';
      let faculty = '';
      let major = '';
      let graduationYear = '';
      let workArea = '';
      let workplaceName = '';
      let income = '';
      let workSince = '';
    
      // Ellenőrizzük a bejelentkezést
      onMount(async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          goto('/login');
        }
      });
    
      // Form kezelés
      async function handleSubmit() {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          alert('Hiba történt a felhasználó azonosításakor!');
          return;
        }
    
        // Ellenőrizzük, hogy a felhasználó létezik-e a users táblában
        const { data: userTableData, error: userTableError } = await supabase
          .from('users')
          .select('id')
          .eq('id', userData.user.id)
          .single();
    
        if (userTableError) {
          console.error('A felhasználó nem található a users táblában:', userTableError);
          alert('A felhasználó nem található a users táblában!');
          return;
        }
    
        // Jövedelem és munka kezdete értékek feldolgozása
        const parsedIncome = income ? parseFloat(income) : null;
        const parsedWorkSince = workSince || null;
    
        const formData = {
          user_id: userData.user.id,  // Bejelentkezett felhasználó ID-ja
          option: option || null,
          university: university || null,
          faculty: faculty || null,
          major: major || null,
          graduation_year: graduationYear ? parseInt(graduationYear) : null,
          work_area: workArea || null,
          workplace_name: workplaceName || null,
          income: parsedIncome,
          work_since: parsedWorkSince
        };
    
        // Adatok mentése a Supabase adatbázisba
        const { data, error } = await supabase
          .from('post_education_or_employment')
          .insert([formData]);
    
        if (error) {
          console.error('Hiba az adatmentés során:', error);
          alert('Hiba történt az adatok mentése közben!');
        } else {
          console.log('Sikeresen mentett adat:', data);
          alert('Űrlap sikeresen elküldve!');
        }
      }
    </script>
    
    <main class="container">
      <h1 class="title">Továbbtanulási űrlap</h1>
      <p class="description">Kérjük, adja meg az alábbi adatokat:</p>
    
      <!-- Opciók kiválasztása -->
      <div class="form-group">
        <label for="option" class="label">Válasszon:</label>
        <select id="option" bind:value={option} class="input">
          <option value="">Válasszon egyet</option>
          <option value="study">Továbbtanult</option>
          <option value="work">Dolgozni kezdett</option>
        </select>
      </div>
    
      <!-- Ha továbbtanulást választott -->
      {#if option === 'study'}
        <div class="form-group">
          <label for="university" class="label">Egyetem neve:</label>
          <input id="university" bind:value={university} class="input" placeholder="Egyetem neve" />
    
          <label for="faculty" class="label">Kar:</label>
          <input id="faculty" bind:value={faculty} class="input" placeholder="Kar neve" />
    
          <label for="major" class="label">Szak:</label>
          <input id="major" bind:value={major} class="input" placeholder="Szak neve" />
    
          <label for="graduationYear" class="label">Várható végzés éve:</label>
          <input type="number" id="graduationYear" bind:value={graduationYear} class="input" placeholder="Végzés éve" />
        </div>
      {/if}
    
      <!-- Ha dolgozni kezdett -->
      {#if option === 'work'}
        <div class="form-group">
          <label for="workArea" class="label">Munkaterület:</label>
          <select id="workArea" bind:value={workArea} class="input">
            <option value="">Válasszon egyet</option>
            <option value="city">Város</option>
            <option value="village">Falu</option>
            <option value="county-seat">Megyeszékhely</option>
            <option value="capital">Főváros</option>
            <option value="commune">Község</option>
          </select>
    
          <label for="workplaceName" class="label">Munkahely neve:</label>
          <input id="workplaceName" bind:value={workplaceName} class="input" placeholder="Munkahely neve" />
    
          <label for="income" class="label">Jövedelem:</label>
          <input type="number" id="income" bind:value={income} class="input" placeholder="Jövedelem" />
    
          <label for="workSince" class="label">Munka kezdete:</label>
          <input type="date" id="workSince" bind:value={workSince} class="input" />
        </div>
      {/if}
    
      <!-- Beküldés gomb -->
      <button on:click={handleSubmit} class="submit-button">Beküldés</button>
    </main>
    
    <style>
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 2rem;
        text-align: center;
        background-color: #f9f9f9;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }
    
      .title {
        font-size: 2rem;
        margin-bottom: 1rem;
        color: #333;
      }
    
      .description {
        color: #666;
        margin-bottom: 2rem;
      }
    
      .form-group {
        margin-bottom: 1.5rem;
        text-align: left;
      }
    
      .label {
        display: block;
        font-weight: bold;
        margin-bottom: 0.5rem;
        color: #333;
      }
    
      .input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
        color: #333;
      }
    
      .input:focus {
        border-color: #4CAF50;
        outline: none;
        box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
      }
    
      .submit-button {
        background-color: #4CAF50;
        color: white;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 5px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s;
      }
    
      .submit-button:hover {
        background-color: #45a049;
      }
    </style>
    
