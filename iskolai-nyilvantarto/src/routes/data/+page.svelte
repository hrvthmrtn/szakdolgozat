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
  let hasSubmitted = false; // Jelzi, hogy a felhasználó már kitöltötte az űrlapot

  // Ellenőrizzük a bejelentkezést és hogy az űrlap már ki lett-e töltve
  onMount(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      goto('/login');
      return;
    }

    const userId = data.user.id;

    // Ellenőrizzük, hogy van-e már bejegyzés a study vagy work táblában
    const { data: studyData, error: studyError } = await supabase
      .from('study')
      .select('id')
      .eq('user_id', userId)
      .single();

    const { data: workData, error: workError } = await supabase
      .from('work')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (studyData || workData) {
      hasSubmitted = true; // Már van bejegyzés, ne jelenjen meg az űrlap
    }
  });

  // Form kezelés
  async function handleSubmit() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      alert('Hiba történt a felhasználó azonosításakor!');
      return;
    }

    const userId = userData.user.id;

    if (option === 'study') {
      const studyData = {
        user_id: userId,
        university: university || null,
        faculty: faculty || null,
        major: major || null,
        graduation_year: graduationYear ? parseInt(graduationYear) : null
      };

      const { error } = await supabase.from('study').insert([studyData]);
      if (error) {
        console.error('Hiba a továbbtanulási adatok mentésekor:', error);
        alert('Hiba történt a továbbtanulási adatok mentése során!');
        return;
      }
    } else if (option === 'work') {
      const workData = {
        user_id: userId,
        work_area: workArea || null,
        workplace_name: workplaceName || null,
        income: income ? parseFloat(income) : null,
        work_since: workSince || null
      };

      const { error } = await supabase.from('work').insert([workData]);
      if (error) {
        console.error('Hiba a munka adatok mentésekor:', error);
        alert('Hiba történt a munka adatok mentése során!');
        return;
      }
    } else {
      alert('Kérjük, válasszon egy lehetőséget!');
      return;
    }

    alert('Űrlap sikeresen elküldve!');
    hasSubmitted = true; // Az űrlap elküldése után elrejtjük
  }
</script>

<main class="container">
  {#if hasSubmitted}
    <h1 class="title">Már kitöltötte az űrlapot!</h1>
    <p class="description">Köszönjük! Már elküldte a továbbtanulási vagy munkakezdési adatait.</p>
  {:else}
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
          <option value="Város">Város</option>
          <option value="Falu">Falu</option>
          <option value="Megyeszékhely">Megyeszékhely</option>
          <option value="Főváros">Főváros</option>
          <option value="Község">Község</option>
        </select>

        <label for="workplaceName" class="label">Munkahely neve:</label>
        <input id="workplaceName" bind:value={workplaceName} class="input" placeholder="Munkahely neve" />

        <label for="income" class="label">Jövedelem:(Forintban)</label>
        <input type="number" id="income" bind:value={income} class="input" placeholder="Jövedelem" />

        <label for="workSince" class="label">Munka kezdete:</label>
        <input type="date" id="workSince" bind:value={workSince} class="input" />
      </div>
    {/if}

    <!-- Beküldés gomb -->
    <button on:click={handleSubmit} class="submit-button">Beküldés</button>
  {/if}
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
