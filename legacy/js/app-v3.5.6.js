(() => {
  'use strict';

  const VERSION = '3.5.7';
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
    const seeds = POINT_TEMPLATES[section.id] || [];
    return seeds.map((label, index) => ({
      id: `${section.id}-${String(index + 1).padStart(3, '0')}`,
      label,
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
    activePointId: null,
    draftPhotos: [],
    draftFindingId: null,
    photoObjectUrls: [],
    originalPhotoIds: [],
    removedPhotoIds: [],
    photoEditor: null,
    initReturnScreen: 'search'
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

  function todayIsoDate() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function formatVisitDate(value) {
    if (!value) return '—';
    const [year, month, day] = String(value).split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }

  function formatMeter(value, unit) {
    const number = Number(value);
    if (!Number.isFinite(number)) return '—';
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(number)} ${unit}`;
  }

  function hasVisitReadings(visit) {
    return Boolean(visit?.visitDate)
      && Number.isFinite(Number(visit?.carrierKm))
      && Number.isFinite(Number(visit?.carrierHours))
      && Number.isFinite(Number(visit?.upperHours));
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

  const PHOTO_DB = 'foselev_vfg_photos';
  const PHOTO_STORE = 'photos';

  function openPhotoDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(PHOTO_DB, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(PHOTO_STORE)) db.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Stockage des photos indisponible.'));
    });
  }

  async function photoDbPut(record) {
    const db = await openPhotoDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      tx.objectStore(PHOTO_STORE).put(record);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }

  async function photoDbGet(id) {
    const db = await openPhotoDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readonly');
      const request = tx.objectStore(PHOTO_STORE).get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
  }

  async function photoDbDelete(id) {
    const db = await openPhotoDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      tx.objectStore(PHOTO_STORE).delete(id);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }

  function clearPhotoObjectUrls() {
    state.photoObjectUrls.forEach(url => URL.revokeObjectURL(url));
    state.photoObjectUrls = [];
  }

  function blobToImage(blob) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const image = new Image();
      image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
      image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image illisible.')); };
      image.src = url;
    });
  }

  async function optimisePhoto(file) {
    if (!file.type.startsWith('image/')) throw new Error('Le fichier sélectionné n’est pas une image.');
    try {
      const image = await blobToImage(file);
      const maxSide = 1600;
      const ratio = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * ratio));
      const height = Math.max(1, Math.round(image.naturalHeight * ratio));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, width, height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .82));
      return blob || file;
    } catch (error) {
      console.warn('Compression impossible, original conservé.', error);
      return file;
    }
  }

  async function addSelectedPhotos(files) {
    const selected = Array.from(files || []).filter(file => file.type.startsWith('image/'));
    if (!selected.length) return;
    for (const file of selected) {
      try {
        const blob = await optimisePhoto(file);
        const id = `P-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        await photoDbPut({ id, blob, type: blob.type || file.type, name: file.name || 'photo.jpg', createdAt: new Date().toISOString() });
        state.draftPhotos.push({
          id,
          name: file.name || 'Photo',
          type: blob.type || file.type,
          createdAt: new Date().toISOString(),
          isMain: state.draftPhotos.length === 0,
          includeInReport: false
        });
      } catch (error) {
        console.error(error);
        toast('Une photo n’a pas pu être ajoutée.');
      }
    }
    await renderPhotoGallery();
    $('#cameraPhotoInput').value = '';
    $('#galleryPhotoInput').value = '';
  }

  async function renderPhotoGallery() {
    const gallery = $('#photoGallery');
    const empty = $('#photoEmptyState');
    if (!gallery || !empty) return;
    clearPhotoObjectUrls();
    gallery.replaceChildren();
    empty.classList.toggle('hidden', state.draftPhotos.length > 0);

    for (const photo of state.draftPhotos) {
      const stored = await photoDbGet(photo.id);
      if (!stored?.blob) continue;
      const url = URL.createObjectURL(stored.blob);
      state.photoObjectUrls.push(url);
      const card = document.createElement('article');
      card.className = `photo-card${photo.isMain ? ' is-main' : ''}${photo.includeInReport ? ' is-report' : ''}`;
      card.innerHTML = `
        <button class="photo-preview" type="button" data-photo-view="${photo.id}" aria-label="Agrandir la photo">
          <img src="${url}" alt="Photo du constat">
          ${photo.isMain ? '<span class="photo-main-badge">Principale</span>' : ''}
          ${photo.includeInReport ? '<span class="photo-report-badge">Rapport</span>' : ''}
        </button>
        <div class="photo-actions">
          <button type="button" data-photo-edit="${photo.id}">✏️<span>Modifier</span></button>
          <button type="button" data-photo-main="${photo.id}" aria-pressed="${photo.isMain}">⭐<span>Principale</span></button>
          <button type="button" data-photo-report="${photo.id}" aria-pressed="${photo.includeInReport}">📄<span>Rapport</span></button>
          <button type="button" class="photo-delete" data-photo-delete="${photo.id}">🗑️<span>Supprimer</span></button>
        </div>`;
      gallery.appendChild(card);
    }
  }

  async function viewPhoto(id) {
    const stored = await photoDbGet(id);
    if (!stored?.blob) return toast('Photo introuvable.');
    const url = URL.createObjectURL(stored.blob);
    state.photoObjectUrls.push(url);
    $('#photoViewerImage').src = url;
    $('#photoViewer').classList.remove('hidden');
    $('#photoViewer').setAttribute('aria-hidden', 'false');
  }

  function closePhotoViewer() {
    $('#photoViewer').classList.add('hidden');
    $('#photoViewer').setAttribute('aria-hidden', 'true');
    $('#photoViewerImage').removeAttribute('src');
  }


  function canvasToBlob(canvas, quality = .9) {
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
  }

  function editorCanvas() { return $('#photoEditorCanvas'); }
  function editorContext() { return editorCanvas().getContext('2d'); }

  function editorSnapshot() {
    const editor = state.photoEditor;
    if (!editor) return;
    const canvas = editorCanvas();
    const snapshot = canvas.toDataURL('image/jpeg', .9);
    if (editor.history[editor.historyIndex] === snapshot) return;
    editor.history = editor.history.slice(0, editor.historyIndex + 1);
    editor.history.push(snapshot);
    editor.historyIndex = editor.history.length - 1;
    updateEditorHistoryButtons();
  }

  function updateEditorHistoryButtons() {
    const editor = state.photoEditor;
    if (!editor) return;
    $('#photoEditorUndo').disabled = editor.historyIndex <= 0;
    $('#photoEditorRedo').disabled = editor.historyIndex >= editor.history.length - 1;
  }

  async function restoreEditorSnapshot(index) {
    const editor = state.photoEditor;
    if (!editor || index < 0 || index >= editor.history.length) return;
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = editor.history[index];
    });
    const canvas = editorCanvas();
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    editorContext().drawImage(image, 0, 0);
    editor.historyIndex = index;
    updateEditorHistoryButtons();
    clearCropSelection();
  }

  function setEditorTool(tool) {
    const editor = state.photoEditor;
    if (!editor) return;
    editor.tool = tool;
    editor.start = null;
    editor.drawing = false;
    document.querySelectorAll('[data-editor-tool]').forEach(button => {
      button.classList.toggle('active', button.dataset.editorTool === tool);
    });
    $('#photoEditorApplyCrop').classList.toggle('hidden', tool !== 'crop');
    $('#photoEditorCanvas').style.touchAction = tool === 'none' ? 'pan-x pan-y' : 'none';
    if (tool !== 'crop') clearCropSelection();
  }

  function canvasPoint(event) {
    const canvas = editorCanvas();
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(canvas.width, (event.clientX - rect.left) * canvas.width / rect.width)),
      y: Math.max(0, Math.min(canvas.height, (event.clientY - rect.top) * canvas.height / rect.height))
    };
  }

  function clearCropSelection() {
    const editor = state.photoEditor;
    if (editor) editor.crop = null;
    const overlay = $('#photoEditorCropBox');
    overlay.classList.add('hidden');
    overlay.removeAttribute('style');
  }

  function displayCropSelection(start, end) {
    const canvas = editorCanvas();
    const rect = canvas.getBoundingClientRect();
    const left = Math.min(start.x, end.x) / canvas.width * rect.width;
    const top = Math.min(start.y, end.y) / canvas.height * rect.height;
    const width = Math.abs(end.x - start.x) / canvas.width * rect.width;
    const height = Math.abs(end.y - start.y) / canvas.height * rect.height;
    const box = $('#photoEditorCropBox');
    box.classList.remove('hidden');
    box.style.left = `${left}px`;
    box.style.top = `${top}px`;
    box.style.width = `${width}px`;
    box.style.height = `${height}px`;
  }

  function drawArrow(context, start, end) {
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    const head = Math.max(18, Math.min(55, distance * .22));
    context.save();
    context.strokeStyle = '#e00000';
    context.fillStyle = '#e00000';
    context.lineWidth = Math.max(5, editorCanvas().width / 260);
    context.lineCap = 'round';
    context.beginPath(); context.moveTo(start.x, start.y); context.lineTo(end.x, end.y); context.stroke();
    context.beginPath();
    context.moveTo(end.x, end.y);
    context.lineTo(end.x - head * Math.cos(angle - Math.PI / 7), end.y - head * Math.sin(angle - Math.PI / 7));
    context.lineTo(end.x - head * Math.cos(angle + Math.PI / 7), end.y - head * Math.sin(angle + Math.PI / 7));
    context.closePath(); context.fill();
    context.restore();
  }

  function drawEllipse(context, start, end) {
    const cx = (start.x + end.x) / 2;
    const cy = (start.y + end.y) / 2;
    const rx = Math.max(2, Math.abs(end.x - start.x) / 2);
    const ry = Math.max(2, Math.abs(end.y - start.y) / 2);
    context.save();
    context.strokeStyle = '#e00000';
    context.lineWidth = Math.max(5, editorCanvas().width / 260);
    context.beginPath(); context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); context.stroke();
    context.restore();
  }

  function renderEditorPreview() {
    const editor = state.photoEditor;
    if (!editor?.previewBase || !editor.start || !editor.current) return;
    const canvas = editorCanvas();
    const context = editorContext();
    context.putImageData(editor.previewBase, 0, 0);
    if (editor.tool === 'arrow') drawArrow(context, editor.start, editor.current);
    if (editor.tool === 'ellipse') drawEllipse(context, editor.start, editor.current);
  }

  function onEditorPointerDown(event) {
    const editor = state.photoEditor;
    if (!editor || editor.tool === 'none') return;
    event.preventDefault();
    editorCanvas().setPointerCapture?.(event.pointerId);
    editor.start = canvasPoint(event);
    editor.current = editor.start;
    editor.drawing = true;
    if (['arrow', 'ellipse'].includes(editor.tool)) editor.previewBase = editorContext().getImageData(0, 0, editorCanvas().width, editorCanvas().height);
    if (editor.tool === 'freehand') {
      const context = editorContext();
      context.save();
      context.strokeStyle = '#e00000';
      context.lineWidth = Math.max(5, editorCanvas().width / 260);
      context.lineCap = 'round'; context.lineJoin = 'round';
      context.beginPath(); context.moveTo(editor.start.x, editor.start.y);
    }
  }

  function onEditorPointerMove(event) {
    const editor = state.photoEditor;
    if (!editor?.drawing) return;
    event.preventDefault();
    editor.current = canvasPoint(event);
    if (['arrow', 'ellipse'].includes(editor.tool)) renderEditorPreview();
    else if (editor.tool === 'freehand') {
      const context = editorContext();
      context.lineTo(editor.current.x, editor.current.y); context.stroke();
    } else if (editor.tool === 'crop') displayCropSelection(editor.start, editor.current);
  }

  function onEditorPointerUp(event) {
    const editor = state.photoEditor;
    if (!editor?.drawing) return;
    event.preventDefault();
    editor.current = canvasPoint(event);
    if (['arrow', 'ellipse'].includes(editor.tool)) {
      renderEditorPreview(); editorSnapshot();
    } else if (editor.tool === 'freehand') {
      editorContext().restore(); editorSnapshot();
    } else if (editor.tool === 'crop') {
      editor.crop = {
        x: Math.round(Math.min(editor.start.x, editor.current.x)),
        y: Math.round(Math.min(editor.start.y, editor.current.y)),
        width: Math.round(Math.abs(editor.current.x - editor.start.x)),
        height: Math.round(Math.abs(editor.current.y - editor.start.y))
      };
      displayCropSelection(editor.start, editor.current);
    }
    editor.drawing = false;
    editor.previewBase = null;
  }

  async function openPhotoEditor(id) {
    const stored = await photoDbGet(id);
    if (!stored?.blob) return toast('Photo introuvable.');
    const image = await blobToImage(stored.blob);
    const canvas = editorCanvas();
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    editorContext().drawImage(image, 0, 0);
    state.photoEditor = { id, tool: 'none', history: [], historyIndex: -1, crop: null, drawing: false };
    editorSnapshot();
    setEditorTool('none');
    $('#photoEditor').classList.remove('hidden');
    $('#photoEditor').setAttribute('aria-hidden', 'false');
    document.body.classList.add('editor-open');
  }

  function closePhotoEditor() {
    $('#photoEditor').classList.add('hidden');
    $('#photoEditor').setAttribute('aria-hidden', 'true');
    document.body.classList.remove('editor-open');
    state.photoEditor = null;
    clearCropSelection();
  }

  function rotateEditor(direction) {
    const source = editorCanvas();
    const temp = document.createElement('canvas');
    temp.width = source.height; temp.height = source.width;
    const context = temp.getContext('2d');
    context.translate(temp.width / 2, temp.height / 2);
    context.rotate(direction * Math.PI / 2);
    context.drawImage(source, -source.width / 2, -source.height / 2);
    source.width = temp.width; source.height = temp.height;
    editorContext().drawImage(temp, 0, 0);
    editorSnapshot();
    clearCropSelection();
  }

  function applyEditorCrop() {
    const editor = state.photoEditor;
    const crop = editor?.crop;
    if (!crop || crop.width < 20 || crop.height < 20) return toast('Tracez d’abord la zone à conserver.');
    const source = editorCanvas();
    const temp = document.createElement('canvas');
    temp.width = crop.width; temp.height = crop.height;
    temp.getContext('2d').drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
    source.width = temp.width; source.height = temp.height;
    editorContext().drawImage(temp, 0, 0);
    clearCropSelection(); editorSnapshot(); setEditorTool('none');
  }

  function addEditorText() {
    const value = prompt('Texte à ajouter sur la photo :');
    if (!value) return;
    const canvas = editorCanvas();
    const context = editorContext();
    const fontSize = Math.max(28, Math.round(canvas.width / 18));
    context.save();
    context.font = `bold ${fontSize}px sans-serif`;
    context.textBaseline = 'top';
    const padding = Math.round(fontSize * .25);
    const metrics = context.measureText(value);
    const x = Math.round(canvas.width * .06), y = Math.round(canvas.height * .06);
    context.fillStyle = 'rgba(255,255,255,.88)';
    context.fillRect(x - padding, y - padding, metrics.width + padding * 2, fontSize * 1.25 + padding * 2);
    context.fillStyle = '#e00000';
    context.fillText(value, x, y);
    context.restore();
    editorSnapshot();
  }

  async function savePhotoEditor() {
    const editor = state.photoEditor;
    if (!editor) return;
    const stored = await photoDbGet(editor.id);
    if (!stored) return toast('Photo introuvable.');
    const blob = await canvasToBlob(editorCanvas(), .9);
    if (!blob) return toast('Enregistrement de la photo impossible.');
    await photoDbPut({ ...stored, originalBlob: stored.originalBlob || stored.blob, blob, editedAt: new Date().toISOString() });
    const metadata = state.draftPhotos.find(photo => photo.id === editor.id);
    if (metadata) metadata.edited = true;
    closePhotoEditor();
    await renderPhotoGallery();
    toast('Photo modifiée.');
  }

  async function deleteDraftPhoto(id) {
    state.draftPhotos = state.draftPhotos.filter(photo => photo.id !== id);
    if (state.originalPhotoIds.includes(id)) state.removedPhotoIds.push(id);
    else await photoDbDelete(id);
    if (state.draftPhotos.length && !state.draftPhotos.some(photo => photo.isMain)) state.draftPhotos[0].isMain = true;
    await renderPhotoGallery();
  }

  async function deleteFindingPhotos(finding) {
    await Promise.all((finding?.photos || []).map(photo => photoDbDelete(photo.id).catch(console.error)));
  }

  function loadJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Stockage local indisponible pour ${key}:`, error);
      return false;
    }
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
    return DEFAULT_REFERENTIAL[zone].map(([id, label]) => {
      const section = { id, label, total: 0, remaining: 0, ncOpen: 0, ncTotal: 0 };
      section.points = buildPoints(section);
      recalculateSection(section);
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
      visitDate: todayIsoDate(),
      carrierKm: null,
      carrierHours: null,
      upperHours: null,
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
        const fresh = buildPoints(mergedSection);
        const existingRealPoints = Array.isArray(existing.points)
          ? existing.points.filter(point => point?.label && !/—\s*contr[oô]le\s+\d+$/i.test(point.label))
          : [];
        const existingByLabel = new Map(existingRealPoints.map(point => [normalize(point.label), point]));
        mergedSection.points = fresh.map((point, index) => {
          const previous = existingByLabel.get(normalize(point.label)) || existingRealPoints[index];
          return {
            ...point,
            status: previous && ['pending', 'conform', 'finding'].includes(previous.status) ? previous.status : 'pending',
            findingId: previous?.findingId || null
          };
        });
        if (!Array.isArray(existing.points) || existing.points.length !== mergedSection.points.length || existing.points.some(point => /—\s*contr[oô]le\s+\d+$/i.test(point?.label || ''))) changed = true;
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
    visit.findings.forEach(finding => {
      if (!Array.isArray(finding.photos)) { finding.photos = []; changed = true; }
    });

    if (!visit.visitDate) {
      visit.visitDate = todayIsoDate();
      changed = true;
    }
    for (const field of ['carrierKm', 'carrierHours', 'upperHours']) {
      if (!(field in visit)) {
        visit[field] = null;
        changed = true;
      }
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
    const quickNav = $('#quickNav');
    if (quickNav) quickNav.classList.toggle('hidden', name === 'search' || name === 'visitInit' || !state.activeVisit);
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
      const row = document.createElement('div');
      row.className = `inspection-point is-${point.status}`;
      row.innerHTML = `
        <span class="point-index">${String(index + 1).padStart(2, '0')}</span>
        <button class="point-label-button" type="button" data-point-finding="${escapeHtml(point.id)}">${escapeHtml(point.label)}</button>
        <button class="point-status-button" type="button" data-point-conform="${escapeHtml(point.id)}" aria-label="Valider conforme : ${escapeHtml(point.label)}">
          <span class="point-status" aria-hidden="true">${pointStatusIcon(point.status)}</span>
        </button>`;
      row.querySelector('[data-point-conform]').addEventListener('click', () => setPointConform(point.id));
      row.querySelector('[data-point-finding]').addEventListener('click', () => {
        state.activePointId = point.id;
        openFindingForm();
      });
      list.appendChild(row);
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

  async function setPointConform(pointId = state.activePointId) {
    const section = currentSection();
    state.activePointId = pointId;
    const point = section?.points?.find(item => item.id === pointId);
    if (!point) return;

    // Le bouton rond fonctionne comme un interrupteur :
    // non contrôlé -> conforme -> non contrôlé.
    if (point.status === 'conform') {
      point.status = 'pending';
      point.findingId = null;
      recalculateSection(section);
      saveActiveVisit();
      closePointActions();
      renderInspection();
      toast('Validation annulée : point remis à non contrôlé.');
      return;
    }

    // Si un constat existe, une validation conforme explicite le remplace.
    if (point.findingId) {
      const finding = state.activeVisit.findings.find(item => item.id === point.findingId);
      await deleteFindingPhotos(finding);
      state.activeVisit.findings = state.activeVisit.findings.filter(item => item.id !== point.findingId);
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

  async function openFindingForm() {
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
    state.draftFindingId = existing?.id || null;
    state.draftPhotos = (existing?.photos || []).map(photo => ({ ...photo }));
    state.originalPhotoIds = state.draftPhotos.map(photo => photo.id);
    state.removedPhotoIds = [];
    await renderPhotoGallery();
    showScreen('findingForm');
  }

  async function saveFinding() {
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
      photos: state.draftPhotos.map(photo => ({ ...photo })),
      status: 'Enregistré',
      updatedAt: new Date().toISOString()
    };
    await Promise.all(state.removedPhotoIds.map(id => photoDbDelete(id).catch(console.error)));
    if (existingIndex >= 0) state.activeVisit.findings[existingIndex] = finding;
    else state.activeVisit.findings.push(finding);
    point.status = 'finding';
    point.findingId = finding.id;
    recalculateSection(section);
    saveActiveVisit();
    state.draftPhotos = [];
    state.draftFindingId = null;
    state.originalPhotoIds = [];
    state.removedPhotoIds = [];
    clearPhotoObjectUrls();
    renderInspection();
    showScreen('inspection');
    toast('Constat enregistré.');
  }

  async function deleteFinding() {
    const section = currentSection();
    const point = section?.points?.find(item => item.id === state.activePointId);
    if (!point?.findingId) return;
    const finding = state.activeVisit.findings.find(item => item.id === point.findingId);
    await deleteFindingPhotos(finding);
    state.activeVisit.findings = state.activeVisit.findings.filter(item => item.id !== point.findingId);
    point.findingId = null;
    point.status = 'pending';
    state.draftPhotos = [];
    state.draftFindingId = null;
    state.originalPhotoIds = [];
    state.removedPhotoIds = [];
    recalculateSection(section);
    saveActiveVisit();
    renderInspection();
    showScreen('inspection');
    toast('Constat supprimé.');
  }

  async function cancelFindingForm() {
    const section = currentSection();
    const point = section?.points?.find(item => item.id === state.activePointId);
    const existing = point?.findingId ? state.activeVisit.findings.find(finding => finding.id === point.findingId) : null;
    const keepIds = new Set((existing?.photos || []).map(photo => photo.id));
    const discardIds = state.draftPhotos.filter(photo => !keepIds.has(photo.id)).map(photo => photo.id);
    await Promise.all(discardIds.map(id => photoDbDelete(id).catch(console.error)));
    state.draftPhotos = [];
    state.draftFindingId = null;
    state.originalPhotoIds = [];
    state.removedPhotoIds = [];
    clearPhotoObjectUrls();
    renderInspection();
    showScreen('inspection');
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

  function saveActiveVisit() {
    if (!state.activeVisit) return;
    state.activeVisit.updatedAt = new Date().toISOString();
    const visits = loadJson(STORAGE_KEYS.visits, []);
    const index = visits.findIndex(item => item.id === state.activeVisit.id);
    if (index >= 0) visits[index] = state.activeVisit;
    else visits.unshift(state.activeVisit);
    saveJson(STORAGE_KEYS.visits, visits);
  }

  function readingValue(input) {
    const raw = String(input.value ?? '').replace(/[\s\u00A0\u202F]/g, '').replace(/[^0-9]/g, '');
    if (raw === '') return null;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  function formatReading(value) {
    if (value === null || value === undefined || value === '') return '';
    const number = Number(String(value).replace(/[\s\u00A0\u202F]/g, '').replace(/[^0-9]/g, ''));
    return Number.isFinite(number) ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(number) : '';
  }

  function formatReadingField(input) {
    const value = readingValue(input);
    input.value = value === null ? '' : formatReading(value);
  }

  function saveDashboardReadings() {
    const visit = state.activeVisit;
    if (!visit) return;
    visit.visitDate = $('#dashboardVisitDate').value || todayIsoDate();
    visit.carrierKm = readingValue($('#dashboardCarrierKm'));
    visit.carrierHours = readingValue($('#dashboardCarrierHours'));
    visit.upperHours = readingValue($('#dashboardUpperHours'));
    saveActiveVisit();
  }

  function bindReadingSequence() {
    const fields = [
      $('#dashboardVisitDate'),
      $('#dashboardCarrierKm'),
      $('#dashboardCarrierHours'),
      $('#dashboardUpperHours')
    ];
    fields.forEach((field, index) => {
      const isReading = field.type !== 'date';
      field.addEventListener('focus', () => {
        if (isReading) {
          const value = readingValue(field);
          field.value = value === null ? '' : String(value);
          field.select();
        }
      });
      field.addEventListener('input', () => {
        if (isReading) field.value = field.value.replace(/[^0-9]/g, '');
      });
      field.addEventListener('change', () => {
        saveDashboardReadings();
        if (isReading) formatReadingField(field);
      });
      field.addEventListener('blur', () => {
        saveDashboardReadings();
        if (isReading) formatReadingField(field);
      });
      field.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        saveDashboardReadings();
        if (isReading) formatReadingField(field);
        const next = fields[index + 1];
        if (next) {
          next.focus();
          if (typeof next.select === 'function' && next.type !== 'date') next.select();
        } else {
          field.blur();
        }
      });
    });
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
    $('#dashboardVisitDate').value = visit.visitDate || todayIsoDate();
    $('#dashboardCarrierKm').value = Number.isFinite(Number(visit.carrierKm)) ? formatReading(visit.carrierKm) : '';
    $('#dashboardCarrierHours').value = Number.isFinite(Number(visit.carrierHours)) ? formatReading(visit.carrierHours) : '';
    $('#dashboardUpperHours').value = Number.isFinite(Number(visit.upperHours)) ? formatReading(visit.upperHours) : '';
    renderProgress('carrier', zoneProgress(visit, 'carrier'));
    renderProgress('upper', zoneProgress(visit, 'upper'));
  }

  function openMachine(machine) {
    state.activeZone = null;
    state.activeMachine = machine;
    state.activeVisit = getOrCreateVisit(machine);
    rememberMachine(machine);
    if (!state.activeVisit.visitDate) state.activeVisit.visitDate = todayIsoDate();
    saveActiveVisit();
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
      if (state.activeScreen === 'visitInit') {
        if (state.initReturnScreen === 'dashboard' && hasVisitReadings(state.activeVisit)) {
          renderDashboard();
          showScreen('dashboard');
        } else {
          showScreen('search');
        }
      } else if (state.activeScreen === 'findingForm') {
        cancelFindingForm();
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
    const cancelVisitInit = $('#cancelVisitInit');
    if (cancelVisitInit) cancelVisitInit.addEventListener('click', () => {
      if (state.initReturnScreen === 'dashboard' && hasVisitReadings(state.activeVisit)) {
        renderDashboard();
        showScreen('dashboard');
      } else {
        showScreen('search');
      }
    });
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
    $('#findingCancel').addEventListener('click', cancelFindingForm);
    $('#findingSave').addEventListener('click', saveFinding);
    $('#findingDelete').addEventListener('click', deleteFinding);
    $('#takePhotoButton').addEventListener('click', () => $('#cameraPhotoInput').click());
    $('#galleryPhotoButton').addEventListener('click', () => $('#galleryPhotoInput').click());
    $('#cameraPhotoInput').addEventListener('change', event => addSelectedPhotos(event.target.files));
    $('#galleryPhotoInput').addEventListener('change', event => addSelectedPhotos(event.target.files));
    $('#photoGallery').addEventListener('click', async event => {
      const view = event.target.closest('[data-photo-view]');
      const remove = event.target.closest('[data-photo-delete]');
      const main = event.target.closest('[data-photo-main]');
      const report = event.target.closest('[data-photo-report]');
      const edit = event.target.closest('[data-photo-edit]');
      if (edit) await openPhotoEditor(edit.dataset.photoEdit);
      else if (view) await viewPhoto(view.dataset.photoView);
      else if (remove) await deleteDraftPhoto(remove.dataset.photoDelete);
      else if (main) {
        state.draftPhotos.forEach(photo => { photo.isMain = photo.id === main.dataset.photoMain; });
        await renderPhotoGallery();
      } else if (report) {
        const photo = state.draftPhotos.find(item => item.id === report.dataset.photoReport);
        if (photo) photo.includeInReport = !photo.includeInReport;
        await renderPhotoGallery();
      }
    });
    $('#photoViewerClose').addEventListener('click', closePhotoViewer);
    $('#photoViewer').addEventListener('click', event => { if (event.target.id === 'photoViewer') closePhotoViewer(); });
    $('#photoEditorClose').addEventListener('click', closePhotoEditor);
    $('#photoEditorCancel').addEventListener('click', closePhotoEditor);
    $('#photoEditorSave').addEventListener('click', savePhotoEditor);
    $('#photoEditorRotateLeft').addEventListener('click', () => rotateEditor(-1));
    $('#photoEditorRotateRight').addEventListener('click', () => rotateEditor(1));
    $('#photoEditorText').addEventListener('click', addEditorText);
    $('#photoEditorApplyCrop').addEventListener('click', applyEditorCrop);
    $('#photoEditorUndo').addEventListener('click', () => restoreEditorSnapshot(state.photoEditor.historyIndex - 1));
    $('#photoEditorRedo').addEventListener('click', () => restoreEditorSnapshot(state.photoEditor.historyIndex + 1));
    document.querySelectorAll('[data-editor-tool]').forEach(button => button.addEventListener('click', () => setEditorTool(button.dataset.editorTool)));
    const editCanvas = $('#photoEditorCanvas');
    editCanvas.addEventListener('pointerdown', onEditorPointerDown);
    editCanvas.addEventListener('pointermove', onEditorPointerMove);
    editCanvas.addEventListener('pointerup', onEditorPointerUp);
    editCanvas.addEventListener('pointercancel', onEditorPointerUp);
    $('#pointActionDialog').addEventListener('click', event => { if (event.target.id === 'pointActionDialog') closePointActions(); });
    bindReadingSequence();
    document.querySelectorAll('[data-quick-nav]').forEach(button => button.addEventListener('click', () => {
      const target = button.dataset.quickNav;
      if (target === 'dashboard') {
        renderDashboard();
        showScreen('dashboard');
      } else if (target === 'carrier' || target === 'upper') {
        renderZone(target);
      }
    }));

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
