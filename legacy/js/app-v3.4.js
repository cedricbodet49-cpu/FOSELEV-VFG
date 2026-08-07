(() => {
  'use strict';

  const VERSION = '3.4.0';
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

  const POINT_TEMPLATES = {
    documentation: ['Plaques constructeur', 'Numéro de série', 'Carte grise', 'Carnet d’entretien', 'Documents réglementaires'],
    structure: ['État général du châssis', 'Soudures', 'Fixations', 'Corrosion', 'Déformations', 'Protections'],
    powertrain: ['Niveau d’huile moteur', 'Fuites moteur', 'Courroies et tendeurs', 'Circuit de refroidissement', 'Filtration', 'Transmission', 'Échappement'],
    stabilisers: ['Poutres', 'Vérins verticaux', 'Vérins horizontaux', 'Patins', 'Flexibles', 'Verrouillages', 'Commandes'],
    tyres: ['Usure', 'Pression', 'Flancs', 'Jantes', 'Écrous de roues', 'Valves'],
    lighting: ['Feux de route', 'Feux de position', 'Clignotants', 'Feux stop', 'Feux de recul', 'Feux de gabarit tourelle'],
    cab: ['État cabine', 'Siège', 'Ceinture', 'Rétroviseurs', 'Essuie-glaces', 'Tableau de bord', 'Avertisseur sonore'],
    electrical: ['Batteries', 'Coupe-batterie', 'Faisceaux', 'Connecteurs', 'Fusibles', 'Alternateur', 'Démarreur'],
    hydraulic: ['Réservoir', 'Niveau d’huile', 'Pompes', 'Flexibles', 'Raccords', 'Distributeurs', 'Vérins', 'Fuites'],
    access: ['Coffres', 'Capots', 'Échelles', 'Marchepieds', 'Poignées', 'Protections'],
    upperCab: ['État cabine', 'Siège', 'Ceinture', 'Vitrages', 'Essuie-glaces', 'Commandes', 'Écrans', 'Climatisation'],
    cec: ['Codes défaut', 'Écrans', 'Alarmes', 'Capteurs', 'Paramètres', 'Historique défauts'],
    boom: ['Structure de flèche', 'Soudures', 'Axes', 'Patins', 'Vérin de relevage', 'Vérins de télescopage', 'Flexibles', 'Enrouleurs', 'Tête de flèche', 'Robot de flèche'],
    mainWinch: ['Câble', 'Tambour', 'Réducteur', 'Frein', 'Fixations', 'Graissage', 'Enrouleur', 'Crochet'],
    auxWinch: ['Câble', 'Tambour', 'Réducteur', 'Frein', 'Fixations', 'Graissage', 'Enrouleur', 'Crochet'],
    upperElectrical: ['Batteries', 'Faisceaux', 'Connecteurs', 'Capteurs', 'Boîtiers', 'Mise à la masse'],
    workLights: ['Projecteurs cabine', 'Projecteurs flèche', 'Projecteurs treuils', 'Projecteurs poutres'],
    counterweight: ['Éléments de contrepoids', 'Verrouillages', 'Axes', 'Fixations', 'Système de dépose'],
    slewRing: ['Boulonnerie', 'Graissage', 'Jeu', 'Dentures', 'Pignon d’orientation', 'Frein d’orientation'],
    upperHydraulic: ['Réservoir', 'Pompes', 'Flexibles', 'Raccords', 'Distributeurs', 'Vérins', 'Fuites'],
    lmi: ['Affichage', 'Capteurs', 'Limiteurs', 'Alarmes', 'Fin de course', 'Anémomètre']
  };

  function buildPoints(section) {
    const total = Number(section.total || 0);
    const seeds = POINT_TEMPLATES[section.id] || [];
    return Array.from({ length: total }, (_, index) => ({
      id: `${section.id}-${String(index + 1).padStart(3, '0')}`,
      label: seeds[index] || `${section.label} — contrôle ${index + 1}`,
      status: 'pending',
      findingId: null
    }));
  }

  const state = {
    machines: [],
    activeMachine: null,
    activeVisit: null,
    recents: [],
    activeScreen: 'search',
    activeZone: null,
    activeSectionId: null,
    activePointId: null
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
    return DEFAULT_REFERENTIAL[zone].map(([id, label, total]) => {
      const section = { id, label, total, remaining: total, ncOpen: 0, ncTotal: 0 };
      section.points = buildPoints(section);
      return section;
    });
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
        const mergedSection = {
          ...defaultSection,
          ...existing,
          total: Number(existing.total ?? defaultSection.total),
          remaining: Number(existing.remaining ?? existing.total ?? defaultSection.total),
          ncOpen: Number(existing.ncOpen || 0),
          ncTotal: Number(existing.ncTotal || 0)
        };
        if (!Array.isArray(existing.points) || existing.points.length !== mergedSection.total) {
          const fresh = buildPoints(mergedSection);
          const controlled = Math.max(0, mergedSection.total - Number(existing.remaining ?? mergedSection.total));
          for (let index = 0; index < controlled && index < fresh.length; index += 1) fresh[index].status = 'conform';
          mergedSection.points = fresh;
          changed = true;
        } else {
          mergedSection.points = existing.points.map((point, index) => ({
            id: point.id || `${mergedSection.id}-${String(index + 1).padStart(3, '0')}`,
            label: point.label || buildPoints(mergedSection)[index]?.label || `${mergedSection.label} — contrôle ${index + 1}`,
            status: ['pending', 'conform', 'finding'].includes(point.status) ? point.status : 'pending',
            findingId: point.findingId || null
          }));
        }
        recalculateSection(mergedSection);
        return mergedSection;
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

  function recalculateSection(section) {
    if (!Array.isArray(section.points)) section.points = buildPoints(section);
    section.total = section.points.length;
    section.remaining = section.points.filter(point => point.status === 'pending').length;
    section.ncTotal = section.points.filter(point => point.status === 'finding').length;
    section.ncOpen = section.ncTotal;
    return section;
  }

  function currentSection() {
    return state.activeVisit?.zones?.[state.activeZone]?.sections?.find(section => section.id === state.activeSectionId) || null;
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



  const SECTION_ICONS = {
    documentation: '📋', structure: '🏗️', powertrain: '⚙️', stabilisers: '🦵',
    tyres: '🛞', lighting: '💡', cab: '🚪', electrical: '⚡', hydraulic: '💧',
    access: '🧰', upperCab: '👨‍✈️', cec: '💻', boom: '🏗️', mainWinch: '🪝',
    auxWinch: '🪝', upperElectrical: '⚡', workLights: '💡', counterweight: '⚖️',
    slewRing: '🔄', upperHydraulic: '💧', lmi: '📡'
  };

  function saveActiveVisit() {
    if (!state.activeVisit) return;
    const visits = loadJson(STORAGE_KEYS.visits, []);
    const index = visits.findIndex(item => item.id === state.activeVisit.id);
    state.activeVisit.updatedAt = new Date().toISOString();
    if (index >= 0) visits[index] = state.activeVisit;
    else visits.unshift(state.activeVisit);
    saveJson(STORAGE_KEYS.visits, visits);
  }

  function sectionProgress(section) {
    recalculateSection(section);
    const total = Number(section.total || 0);
    const remaining = Number(section.remaining ?? total);
    return { remaining, total, controlled: Math.max(0, total - remaining) };
  }

  function sectionNcTotal(section) {
    return Number(section.ncTotal || 0);
  }

  function renderSectionList() {
    const zone = state.activeZone;
    const list = $('#sectionList');
    if (!zone || !state.activeVisit) return;
    const query = normalize($('#sectionSearch')?.value || '');
    const sections = state.activeVisit.zones?.[zone]?.sections || [];
    const filtered = sections.filter(section => !query || normalize(section.label).includes(query));
    list.replaceChildren();

    if (!filtered.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Aucune rubrique trouvée.';
      list.appendChild(empty);
      return;
    }

    filtered.forEach(section => {
      const progress = sectionProgress(section);
      const nc = sectionNcTotal(section);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `control-section-row${progress.remaining === 0 ? ' is-complete' : ''}`;
      button.innerHTML = `
        <span class="section-icon" aria-hidden="true">${SECTION_ICONS[section.id] || '✓'}</span>
        <span class="section-copy">
          <strong>${escapeHtml(section.label)}</strong>
          <small>${progress.controlled} point(s) contrôlé(s)</small>
        </span>
        <span class="section-metrics">
          <strong>${progress.remaining}/${progress.total}</strong>
          ${nc > 0 ? `<span class="section-nc">NC ${nc}</span>` : ''}
        </span>
        <span class="section-arrow" aria-hidden="true">›</span>`;
      button.addEventListener('click', event => {
        if (event.target.closest('.section-nc')) {
          openFindings(zone, section.id);
          return;
        }
        openInspection(zone, section.id);
      });
      list.appendChild(button);
    });
  }

  function pointStatusIcon(status) {
    if (status === 'conform') return '✓';
    if (status === 'finding') return '⚠';
    return '○';
  }

  function openInspection(zone, sectionId) {
    state.activeZone = zone;
    state.activeSectionId = sectionId;
    state.activePointId = null;
    renderInspection();
    showScreen('inspection');
  }

  function renderInspection() {
    const section = currentSection();
    if (!section) return;
    recalculateSection(section);
    const progress = sectionProgress(section);
    $('#inspectionTitle').textContent = section.label;
    $('#inspectionSubtitle').textContent = `${state.activeMachine.parkNumber || state.activeMachine.id} · ${state.activeZone === 'carrier' ? 'Porteur' : 'Tourelle'}`;
    $('#inspectionProgress').textContent = `${progress.remaining}/${progress.total}`;
    const treated = progress.total - progress.remaining;
    $('#validateSection').classList.toggle('hidden', treated > 0);
    const list = $('#pointList');
    list.replaceChildren();
    section.points.forEach((point, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `inspection-point is-${point.status}`;
      button.innerHTML = `
        <span class="point-index">${String(index + 1).padStart(2, '0')}</span>
        <span class="point-label">${escapeHtml(point.label)}</span>
        <span class="point-status" aria-label="${point.status}">${pointStatusIcon(point.status)}</span>`;
      button.addEventListener('click', () => openPointActions(point.id));
      list.appendChild(button);
    });
    saveActiveVisit();
  }

  function openPointActions(pointId) {
    const section = currentSection();
    const point = section?.points?.find(item => item.id === pointId);
    if (!point) return;
    state.activePointId = pointId;
    $('#pointActionTitle').textContent = point.label;
    $('#pointActionDialog').classList.remove('hidden');
    $('#pointActionDialog').setAttribute('aria-hidden', 'false');
  }

  function closePointActions() {
    $('#pointActionDialog').classList.add('hidden');
    $('#pointActionDialog').setAttribute('aria-hidden', 'true');
  }

  function setPointConform() {
    const section = currentSection();
    const point = section?.points?.find(item => item.id === state.activePointId);
    if (!point) return;
    if (point.findingId) {
      state.activeVisit.findings = state.activeVisit.findings.filter(finding => finding.id !== point.findingId);
    }
    point.status = 'conform';
    point.findingId = null;
    recalculateSection(section);
    saveActiveVisit();
    closePointActions();
    renderInspection();
    toast('Point enregistré conforme.');
  }

  function validateWholeSection() {
    const section = currentSection();
    if (!section) return;
    if (section.points.some(point => point.status !== 'pending')) {
      toast('La validation globale n’est disponible qu’avant le contrôle détaillé.');
      return;
    }
    section.points.forEach(point => { point.status = 'conform'; point.findingId = null; });
    recalculateSection(section);
    saveActiveVisit();
    renderZone(state.activeZone);
    toast('Rubrique entièrement validée.');
  }

  function openFindingForm() {
    const section = currentSection();
    const point = section?.points?.find(item => item.id === state.activePointId);
    if (!point) return;
    closePointActions();
    $('#findingPointLabel').textContent = point.label;
    const existing = point.findingId ? state.activeVisit.findings.find(finding => finding.id === point.findingId) : null;
    $('#findingLevel').value = existing?.level || '';
    $('#findingComment').value = existing?.comment || '';
    $('#findingFormTitle').textContent = existing ? 'Modifier le constat' : 'Ajouter un constat';
    $('#findingDelete').classList.toggle('hidden', !existing);
    showScreen('findingForm');
  }

  function saveFinding() {
    const section = currentSection();
    const point = section?.points?.find(item => item.id === state.activePointId);
    if (!point) return;
    const level = $('#findingLevel').value;
    if (!level) return toast('Choisissez le niveau du constat.');
    const existingIndex = point.findingId ? state.activeVisit.findings.findIndex(finding => finding.id === point.findingId) : -1;
    const finding = {
      id: point.findingId || `F-${Date.now()}`,
      zone: state.activeZone,
      sectionId: section.id,
      sectionLabel: section.label,
      pointId: point.id,
      pointLabel: point.label,
      title: point.label,
      level,
      comment: $('#findingComment').value.trim(),
      status: 'Enregistré',
      updatedAt: new Date().toISOString()
    };
    if (existingIndex >= 0) state.activeVisit.findings[existingIndex] = finding;
    else state.activeVisit.findings.push(finding);
    point.status = 'finding';
    point.findingId = finding.id;
    recalculateSection(section);
    saveActiveVisit();
    renderInspection();
    showScreen('inspection');
    toast('Constat enregistré.');
  }

  function deleteFinding() {
    const section = currentSection();
    const point = section?.points?.find(item => item.id === state.activePointId);
    if (!point?.findingId) return;
    state.activeVisit.findings = state.activeVisit.findings.filter(finding => finding.id !== point.findingId);
    point.findingId = null;
    point.status = 'pending';
    recalculateSection(section);
    saveActiveVisit();
    renderInspection();
    showScreen('inspection');
    toast('Constat supprimé.');
  }

  function renderZone(zone) {
    state.activeZone = zone;
    const label = zone === 'carrier' ? 'Porteur' : 'Tourelle';
    const progress = zoneProgress(state.activeVisit, zone);
    $('#zoneTitle').textContent = label;
    $('#zoneSubtitle').textContent = `${state.activeMachine.parkNumber || state.activeMachine.id} · ${state.activeMachine.model || state.activeMachine.designation || ''}`;
    $('#zoneProgress').textContent = `${progress.remaining}/${progress.total}`;
    const ncButton = $('#showZoneNc');
    ncButton.textContent = `NC ${progress.ncTotal}`;
    ncButton.classList.toggle('hidden', progress.ncTotal === 0);
    if ($('#sectionSearch')) $('#sectionSearch').value = '';
    renderSectionList();
    showScreen('zone');
  }

  function findingsFor(zone, sectionId = null) {
    return (state.activeVisit?.findings || []).filter(finding => {
      const sameZone = finding.zone === zone || finding.area === zone;
      const sameSection = !sectionId || finding.sectionId === sectionId;
      return sameZone && sameSection;
    });
  }

  function openFindings(zone, sectionId = null) {
    const label = zone === 'carrier' ? 'Porteur' : 'Tourelle';
    const section = sectionId ? state.activeVisit?.zones?.[zone]?.sections?.find(item => item.id === sectionId) : null;
    $('#findingsTitle').textContent = section ? `Constats · ${section.label}` : `Constats ${label}`;
    $('#findingsSubtitle').textContent = `${state.activeMachine.parkNumber || state.activeMachine.id} · enregistrés et en cours`;
    const list = $('#findingsList');
    const findings = findingsFor(zone, sectionId);
    list.replaceChildren();
    if (!findings.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-findings';
      empty.textContent = 'Aucun constat dans cette rubrique.';
      list.appendChild(empty);
    } else {
      findings.forEach(finding => {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'finding-row';
        row.innerHTML = `<strong>${escapeHtml(finding.title || finding.pointLabel || 'Constat')}</strong><span>${escapeHtml(finding.comment || finding.description || '')}</span><span class="finding-status">${escapeHtml(finding.status || 'Enregistré')}</span>`;
        row.addEventListener('click', () => { state.activeZone = finding.zone; state.activeSectionId = finding.sectionId; state.activePointId = finding.pointId; openFindingForm(); });
        list.appendChild(row);
      });
    }
    showScreen('findings');
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
    state.activeZone = null;
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
      if (state.activeScreen === 'findingForm') {
        renderInspection();
        showScreen('inspection');
      } else if (state.activeScreen === 'inspection') {
        renderZone(state.activeZone);
      } else if (state.activeScreen === 'placeholder') {
        if (state.activeZone) renderZone(state.activeZone);
        else showScreen('dashboard');
      } else if (state.activeScreen === 'findings') {
        if (state.activeZone) renderZone(state.activeZone);
        else showScreen('dashboard');
      } else if (state.activeScreen === 'zone') {
        showScreen('dashboard');
      } else if (state.activeScreen === 'dashboard') {
        showScreen('search');
      } else {
        showScreen('search');
      }
    });
    $('#helpButton').addEventListener('click', () => toast('Recherchez par n° de parc, série, modèle, constructeur ou agence.'));

    document.querySelectorAll('[data-open-zone]').forEach(button => button.addEventListener('click', () => {
      renderZone(button.dataset.openZone);
    }));

    document.querySelectorAll('[data-open-nc]').forEach(button => button.addEventListener('click', () => {
      openFindings(button.dataset.openNc);
    }));

    $('#sectionSearch').addEventListener('input', renderSectionList);
    $('#showZoneNc').addEventListener('click', () => openFindings(state.activeZone));

    document.querySelectorAll('[data-go-dashboard]').forEach(button => button.addEventListener('click', () => showScreen('dashboard')));
    $('#finishVisit').addEventListener('click', () => {
      const carrier = zoneProgress(state.activeVisit, 'carrier');
      const upper = zoneProgress(state.activeVisit, 'upper');
      const remaining = carrier.remaining + upper.remaining;
      if (remaining > 0) toast(`Impossible de terminer : ${remaining} point(s) restent à contrôler.`);
      else toast('La génération du rapport sera ajoutée dans un prochain sprint.');
    });

    $('#validateSection').addEventListener('click', validateWholeSection);
    $('#pointActionClose').addEventListener('click', closePointActions);
    $('#pointActionConform').addEventListener('click', setPointConform);
    $('#pointActionFinding').addEventListener('click', openFindingForm);
    $('#findingCancel').addEventListener('click', () => { renderInspection(); showScreen('inspection'); });
    $('#findingSave').addEventListener('click', saveFinding);
    $('#findingDelete').addEventListener('click', deleteFinding);
    $('#pointActionDialog').addEventListener('click', event => { if (event.target.id === 'pointActionDialog') closePointActions(); });

    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(console.error));
    }
  }

  async function init() {
    screens.search = $('#searchScreen');
    screens.dashboard = $('#dashboardScreen');
    screens.zone = $('#zoneScreen');
    screens.findings = $('#findingsScreen');
    screens.inspection = $('#inspectionScreen');
    screens.findingForm = $('#findingFormScreen');
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
