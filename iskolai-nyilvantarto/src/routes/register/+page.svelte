<script lang="ts">
  import { supabase } from '../../supabaseClient.js';
  import { onMount } from 'svelte';

  let studyStats = []; // Továbbtanulók statisztikai adatai
  let workStats = []; // Dolgozók statisztikai adatai
  let incomeStats = null; // Jövedelem statisztikák
  let hasProvidedIncome = false; // A felhasználó megadta-e a jövedelmét
  let isLoading = true;

  // Jövedelem statisztikák kiszámítása
  function calculateIncomeStats(data) {
    const validIncomes = data
      .map(item => item.income)
      .filter(income => income !== null);

    if (validIncomes.length === 0) return null;

    const sum = validIncomes.reduce((a, b) => a + b, 0);
    const avg = sum / validIncomes.length;
    const sorted = validIncomes.sort((a, b) => a - b);
    const median =
      validIncomes.length % 2 === 0
        ? (sorted[validIncomes.length / 2 - 1] + sorted[validIncomes.length / 2]) / 2
        : sorted[Math.floor(validIncomes.length / 2)];
    const min = Math.min(...validIncomes);
    const max = Math.max(...validIncomes);

    return { avg, median, min, max, count: validIncomes.length };
  }

  // Adatok betöltése
  onMount(async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error('Hozzáférés megtagadva. Jelentkezzen be.');
      return;
    }

    const userId = userData.user.id;

    // Ellenőrizzük, hogy a felhasználó megadta-e a jövedelmét
    const { data: userWorkData, error: userWorkError } = await supabase
      .from('work')
      .select('income')
      .eq('user_id', userId)
      .single();

    if (userWorkData?.income) {
      hasProvidedIncome = true;
    }

    // Továbbtanulók adatai
    const { data: studyData, error: studyError } = await supabase
      .from('study')
      .select('university, faculty, major');

    const { data: workData, error: workDataError } = await supabase
      .from('work')
      .select('work_area, workplace_name, income');

    if (studyError || workDataError) {
      console.error('Hiba történt az adatok betöltésekor:', studyError || workDataError);
      return;
    }

    // Továbbtanulók statisztikák feldolgozása
    studyStats = studyData.reduce((acc, curr) => {
      const key = `${curr.university} | ${curr.faculty} | ${curr.major}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // Dolgozók statisztikák feldolgozása
    workStats = workData.reduce((acc, curr) => {
      acc[curr.work_area] = (acc[curr.work_area] || 0) + 1;
      return acc;
    }, {});

    // Jövedelem statisztikák kiszámítása
    incomeStats = calculateIncomeStats(workData);

    isLoading = false;
  });
</script>

<main class="container mx-auto p-6">
  <h1 class="text-3xl font-bold text-center mb-6">Statisztikai Adatok</h1>

  {#if isLoading}
    <p class="text-center text-lg">Adatok betöltése...</p>
  {:else}
    <!-- Továbbtanulók -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Továbbtanulók</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th class="border border-gray-300 px-4 py-2 text-left">Egyetem | Kar | Szak</th>
            <th class="border border-gray-300 px-4 py-2 text-right">Létszám</th>
          </tr>
        </thead>
        <tbody>
          {#each Object.entries(studyStats) as [key, count]}
            <tr>
              <td class="border border-gray-300 px-4 py-2">{key}</td>
              <td class="border border-gray-300 px-4 py-2 text-right">{count}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>

    <!-- Dolgozók -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Dolgozók</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th class="border border-gray-300 px-4 py-2 text-left">Munkaterület</th>
            <th class="border border-gray-300 px-4 py-2 text-right">Létszám</th>
          </tr>
        </thead>
        <tbody>
          {#each Object.entries(workStats) as [area, count]}
            <tr>
              <td class="border border-gray-300 px-4 py-2">{area}</td>
              <td class="border border-gray-300 px-4 py-2 text-right">{count}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>

    <!-- Jövedelem Statisztikák -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Jövedelem Statisztikák</h2>
      {#if hasProvidedIncome}
        <table class="table-auto w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th class="border border-gray-300 px-4 py-2 text-left">Statisztika</th>
              <th class="border border-gray-300 px-4 py-2 text-right">Érték</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-gray-300 px-4 py-2">Átlag</td>
              <td class="border border-gray-300 px-4 py-2 text-right">{incomeStats.avg.toFixed(2)}</td>
            </tr>
            <tr>
              <td class="border border-gray-300 px-4 py-2">Medián</td>
              <td class="border border-gray-300 px-4 py-2 text-right">{incomeStats.median.toFixed(2)}</td>
            </tr>
            <tr>
              <td class="border border-gray-300 px-4 py-2">Legalacsonyabb</td>
              <td class="border border-gray-300 px-4 py-2 text-right">{incomeStats.min.toFixed(2)}</td>
            </tr>
            <tr>
              <td class="border border-gray-300 px-4 py-2">Legmagasabb</td>
              <td class="border border-gray-300 px-4 py-2 text-right">{incomeStats.max.toFixed(2)}</td>
            </tr>
            <tr>
              <td class="border border-gray-300 px-4 py-2">Adatszám</td>
              <td class="border border-gray-300 px-4 py-2 text-right">{incomeStats.count}</td>
            </tr>
          </tbody>
        </table>
      {:else}
        <div class="blur relative">
          <p class="absolute top-2 left-2 text-gray-500">Jövedelem megadása szükséges a statisztikák megtekintéséhez</p>
          <div class="blurred-content bg-gray-100 p-6 rounded-lg">
            <table class="table-auto w-full border-collapse border border-gray-200">
              <thead>
                <tr>
                  <th class="border border-gray-300 px-4 py-2 text-left">Statisztika</th>
                  <th class="border border-gray-300 px-4 py-2 text-right">Érték</th>
                </tr>
              </thead>
            </table>
          </div>
        </div>
      {/if}
    </section>
  {/if}
</main>

<style>
  .blur {
    position: relative;
    filter: blur(5px);
    pointer-events: none;
  }
  .absolute {
    position: absolute;
    z-index: 10;
  }
</style>
