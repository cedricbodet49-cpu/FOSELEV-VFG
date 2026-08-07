(() => {
  'use strict';

  const VERSION = '3.2.1';
  const STORAGE_KEYS = {
    recents: 'foselev_v3_recent_machines',
    activeMachine: 'foselev_v3_active_machine',
    visits: 'foselev_v3_visits'
  };

  const DEFAULT_REFERENTIAL = {
    carrier: [
      ['documentation', 'Documentation et plaques', 20],
      ['structure', 'Châssis / Structure', 18],
      ['powertrain', 'Moteur & Transmission', 42],
      ['stabilisers', 'Stabilisateurs', 36],
      ['tyres', 'Pneumatiques', 12],
      ['lighting', 'Éclairage', 20],
      ['cab', 'Cabine porteur', 28],
      ['electrical', 'Électricité porteur', 16],
      ['hydraulic', 'Hydraulique porteur', 54],
      ['access', 'Coffres / Accès', 14]
    ],
    upper: [
      ['upperCab', 'Cabine tourelle', 32],
      ['cec', 'CEC / Codes défaut', 14],
      ['boom', 'Flèche', 118],
      ['mainWinch', 'Treuil principal', 28],
      ['auxWinch', 'Treuil auxiliaire', 20],
      ['upperElectrical', 'Électricité tourelle', 18],
      ['workLights', 'Éclairage de travail', 14],
      ['counterweight', 'Contrepoids', 10],
      ['slewRing', 'Couronne d’orientation', 20],
      ['upperHydraulic', 'Hydraulique tourelle', 28],
      ['lmi', 'Limiteur de charge', 18]
    ]
  };

  const state = {
    machines: [],
    activeMachine: null,
    activeVisit: null,
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

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }

  function machineKey(machine) {
    return String(machine.id || machine.parkNumber || machine.serialNumber || '').trim();
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
      throw new Error('Données parc indisponibles. Vérifiez la présence de parc.js.');
    }
    const response = await fetch('./parc.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Chargement parc impossible (${response.status})`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Format parc.json invalide');
    return data;
  }

  function loadJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function loadRecents() {
    state.recents = loadJson(STORAGE_KEYS.recents, []);
  }

  function rememberMachine(machine) {
    const summary = {
      id: machineKey(machine),
      parkNumber: machine.parkNumber || machine.id,
      brand: machine.brand || '',
      model: machine.model || '',
      designation: machine.designation || '',
      serialNumber: machine.serialNumber || '',
      agency: machine.agency || '',
      category: machine.category || ''
    };
    state.recents = [summary, ...state.recents.filter(item => machineKey(item) !== summary.id)].slice(0, 10);
    saveJson(STORAGE_KEYS.recents, state.recents);
    saveJson(STORAGE_KEYS.activeMachine, summary);
    renderMachineList($('#recentMachines'), state.recents, 'Aucune machine récente. Lancez une recherche.');
  }

  function clearRecents() {
    state.recents = [];
    localStorage.removeItem(STORAGE_KEYS.recents);
  }

  function createSections(zone) {
    return DEFAULT_REFERENTIAL[zone].map(([id, label, total]) => ({
      id, label, total, remaining: total, ncOpen: 0, ncTotal: 0
    }));
  }

  function createVisit(machine) {
    const now = new Date().toISOString();
    return {
      id: `V3-${machineKey(machine)}-${Date.now()}`,
      machineId: machineKey(machine),
      machineSnapshot: {
        id: machineKey(machine),
        parkNumber: machine.parkNumber || machine.id || '',
        serialNumber: machine.serialNumber || '',
        brand: machine.brand || '',
        model: machine.model || machine.designation || '',
        agency: machine.agency || '',
        category: machine.category || ''
      },
      status: 'En cours',
      createdAt: now,
      updatedAt: now,
      zones: {
        carrier: { sections: createSections('carrier') },
        upper: { sections: createSections('upper') }
      },
      findings: []
    };
  }

  function ensureVisitSchema(visit, machine) {
    let changed = false;

    if (!visit || typeof visit !== 'object') {
      return { visit: createVisit(machine), changed: true };
    }

    if (!visit.machineId) {
      visit.machineId = machineKey(machine);
      changed = true;
    }

    if (!visit.machineSnapshot || typeof visit.machineSnapshot !== 'object') {
      visit.machineSnapshot = createVisit(machine).machineSnapshot;
      changed = true;
    }

    if (!visit.zones || typeof visit.zones !== 'object') {
      visit.zones = {};
      changed = true;
    }

    for (const zone of ['carrier', 'upper']) {
      if (!visit.zones[zone] || typeof visit.zones[zone] !== 'object') {
        visit.zones[zone] = { sections: createSections(zone) };
        changed = true;
        continue;
      }

      if (!Array.isArray(visit.zones[zone].sections) || visit.zones[zone].sections.length === 0) {
        visit.zones[zone].sections = createSections(zone);
        changed = true;
        continue;
      }

      const defaults = createSections(zone);
      const existingById = new Map(visit.zones[zone].sections.map(section => [section.id, section]));
      const merged = defaults.map(defaultSection => {
        const existing = existingById.get(defaultSection.id);
        if (!existing) {
          changed = true;
          return defaultSection;
        }
        return {
          ...defaultSection,
          ...existing,
          total: Number(existing.total ?? defaultSection.total),
          remaining: Number(existing.remaining ?? existing.total ?? defaultSection.total),
          ncOpen: Number(existing.ncOpen || 0),
          ncTotal: Number(existing.ncTotal || 0)
        };
      });

      if (merged.length !== visit.zones[zone].sections.length) changed = true;
      visit.zones[zone].sections = merged;
    }

    if (!Array.isArray(visit.findings)) {
      visit.findings = [];
      changed = true;
    }

    if (!visit.updatedAt) {
      visit.updatedAt = new Date().toISOString();
      changed = true;
    }

    return { visit, changed };
  }

  function getOrCreateVisit(machine) {
    const visits = loadJson(STORAGE_KEYS.visits, []);
    const id = machineKey(machine);
    let visit = visits.find(item => item.machineId === id && item.status === 'En cours');

    if (!visit) {
      visit = createVisit(machine);
      visits.unshift(visit);
      saveJson(STORAGE_KEYS.visits, visits);
      return visit;
    }

    const migrated = ensureVisitSchema(visit, machine);
    visit = migrated.visit;

    if (migrated.changed) {
      visit.updatedAt = new Date().toISOString();
      const index = visits.findIndex(item => item.id === visit.id || (item.machineId === id && item.status === 'En cours'));
      if (index >= 0) visits[index] = visit;
      else visits.unshift(visit);
      saveJson(STORAGE_KEYS.visits, visits);
    }

    return visit;
  }

  function zoneProgress(visit, zone) {
    const sections = visit?.zones?.[zone]?.sections || [];
    return sections.reduce((summary, section) => {
      summary.remaining += Number(section.remaining ?? section.total ?? 0);
      summary.total += Number(section.total || 0);
      summary.ncOpen += Number(section.ncOpen || 0);
      summary.ncTotal += Number(section.ncTotal || 0);
      return summary;
    }, { remaining: 0, total: 0, ncOpen: 0, ncTotal: 0 });
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

  function renderProgress(zone, progress) {
    $(`#${zone}Progress`).textContent = `${progress.remaining}/${progress.total}`;
    const button = $(`#${zone}Nc`);
    button.textContent = `NC ${progress.ncOpen}/${progress.ncTotal}`;
    button.classList.toggle('hidden', progress.ncTotal === 0);
  }

  function renderDashboard() {
    const machine = state.activeMachine;
    const visit = state.activeVisit;
    $('#dashboardTitle').textContent = `${machine.parkNumber || machine.id} – ${machine.model || machine.designation || 'Machine'}`;
    $('#dashboardSubtitle').textContent = [
      machine.brand,
      machine.serialNumber ? `Série ${machine.serialNumber}` : '',
      machine.agency
    ].filter(Boolean).join(' · ');
    renderProgress('carrier', zoneProgress(visit, 'carrier'));
    renderProgress('upper', zoneProgress(visit, 'upper'));
  }

  function openMachine(machine) {
    state.activeMachine = machine;
    state.activeVisit = getOrCreateVisit(machine);
    rememberMachine(machine);
    renderDashboard();
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
      const zone = button.dataset.openZone;
      const label = zone === 'carrier' ? 'Porteur' : 'Tourelle';
      const progress = zoneProgress(state.activeVisit, zone);
      openPlaceholder(label, `${progress.remaining} point(s) restant(s) sur ${progress.total}. La liste des organes arrive en V3.3.`);
    }));

    document.querySelectorAll('[data-open-nc]').forEach(button => button.addEventListener('click', () => {
      const label = button.dataset.openNc === 'carrier' ? 'Porteur' : 'Tourelle';
      openPlaceholder(`Constats ${label}`, 'Cette vue regroupera les constats enregistrés et ceux en cours de traitement.');
    }));

    document.querySelectorAll('[data-go-dashboard]').forEach(button => button.addEventListener('click', () => showScreen('dashboard')));
    $('#finishVisit').addEventListener('click', () => {
      const carrier = zoneProgress(state.activeVisit, 'carrier');
      const upper = zoneProgress(state.activeVisit, 'upper');
      const remaining = carrier.remaining + upper.remaining;
      if (remaining > 0) toast(`Impossible de terminer : ${remaining} point(s) restent à contrôler.`);
      else toast('La génération du rapport sera ajoutée dans un prochain sprint.');
    });

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
