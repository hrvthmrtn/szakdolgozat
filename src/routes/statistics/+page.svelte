<script lang="ts">
  import { supabase } from '../../supabaseClient.js';
  import { onMount, onDestroy, tick } from 'svelte';
  import Chart from 'chart.js/auto';

  let studyData: any[] = [];
  let workData: any[] = [];
  let incomeStats: any = null;
  let selectedUniversity = '';
  let selectedFaculty = '';
  let selectedMajor = '';
  let selectedWorkArea = '';
  let selectedProfession = '';
  let isLoading = true;


  let educationChart: Chart;
  let workChart: Chart;
  let incomeChart: Chart;
  let educationCanvas: HTMLCanvasElement;
  let workCanvas: HTMLCanvasElement;
  let incomeCanvas: HTMLCanvasElement;

  onMount(async () => {
    try {
      const { data: studyRes, error: studyError } = await supabase.from('study').select('*');
      if (studyError) throw studyError;

      const { data: workRes, error: workError } = await supabase.from('work').select('*');
      if (workError) throw workError;

      studyData = studyRes || [];
      workData = workRes || [];
      isLoading = false;

      await tick();
      updateCharts();
    } catch (error) {
      console.error('Hiba történt:', error.message);
      isLoading = false;
    }
  });

  onDestroy(() => {
    if (educationChart) educationChart.destroy();
    if (workChart) workChart.destroy();
    if (incomeChart) incomeChart.destroy();
  });


  $: if (!isLoading) {
    updateCharts();
  }


  function filterStudyData() {
    return studyData.filter(d =>
      (!selectedUniversity || d.university === selectedUniversity) &&
      (!selectedFaculty || d.faculty === selectedFaculty) &&
      (!selectedMajor || d.major === selectedMajor)
    ).reduce((acc: Record<string, number>, curr) => {
      const key = `${curr.university} - ${curr.faculty} - ${curr.major}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }


  function aggregateStudyDataForChart() {
    return studyData.reduce((acc: Record<string, number>, curr) => {
      const key = curr.university;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  function filterWorkData() {
    return workData.filter(d =>
      (!selectedWorkArea || d.work_area === selectedWorkArea) &&
      (!selectedProfession || d.profession === selectedProfession)
    ).reduce((acc: Record<string, number>, curr) => {
      acc[curr.profession] = (acc[curr.profession] || 0) + 1;
      return acc;
    }, {});
  }

  $: incomeStats = (() => {
    const filtered = workData.filter(d =>
      (!selectedWorkArea || d.work_area === selectedWorkArea) &&
      (!selectedProfession || d.profession === selectedProfession) &&
      d.income !== null
    );
    if (!filtered.length) return null;
    const incomes = filtered.map(d => d.income);
    incomes.sort((a, b) => a - b);
    return {
      avg: (incomes.reduce((a, b) => a + b, 0) / incomes.length).toFixed(0),
      median: incomes[Math.floor(incomes.length / 2)],
      min: Math.min(...incomes),
      max: Math.max(...incomes),
      count: incomes.length
    };
  })();

  function updateCharts() {

    if (!educationCanvas || !workCanvas || !incomeCanvas) return;

    const studyChartData = aggregateStudyDataForChart();
    const workFiltered = filterWorkData();


    if (educationChart) educationChart.destroy();
    educationChart = new Chart(educationCanvas, {
      type: 'pie',
      data: {
        labels: Object.keys(studyChartData),
        datasets: [{
          label: 'Továbbtanulók száma',
          data: Object.values(studyChartData),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });


    if (workChart) workChart.destroy();
    workChart = new Chart(workCanvas, {
      type: 'bar',
      data: {
        labels: Object.keys(workFiltered),
        datasets: [{
          label: 'Dolgozók száma',
          data: Object.values(workFiltered),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    });


    if (incomeChart) incomeChart.destroy();
    if (incomeStats) {
      incomeChart = new Chart(incomeCanvas, {
        type: 'bar',
        data: {
          labels: ['Átlag', 'Medián', 'Minimum', 'Maximum'],
          datasets: [{
            label: 'Jövedelmek',
            data: [incomeStats.avg, incomeStats.median, incomeStats.min, incomeStats.max],
            backgroundColor: 'rgba(255, 159, 64, 0.5)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 }
            }
          }
        }
      });
    }
  }
</script>

<svelte:head>
  <title>Iskolai nyilvántartó - Statisztika</title>
  </svelte:head>

<main class="container">
  <h1 class="text-4xl font-bold text-center mb-8">Statisztikai Adatok</h1>

  {#if isLoading}
    <p class="text-center">Adatok betöltése...</p>
  {:else}

    <section class="mb-12">
      <h2 class="section-title">Továbbtanulók Statisztikái</h2>
      
      <div class="filter-box">
        <select bind:value={selectedUniversity}>
          <option value="">Összes egyetem</option>
          {#each Array.from(new Set(studyData.map(d => d.university))) as university}
            <option value={university}>{university}</option>
          {/each}
        </select>

        <select bind:value={selectedFaculty}>
          <option value="">Összes kar</option>
          {#each Array.from(new Set(studyData.map(d => d.faculty))) as faculty}
            <option value={faculty}>{faculty}</option>
          {/each}
        </select>

        <select bind:value={selectedMajor}>
          <option value="">Összes szak</option>
          {#each Array.from(new Set(studyData.map(d => d.major))) as major}
            <option value={major}>{major}</option>
          {/each}
        </select>
      </div>

   
      {#if Object.keys(filterStudyData()).length > 0}
        <ul class="styled-list">
          {#each Object.entries(filterStudyData()) as [key, count]}
            <li class="list-item">
              <span class="list-title">{key}</span>
              <span class="list-count">{count} fő</span>
            </li>
          {/each}
        </ul>
      {/if}

      <canvas bind:this={educationCanvas} style="width: 800px; height: 400px; margin: 0 auto; display: block;"></canvas>
    </section>

    <section class="mb-12">
      <h2 class="section-title">Dolgozók Statisztikái</h2>
      
      <div class="filter-box">
        <select bind:value={selectedWorkArea}>
          <option value="">Összes régió</option>
          {#each Array.from(new Set(workData.map(d => d.work_area))) as area}
            <option value={area}>{area}</option>
          {/each}
        </select>

        <select bind:value={selectedProfession}>
          <option value="">Összes foglalkozás</option>
          {#each Array.from(new Set(workData.map(d => d.profession))) as profession}
            <option value={profession}>{profession}</option>
          {/each}
        </select>
      </div>

      {#if Object.keys(filterWorkData()).length > 0}
        <ul class="styled-list">
          {#each Object.entries(filterWorkData()) as [profession, count]}
            <li class="list-item">
              <span class="list-title">{profession}</span>
              <span class="list-count">{count} fő</span>
            </li>
          {/each}
        </ul>
      {/if}

      <canvas bind:this={workCanvas} style="width: 100%; height: 300px;"></canvas>

      {#if incomeStats}
        <canvas bind:this={incomeCanvas} style="width: 100%; height: 300px;"></canvas>
        <div class="income-box">
          <h3 class="section-title">Jövedelmi mutatók</h3>
          <div class="grid">
            <div class="stat-card">
              <label>Átlag</label>
              <div class="stat-value">{incomeStats.avg} Ft</div>
            </div>
            <div class="stat-card">
              <label>Medián</label>
              <div class="stat-value">{incomeStats.median} Ft</div>
            </div>
            <div class="stat-card">
              <label>Minimum</label>
              <div class="stat-value">{incomeStats.min} Ft</div>
            </div>
            <div class="stat-card">
              <label>Maximum</label>
              <div class="stat-value">{incomeStats.max} Ft</div>
            </div>
          </div>
        </div>
      {/if}
    </section>
  {/if}
</main>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    background: #f8fafc;
  }

  .section-title {
    background: #4caf50;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 2rem;
  }

  .filter-box {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  select {
    padding: 0.8rem;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: white;
  }

  .styled-list {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 1rem;
    margin-bottom: 2rem;
  }

  .list-item {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .list-title {
    color: #4caf50;
    font-weight: 600;
  }

  .income-box {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    margin-top: 2rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-card {
    background: #f1f5f9;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
  }

  .stat-card label {
    color: #64748b;
    display: block;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    color: #4caf50;
    font-size: 1.5rem;
    font-weight: bold;
  }
</style>
