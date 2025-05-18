<script lang="ts">
  import { supabase } from '../../supabaseClient.js';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let option = '';
  let university = '';
  let faculty = '';
  let major = '';
  let graduationYear = '';
  let alreadyGraduated = false;
  let startYear = '';
  let endYear = '';
  let workArea = '';
  let workplaceName = '';
  let income = '';
  let workSince = '';
  let workUntil = '';
  let profession = '';
  let hasSubmitted = false;
  let submittedData = [];
  let editingId = null;

  onMount(async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      goto('/login');
      return;
    }

    const userId = userData.user.id;

    const { data: studyData } = await supabase.from('study').select('*').eq('user_id', userId);
    const { data: workData } = await supabase.from('work').select('*').eq('user_id', userId);

    submittedData = [
      ...(studyData || []).map((item) => ({ ...item, type: 'study' })),
      ...(workData || []).map((item) => ({ ...item, type: 'work' })),
    ];

    hasSubmitted = submittedData.length > 0;
  });

  async function handleSubmit() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user.id;

    if (option === 'study') {
      const studyData = {
        user_id: userId,
        university,
        faculty,
        major,
        graduation_year: !alreadyGraduated ? graduationYear : null,
        startYear: alreadyGraduated ? startYear : null,
        endYear: alreadyGraduated ? endYear : null,
      };

      if (editingId) {
        const { error } = await supabase.from('study').update(studyData).eq('id', editingId);
        if (error) {
          console.error('Tanulmány adatok módosításakor hiba:', error);
          alert('Hiba történt a tanulmányi adatok módosítása során.');
          return;
        }
        submittedData = submittedData.map((item) =>
          item.id === editingId ? { ...item, ...studyData } : item
        );
      } else {
        const { data, error } = await supabase.from('study').insert([studyData]).select();
        if (error || !data) {
          console.error('Tanulmány adatok mentésekor hiba:', error);
          alert('Hiba történt a tanulmányi adatok mentése során.');
          return;
        }
        submittedData.push({ ...data[0], type: 'study' });
      }
    } else if (option === 'work') {
      const workData = {
        user_id: userId,
        work_area: workArea,
        workplace_name: workplaceName,
        income: income || null,
        work_since: workSince || null,
        workUntil: workUntil || null,
        profession: profession || null, 
      };

      if (editingId) {
        const { error } = await supabase.from('work').update(workData).eq('id', editingId);
        if (error) {
          console.error('Munkahely adatok módosításakor hiba:', error);
          alert('Hiba történt a munkahelyi adatok módosítása során.');
          return;
        }
        submittedData = submittedData.map((item) =>
          item.id === editingId ? { ...item, ...workData } : item
        );
      } else {
        const { data, error } = await supabase.from('work').insert([workData]).select();
        if (error || !data) {
          console.error('Munkahely adatok mentésekor hiba:', error);
          alert('Hiba történt a munkahelyi adatok mentése során.');
          return;
        }
        submittedData.push({ ...data[0], type: 'work' });
      }
    }

    resetForm();
    hasSubmitted = true;
  }


  function editData(data) {
    resetForm();
    editingId = data.id;
    option = data.type;
    hasSubmitted = false; 
    if (data.type === 'study') {
      university = data.university;
      faculty = data.faculty;
      major = data.major;
      graduationYear = data.graduation_year;
      startYear = data.startYear;
      endYear = data.endYear;
      alreadyGraduated = !!data.startYear;
    } else if (data.type === 'work') {
      workArea = data.work_area;
      workplaceName = data.workplace_name;
      income = data.income;
      workSince = data.work_since;
      workUntil = data.workUntil;
      profession = data.profession;
    }
  }

  function resetForm() {
    option = '';
    university = '';
    faculty = '';
    major = '';
    graduationYear = '';
    alreadyGraduated = false;
    startYear = '';
    endYear = '';
    workArea = '';
    workplaceName = '';
    income = '';
    workSince = '';
    workUntil = '';
    profession = ''; 
    editingId = null;
  }

  function addWork() {
    resetForm();
    option = 'work';
    hasSubmitted = false;
  }
  function addStudy() {
    resetForm();
    option = 'study';
    hasSubmitted = false;
  }
</script>

<svelte:head>
  <title>Iskolai nyilvántartó - Végzés utáni űrlap</title>
  </svelte:head>

<main class="container">
  {#if hasSubmitted}
    <div class="result-box">
      <h1 class="title">Beküldött adatok</h1>
      {#each submittedData as data}
        <div class="entry">
          {#if data.type === 'work'}
            <h2>Munkahely</h2>
            <p><strong>Régió:</strong> {data.work_area || 'Nincs megadva'}</p>
            <p><strong>Munkahely neve:</strong> {data.workplace_name || 'Nincs megadva'}</p>
            <p><strong>Fizetés:</strong> {data.income ? `${data.income} Ft` : 'Nincs megadva'}</p>
            <p><strong>Munka kezdete:</strong> {data.work_since || 'Nincs megadva'}</p>
            <p><strong>Munka vége:</strong> {data.workUntil || 'Jelenleg is dolgozik'}</p>
            <p><strong>Foglalkozás:</strong> {data.profession || 'Nincs megadva'}</p> 
          {:else if data.type === 'study'}
            <h2>Tanulmány</h2>
            <p><strong>Egyetem neve:</strong> {data.university || 'Nincs megadva'}</p>
            <p><strong>Kar:</strong> {data.faculty || 'Nincs megadva'}</p>
            <p><strong>Szak:</strong> {data.major || 'Nincs megadva'}</p>
            {#if data.graduation_year}
              <p><strong>Várható végzés éve:</strong> {data.graduation_year}</p>
            {:else}
              <p><strong>Kezdés éve:</strong> {data.startYear || 'Nincs megadva'}</p>
              <p><strong>Befejezés éve:</strong> {data.endYear || 'Nincs megadva'}</p>
            {/if}
          {/if}
          <div class="button-group">
            <button on:click={() => editData(data)} class="edit-button">Módosítás</button>
          </div>
        </div>
      {/each}
      <div class="button-group">
        <button on:click={addWork} class="submit-button">Munkahely hozzáadása</button>
        <button on:click={addStudy} class="submit-button">Tanulmány hozzáadása</button>
      </div>
    </div>
  {:else}
    <div class="form-box">
      <h1 class="title">Végzés utáni űrlap</h1>
      <div class="form-group">
        <label for="option" class="label">Válasszon:</label>
        <select id="option" bind:value={option} class="input">
          <option value="">Válasszon egyet</option>
          <option value="study">Továbbtanult</option>
          <option value="work">Dolgozni kezdett</option>
        </select>
      </div>

      {#if option === 'study'}
        <div class="form-group">
          <label for="university" class="label">Egyetem neve:</label>
          <input id="university" bind:value={university} class="input" />
          <label for="faculty" class="label">Kar:</label>
          <input id="faculty" bind:value={faculty} class="input" />
          <label for="major" class="label">Szak:</label>
          <input id="major" bind:value={major} class="input" />
          <label for="alreadyGraduated" class="label">
            <input type="checkbox" id="alreadyGraduated" bind:checked={alreadyGraduated} />
            Már végzett
          </label>
          {#if alreadyGraduated}
            <label for="startYear" class="label">Kezdés éve:</label>
            <input type="number" id="startYear" bind:value={startYear} class="input" />
            <label for="endYear" class="label">Befejezés éve:</label>
            <input type="number" id="endYear" bind:value={endYear} class="input" />
          {:else}
            <label for="graduationYear" class="label">Várható végzés éve:</label>
            <input type="number" id="graduationYear" bind:value={graduationYear} class="input" />
          {/if}
        </div>
      {/if}

      {#if option === 'work'}
        <div class="form-group">
          <label for="workArea" class="label">Régió:</label>
          <select id="workArea" bind:value={workArea} class="input">
            <option value="">Válasszon egyet</option>
            <option value="Város">Város</option>
            <option value="Falu">Falu</option>
            <option value="Megyeszékhely">Megyeszékhely</option>
            <option value="Főváros">Főváros</option>
            <option value="Község">Község</option>
          </select>
          <label for="workplaceName" class="label">Munkahely neve:</label>
          <input id="workplaceName" bind:value={workplaceName} class="input" />
          <label for="profession" class="label">Foglalkozás:</label>
          <input id="profession" bind:value={profession} class="input" placeholder="Foglalkozás" />
          <label for="income" class="label">Jövedelem:</label>
          <input type="number" id="income" bind:value={income} class="input" />
          <label for="workSince" class="label">Munka kezdete:</label>
          <input type="date" id="workSince" bind:value={workSince} class="input" />
          <label for="workUntil" class="label">Munka vége (opcionális):</label>
          <input type="date" id="workUntil" bind:value={workUntil} class="input" />
          
        </div>
      {/if}

      <button on:click={handleSubmit} class="submit-button">Beküldés</button>
    </div>
  {/if}
</main>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .title {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #333;
    text-align: center;
  }

  .form-box {
    background-color: #f1f1f1;
    padding: 2rem;
    border-radius: 10px;
    max-width: 600px;
    margin: 0 auto;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .form-group {
    margin-bottom: 1.5rem;
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
    transition: background-color 0.3s ease;
    display: block;
    margin: 0 auto;
  }

  .submit-button:hover {
    background-color: #45a049;
  }

  .result-box {
    background-color: #f1f1f1;
    padding: 2rem;
    border-radius: 10px;
    margin-bottom: 1.5rem;
    text-align: left;
  }

  .entry {
    background: #ffffff;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    padding: 1rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .entry h2 {
    margin-bottom: 1rem;
    color: #4CAF50;
  }

  .entry p {
    margin: 0.5rem 0;
  }

  .button-group {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
  }

  .edit-button {
    background-color: #FFA500;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
    display: block;
    margin: 0 auto;
  }

  .edit-button:hover {
    background-color: #FF8C00;
  }

  .edit-button {
    background-color: #FFA500;
    color: white;
  }

  .edit-button:hover {
    background-color: #FF8C00;
  }

  .delete-button {
    background-color: #FF4500;
    color: white;
  }

  .delete-button:hover {
    background-color: #DC143C;
  }
</style>
