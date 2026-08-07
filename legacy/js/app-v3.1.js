(() => {
  'use strict';

  const VERSION = '3.1.0';
  const STORAGE_KEYS = {
    recents: 'foselev_v3_recent_machines',
    activeMachine: 'foselev_v3_active_machine',
    visits: 'foselev_vfg_visits'
  };

  const state = {
    machines: [],
    activeMachine: null,
    recents: [],
    activeScreen: 'search'
  };

  const $ = selector => document.querySelector(selector);
  const screens = {};

  function normalize(value = '') {
    return String(value)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function machineText(machine) {
    return normalize([
      machine.id, machine.parkNumber, machine.rawParkNumber,
      machine.serialNumber, machine.registration, machine.brand,
      machine.model, machine.designation, machine.company,
      machine.agency, machine.agencyCode, machine.city
    ].filter(Boolean).join(' '));
  }

  function searchMachines(query) {
    const q = normalize(query);
    if (!q) return [];
    const compactQ = q.replace(/\s+/g, '');
    return state.machines
      .map(machine => {
        const park = normalize(machine.parkNumber || machine.id).replace(/\s+/g, '');
        const serial = normalize(machine.serialNumber).replace(/\s+/g, '');
        const text = machineText(machine);
        let score = 0;
        if (park === compactQ) score = 100;
        else if (serial && serial === compactQ) score = 95;
        else if (park.startsWith(compactQ)) score = 85;
        else if (serial && serial.startsWith(compactQ)) score = 80;
        else if (text.includes(q)) score = 50;
        return { machine, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || String(a.machine.parkNumber).localeCompare(String(b.machine.parkNumber), 'fr', { numeric: true }))
      .slice(0, 60)
      .map(item => item.machine);
  }

  async function loadMachines() {
    if (Array.isArray(window.FOSELEV_MACHINES) && window.FOSELEV_MACHINES.length) {
      return window.FOSELEV_MACHINES;
    }
    if (location.protocol === 'file:') {
      throw new Error('Données parc indisponibles en ouverture locale. Le fichier parc.js doit être présent.');
    }
    const response = await fetch('./parc.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Chargement parc impossible (${response.status})`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Format parc.json invalide');
    return data;
  }

  function loadRecents() {
    try { state.recents = JSON.parse(localStorage.getItem(STORAGE_KEYS.recents) || '[]'); }
    catch { state.recents = []; }
  }

  function rememberMachine(machine) {
    const summary = {
      id: machine.id || machine.parkNumber,
      parkNumber: machine.parkNumber || machine.id,
      brand: machine.brand || '', model: machine.model || '',
      designation: machine.designation || '', serialNumber: machine.serialNumber || '',
      agency: machine.agency || '', category: machine.category || ''
    };
    state.recents = [summary, ...state.recents.filter(item => (item.id || item.parkNumber) !== summary.id)].slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.recents, JSON.stringify(state.recents));
    localStorage.setItem(STORAGE_KEYS.activeMachine, JSON.stringify(summary));
    renderMachineList($('#recentMachines'), state.recents, 'Aucune machine récente. Lancez une recherche.');
  }

  function clearRecents() {
    state.recents = [];
    localStorage.removeItem(STORAGE_KEYS.recents);
  }

  function showScreen(name) {
    Object.values(screens).forEach(el => el && el.classList.remove('active'));
    if (screens[name]) screens[name].classList.add('active');
    state.activeScreen = name;
    $('#backButton').classList.toggle('hidden', name === 'search');
    window.scrollTo(0, 0);
  }

  function categoryIcon(category, model = '') {
    if (/\bmk\b/i.test(model)) return '🏗️';
    if (category === 'CB') return '🚚';
    if (category === 'CN') return '🚐';
    return '🏗️';
  }

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
  }

  function machineRow(machine) {
    const button = document.createElement('button');
    button.className = 'machine-row';
    button.type = 'button';
    const title = machine.parkNumber || machine.id || 'Machine';
    const description = [machine.brand, machine.model || machine.designation].filter(Boolean).join(' · ');
    button.innerHTML = `
      <span class="machine-icon" aria-hidden="true">${categoryIcon(machine.category, machine.model)}</span>
      <span class="machine-main"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(description)}${machine.agency ? `<br>${escapeHtml(machine.agency)}` : ''}</span></span>
      <span class="machine-arrow" aria-hidden="true">›</span>`;
    button.addEventListener('click', () => openMachine(machine));
    return button;
  }

  function renderMachineList(container, machines, emptyText) {
    container.replaceChildren();
    if (!machines.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = emptyText;
      container.appendChild(empty);
      return;
    }
    machines.forEach(machine => container.appendChild(machineRow(machine)));
  }

  function visitProgress(machineId) {
    let visits = [];
    try { visits = JSON.parse(localStorage.getItem(STORAGE_KEYS.visits) || '[]'); } catch {}
    const visit = visits.find(v => v.machineSnapshot?.id === machineId || v.machineSnapshot?.parkNumber === machineId);
    if (!visit) return {
      carrier: { remaining: 0, total: 0, ncOpen: 0, ncTotal: 0 },
      upper: { remaining: 0, total: 0, ncOpen: 0, ncTotal: 0 }
    };
    const checks = Array.isArray(visit.checks) ? visit.checks : [];
    const derive = list => ({
      remaining: list.filter(c => !['Conforme','Observation','Réserve','Non conforme'].includes(c.status)).length,
      total: list.length,
      ncOpen: list.filter(c => c.status === 'Non conforme' && c.workflowStatus === 'En cours').length,
      ncTotal: list.filter(c => c.status === 'Non conforme').length
    });
    return {
      carrier: derive(checks.filter(c => normalize(c.zone || c.section).includes('porteur'))),
      upper: derive(checks.filter(c => normalize(c.zone || c.section).includes('tourelle')))
    };
  }

  function renderProgress(zone, progress) {
    $(`#${zone}Progress`).textContent = `${progress.remaining}/${progress.total}`;
    const button = $(`#${zone}Nc`);
    button.textContent = `NC ${progress.ncOpen}/${progress.ncTotal}`;
    button.classList.toggle('hidden', progress.ncTotal === 0);
  }

  function openMachine(machine) {
    state.activeMachine = machine;
    rememberMachine(machine);
    $('#dashboardTitle').textContent = `${machine.parkNumber || machine.id} · ${machine.model || machine.designation || 'Machine'}`;
    $('#dashboardSubtitle').textContent = [machine.brand, machine.serialNumber ? `Série ${machine.serialNumber}` : '', machine.agency].filter(Boolean).join(' · ');
    const progress = visitProgress(machine.id || machine.parkNumber);
    renderProgress('carrier', progress.carrier);
    renderProgress('upper', progress.upper);
    showScreen('dashboard');
  }

  function openPlaceholder(title, text) {
    $('#placeholderTitle').textContent = title;
    $('#placeholderText').textContent = text;
    showScreen('placeholder');
  }

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.remove('hidden');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.add('hidden'), 2600);
  }

  function refreshSearch() {
    const input = $('#machineSearch');
    const query = input.value.trim();
    $('#clearSearch').classList.toggle('hidden', !query);
    $('#resultsSection').classList.toggle('hidden', !query);
    if (!query) return renderMachineList($('#searchResults'), [], '');
    const results = searchMachines(query);
    $('#resultCount').textContent = results.length;
    renderMachineList($('#searchResults'), results, 'Aucune machine trouvée.');
  }

  function bindEvents() {
    const input = $('#machineSearch');
    input.addEventListener('input', refreshSearch);
    $('#clearSearch').addEventListener('click', () => {
      input.value = '';
      refreshSearch();
      input.focus();
    });
    $('#clearRecents').addEventListener('click', () => {
      clearRecents();
      renderMachineList($('#recentMachines'), [], 'Aucune machine récente. Lancez une recherche.');
    });
    $('#backButton').addEventListener('click', () => {
      if (state.activeScreen === 'placeholder') showScreen('dashboard');
      else showScreen('search');
    });
    $('#helpButton').addEventListener('click', () => toast('Recherchez par n° de parc, série, modèle, constructeur ou agence.'));
    document.querySelectorAll('[data-open-zone]').forEach(button => button.addEventListener('click', () => {
      const label = button.dataset.openZone === 'carrier' ? 'Porteur' : 'Tourelle';
      openPlaceholder(label, `La liste de contrôle ${label.toLowerCase()} sera intégrée au prochain sprint.`);
    }));
    document.querySelectorAll('[data-open-nc]').forEach(button => button.addEventListener('click', () => {
      const label = button.dataset.openNc === 'carrier' ? 'Porteur' : 'Tourelle';
      openPlaceholder(`Constats ${label}`, 'Cette vue regroupera les constats enregistrés et ceux en cours de traitement.');
    }));
    document.querySelectorAll('[data-go-dashboard]').forEach(button => button.addEventListener('click', () => showScreen('dashboard')));
    $('#finishVisit').addEventListener('click', () => toast('La clôture et le rapport seront ajoutés dans un sprint suivant.'));

    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(console.error));
    }
  }

  async function init() {
    screens.search = $('#searchScreen');
    screens.dashboard = $('#dashboardScreen');
    screens.placeholder = $('#placeholderScreen');
    loadRecents();
    renderMachineList($('#recentMachines'), state.recents, 'Aucune machine récente. Lancez une recherche.');
    bindEvents();
    try {
      state.machines = await loadMachines();
      document.documentElement.dataset.parcLoaded = 'true';
      refreshSearch();
      toast(`${state.machines.length} machines chargées.`);
    } catch (error) {
      console.error(error);
      toast(error.message || 'Impossible de charger le parc matériel.');
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
