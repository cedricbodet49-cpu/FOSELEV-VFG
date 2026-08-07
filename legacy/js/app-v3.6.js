(() => {
  'use strict';

  const VERSION = '3.6.0';
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
    activePointId: null,
    draftPhotos: [],
    draftFindingId: null,
    photoObjectUrls: [],
    originalPhotoIds: [],
    removedPhotoIds: [],
    photoEditor: null,
    reportHtml: ''
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
    visit.findings.forEach(finding => {
      if (!Array.isArray(finding.photos)) { finding.photos = []; changed = true; }
    });

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

  async function setPointConform() {
    const section = currentSection();
    const point = section?.points?.find(item => item.id === state.activePointId);
    if (!point) return;
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


  const RAL = {
    anthracite: '#383E42', // approximation écran RAL 7016
    white: '#F4F0E6',     // approximation écran RAL 9010
    orange: '#E75B12'     // approximation écran RAL 2004
  };

  const REPORT_LEVEL_ORDER = {
    'Immobilisation immédiate': 0,
    'Intervention urgente': 1,
    'Intervention à programmer': 2,
    'À surveiller': 3,
    'Information': 4
  };

  function reportDate(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  }

  function reportStatus(point, finding) {
    if (point.status === 'conform') return { symbol: '✓', label: 'CONFORME', cls: 'is-conform' };
    if (point.status === 'finding') return { symbol: '!', label: finding?.level || 'ANOMALIE', cls: 'is-finding' };
    return { symbol: '○', label: 'À CONTRÔLER', cls: 'is-pending' };
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error('Lecture de la photo impossible.'));
      reader.readAsDataURL(blob);
    });
  }

  async function prepareReportFindings() {
    const findings = [...(state.activeVisit?.findings || [])]
      .sort((a, b) => (REPORT_LEVEL_ORDER[a.level] ?? 99) - (REPORT_LEVEL_ORDER[b.level] ?? 99));
    const prepared = [];
    for (const finding of findings) {
      const images = [];
      for (const photo of (finding.photos || []).filter(item => item.includeInReport)) {
        try {
          const stored = await photoDbGet(photo.id);
          if (stored?.blob) images.push({ id: photo.id, src: await blobToDataUrl(stored.blob), isMain: Boolean(photo.isMain) });
        } catch (error) {
          console.warn('Photo non disponible pour le rapport', error);
        }
      }
      images.sort((a, b) => Number(b.isMain) - Number(a.isMain));
      prepared.push({ ...finding, reportImages: images });
    }
    return prepared;
  }

  function reportBrand() {
    return `<div class="r-brand"><span class="r-mark"><i></i></span><span><b>FOSELEV</b><small>VFG</small></span></div>`;
  }

  function reportHeader(title) {
    return `<header class="r-header">${reportBrand()}<div><strong>${escapeHtml(title)}</strong></div></header><div class="r-orange-line"></div>`;
  }

  function reportPage(content, title = 'Rapport de visite de fin de garantie', extraClass = '') {
    return `<article class="report-page ${extraClass}">${reportHeader(title)}<main class="r-page-body">${content}</main><footer class="r-footer">Page __PAGE__ / __TOTAL__</footer></article>`;
  }

  function reportInfoRow(label, value) {
    return `<div class="r-info-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || '—')}</strong></div>`;
  }

  function summaryFindingCard(finding, index) {
    const image = finding.reportImages?.[0];
    const zoneLabel = finding.zone === 'carrier' ? 'Porteur' : 'Tourelle';
    return `<section class="r-anomaly-card">
      <div class="r-anomaly-number">${String(index + 1).padStart(2, '0')}</div>
      <div class="r-anomaly-copy">
        <div class="r-level">${escapeHtml(finding.level || 'Anomalie')}</div>
        <h3>${escapeHtml(finding.pointLabel || finding.title || 'Constat')}</h3>
        <p class="r-path">${escapeHtml(zoneLabel)} · ${escapeHtml(finding.sectionLabel || '')}</p>
        <p>${escapeHtml(finding.comment || 'Aucun commentaire.')}</p>
      </div>
      ${image ? `<img class="r-summary-photo" src="${image.src}" alt="Photo sélectionnée pour le rapport">` : ''}
    </section>`;
  }

  function detailFindingCard(finding, number) {
    const zoneLabel = finding.zone === 'carrier' ? 'Porteur' : 'Tourelle';
    const photos = (finding.reportImages || []).map(image => `<img src="${image.src}" alt="Photo du constat">`).join('');
    return `<section class="r-finding-detail">
      <div class="r-detail-heading"><span>Anomalie ${String(number).padStart(2, '0')}</span><strong>${escapeHtml(finding.level || 'Anomalie')}</strong></div>
      <h3>${escapeHtml(finding.pointLabel || finding.title || 'Constat')}</h3>
      <p class="r-path">${escapeHtml(zoneLabel)} · ${escapeHtml(finding.sectionLabel || '')}</p>
      <div class="r-comment"><b>Commentaire</b><p>${escapeHtml(finding.comment || 'Aucun commentaire.')}</p></div>
      ${photos ? `<div class="r-photo-grid">${photos}</div>` : '<p class="r-no-photo">Aucune photo sélectionnée pour le rapport.</p>'}
    </section>`;
  }

  async function buildReportPagesHtml() {
    if (!state.activeVisit || !state.activeMachine) return '';
    const findings = await prepareReportFindings();
    const visit = state.activeVisit;
    const machine = visit.machineSnapshot || state.activeMachine;
    const carrier = zoneProgress(visit, 'carrier');
    const upper = zoneProgress(visit, 'upper');
    const total = carrier.total + upper.total;
    const remaining = carrier.remaining + upper.remaining;
    const controlled = Math.max(0, total - remaining);
    const provisional = remaining > 0;
    const pages = [];

    const cover = `<section class="r-cover">
      <div class="r-cover-title"><p>RAPPORT TECHNIQUE</p><h1>Visite de fin de garantie</h1><span>${provisional ? 'APERÇU PROVISOIRE' : 'VISITE TERMINÉE'}</span></div>
      <div class="r-machine-number">${escapeHtml(machine.parkNumber || machine.id || 'Machine')}</div>
      <div class="r-machine-model">${escapeHtml([machine.brand, machine.model].filter(Boolean).join(' · '))}</div>
      <div class="r-cover-grid">
        ${reportInfoRow('N° de série', machine.serialNumber)}
        ${reportInfoRow('Agence', machine.agency)}
        ${reportInfoRow('Date de la visite', reportDate(visit.createdAt))}
        ${reportInfoRow('Points contrôlés', `${controlled} / ${total}`)}
        ${reportInfoRow('Anomalies enregistrées', String(findings.length))}
      </div>
      <div class="r-cover-note">Le rapport présente d'abord la synthèse des anomalies, puis l'intégralité des points de contrôle.</div>
    </section>`;
    pages.push(reportPage(cover, 'Rapport VFG', 'r-cover-page'));

    if (!findings.length) {
      pages.push(reportPage(`<section class="r-section-title"><span>01</span><div><p>SYNTHÈSE</p><h2>Synthèse des anomalies</h2></div></section><div class="r-empty-summary"><strong>Aucune anomalie enregistrée</strong><p>La visite ne comporte actuellement aucun constat.</p></div>`, 'Synthèse des anomalies'));
    } else {
      const chunks = [];
      for (let i = 0; i < findings.length; i += 3) chunks.push(findings.slice(i, i + 3));
      chunks.forEach((chunk, pageIndex) => {
        const startIndex = pageIndex * 3;
        const title = `<section class="r-section-title"><span>01</span><div><p>SYNTHÈSE</p><h2>Synthèse des anomalies${chunks.length > 1 ? ` · ${pageIndex + 1}/${chunks.length}` : ''}</h2></div></section>`;
        pages.push(reportPage(title + chunk.map((finding, idx) => summaryFindingCard(finding, startIndex + idx)).join(''), 'Synthèse des anomalies'));
      });
    }

    const zones = [
      ['carrier', 'Porteur', '02'],
      ['upper', 'Tourelle', '03']
    ];
    const findingById = new Map(findings.map(item => [item.id, item]));
    for (const [zoneId, zoneLabel, chapter] of zones) {
      const sections = visit.zones?.[zoneId]?.sections || [];
      for (const section of sections) {
        const points = section.points || [];
        const chunks = [];
        for (let i = 0; i < points.length; i += 16) chunks.push(points.slice(i, i + 16));
        chunks.forEach((chunk, chunkIndex) => {
          const heading = `<section class="r-section-title"><span>${chapter}</span><div><p>${escapeHtml(zoneLabel.toUpperCase())}</p><h2>${escapeHtml(section.label)}${chunks.length > 1 ? ` · ${chunkIndex + 1}/${chunks.length}` : ''}</h2></div></section>`;
          const rows = chunk.map(point => {
            const finding = point.findingId ? findingById.get(point.findingId) : null;
            const status = reportStatus(point, finding);
            return `<div class="r-point-row ${status.cls}"><span class="r-point-symbol">${status.symbol}</span><span class="r-point-name">${escapeHtml(point.label)}</span><strong>${escapeHtml(status.label)}</strong></div>`;
          }).join('');
          pages.push(reportPage(heading + `<div class="r-point-table">${rows}</div>`, `${zoneLabel} · ${section.label}`));
        });
      }
    }

    findings.forEach((finding, index) => {
      const images = finding.reportImages || [];
      const imageChunks = images.length ? Array.from({ length: Math.ceil(images.length / 4) }, (_, chunkIndex) => images.slice(chunkIndex * 4, chunkIndex * 4 + 4)) : [[]];
      imageChunks.forEach((chunk, chunkIndex) => {
        const chunkFinding = { ...finding, reportImages: chunk };
        const suffix = imageChunks.length > 1 ? ` · ${chunkIndex + 1}/${imageChunks.length}` : '';
        pages.push(reportPage(`<section class="r-section-title"><span>04</span><div><p>DÉTAIL</p><h2>Détail des anomalies${suffix}</h2></div></section>${detailFindingCard(chunkFinding, index + 1)}`, 'Détail des anomalies'));
      });
    });

    pages.push(reportPage(`<section class="r-section-title"><span>05</span><div><p>CLÔTURE</p><h2>Fin du rapport</h2></div></section><div class="r-end"><p>Nombre total de points : <strong>${total}</strong></p><p>Points contrôlés : <strong>${controlled}</strong></p><p>Anomalies enregistrées : <strong>${findings.length}</strong></p><div class="r-signature-line"><span>Signature du contrôleur</span></div></div>`, 'Fin du rapport'));

    const totalPages = pages.length;
    return pages.map((page, index) => page.replace('__PAGE__', String(index + 1)).replace('__TOTAL__', String(totalPages))).join('');
  }

  function reportStyles(includeToolbar = false) {
    return `<style>
      :root{--ral7016:${RAL.anthracite};--ral9010:${RAL.white};--ral2004:${RAL.orange}}
      *{box-sizing:border-box}html,body{margin:0;background:#e9ecef;color:#1d2428;font-family:Arial,Helvetica,sans-serif}
      .print-toolbar{position:sticky;top:0;z-index:30;display:${includeToolbar ? 'flex' : 'none'};justify-content:center;gap:12px;padding:12px;background:#fff;border-bottom:3px solid var(--ral2004)}
      .print-toolbar button{border:0;border-radius:8px;padding:12px 18px;font-weight:700;cursor:pointer}.print-toolbar .print{background:var(--ral2004);color:#fff}.print-toolbar .close{background:var(--ral7016);color:#fff}
      .report-document{padding:18px}.report-page{position:relative;width:210mm;min-height:297mm;margin:0 auto 18px;padding:20mm 17mm 18mm;background:#fff;box-shadow:0 8px 30px rgba(0,0,0,.14);page-break-after:always;overflow:hidden}
      .r-header{display:flex;justify-content:space-between;align-items:center;color:var(--ral7016);font-size:10pt}.r-brand{display:flex;align-items:center;gap:8px}.r-brand b{display:block;font-size:16pt;letter-spacing:.5px}.r-brand small{display:block;color:var(--ral2004);font-weight:700}.r-mark{position:relative;width:34px;height:28px;display:inline-block}.r-mark:before{content:"";position:absolute;left:2px;bottom:1px;width:28px;height:24px;border:4px solid var(--ral7016);border-top:0;transform:skewX(-28deg)}.r-mark i{position:absolute;left:1px;bottom:11px;width:32px;height:4px;background:var(--ral2004);transform:skewX(-28deg)}
      .r-orange-line{height:3px;background:var(--ral2004);margin:7px 0 16px}.r-page-body{padding-bottom:15mm}.r-footer{position:absolute;left:17mm;right:17mm;bottom:8mm;text-align:center;color:var(--ral7016);font-size:9pt}
      .r-cover{padding-top:20mm}.r-cover-title p,.r-section-title p{margin:0 0 5px;color:var(--ral2004);font-size:9pt;font-weight:800;letter-spacing:1.5px}.r-cover-title h1{margin:0;color:var(--ral7016);font-size:29pt;line-height:1.05}.r-cover-title span{display:inline-block;margin-top:12px;padding:5px 10px;border:2px solid var(--ral7016);font-size:9pt;font-weight:800}.r-machine-number{margin-top:30mm;color:var(--ral2004);font-size:35pt;font-weight:900}.r-machine-model{color:var(--ral7016);font-size:17pt;font-weight:700}.r-cover-grid{margin-top:16mm;border-top:1px solid var(--ral7016)}.r-info-row{display:grid;grid-template-columns:42% 58%;padding:8px 0;border-bottom:1px solid #c8cdd0}.r-info-row span{font-size:10pt}.r-info-row strong{font-size:10.5pt;color:var(--ral7016)}.r-cover-note{margin-top:14mm;padding:12px 15px;border-left:5px solid var(--ral2004);background:#fff;font-size:10pt}
      .r-section-title{display:flex;align-items:center;gap:15px;margin:3mm 0 9mm}.r-section-title>span{color:var(--ral2004);font-size:27pt;font-weight:900;line-height:1}.r-section-title h2{margin:0;color:var(--ral7016);font-size:21pt}.r-empty-summary{padding:25mm 10mm;text-align:center;border:2px solid var(--ral7016)}.r-empty-summary strong{font-size:17pt;color:var(--ral7016)}
      .r-anomaly-card{display:grid;grid-template-columns:15mm 1fr 42mm;gap:8mm;align-items:start;padding:7mm 0;border-top:2px solid var(--ral7016)}.r-anomaly-number{display:grid;place-items:center;width:12mm;height:12mm;background:var(--ral2004);color:#fff;font-weight:900}.r-anomaly-copy h3{margin:3px 0 4px;color:var(--ral7016);font-size:14pt}.r-anomaly-copy p{margin:4px 0;font-size:10pt;line-height:1.35}.r-level{font-size:9pt;font-weight:900;text-transform:uppercase}.r-path{color:#5d6468}.r-summary-photo{width:42mm;height:32mm;object-fit:cover;border:1px solid var(--ral7016)}
      .r-point-table{border-top:2px solid var(--ral7016)}.r-point-row{display:grid;grid-template-columns:10mm 1fr 44mm;align-items:center;min-height:11mm;padding:2mm 0;border-bottom:1px solid #c8cdd0;font-size:9.5pt}.r-point-symbol{display:grid;place-items:center;width:7mm;height:7mm;border:1.5px solid var(--ral7016);font-weight:900}.r-point-row strong{text-align:right;font-size:8.5pt;color:var(--ral7016)}.r-point-row.is-finding .r-point-symbol{background:var(--ral2004);border-color:var(--ral2004);color:#fff}.r-point-row.is-pending{font-style:italic}
      .r-finding-detail{border-top:3px solid var(--ral7016);padding-top:6mm}.r-detail-heading{display:flex;justify-content:space-between;align-items:center}.r-detail-heading span{background:var(--ral2004);color:#fff;padding:5px 9px;font-weight:900}.r-detail-heading strong{font-size:10pt;text-transform:uppercase}.r-finding-detail h3{margin:8mm 0 2mm;color:var(--ral7016);font-size:17pt}.r-comment{margin-top:8mm;padding:6mm;border-left:5px solid var(--ral2004);background:#fff;border-top:1px solid #c8cdd0;border-bottom:1px solid #c8cdd0}.r-comment p{margin:3mm 0 0;line-height:1.45}.r-photo-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:5mm;margin-top:8mm}.r-photo-grid img{width:100%;height:65mm;object-fit:contain;border:1px solid var(--ral7016);background:#fff}.r-no-photo{margin-top:10mm;font-style:italic}.r-end{padding-top:12mm}.r-end p{padding:4mm 0;border-bottom:1px solid #c8cdd0}.r-signature-line{margin-top:30mm;border-top:1px solid var(--ral7016);padding-top:3mm;width:65mm}
      @media(max-width:900px){.report-document{padding:8px}.report-page{width:100%;min-height:auto;margin-bottom:12px;padding:24px 18px 55px}.r-header{font-size:8pt}.r-cover{padding-top:15px}.r-machine-number{margin-top:35px}.r-photo-grid img{height:220px}}
      @media print{@page{size:A4;margin:0}html,body{background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.print-toolbar{display:none!important}.report-document{padding:0}.report-page{width:210mm;height:297mm;min-height:297mm;margin:0;box-shadow:none;break-after:page;page-break-after:always}.report-page:last-child{break-after:auto;page-break-after:auto}}
    </style>`;
  }

  async function renderReportScreen(markFinished = false) {
    if (!state.activeVisit) return;
    const loading = $('#reportLoading');
    loading.classList.remove('hidden');
    $('#reportPreview').replaceChildren();
    showScreen('report');
    try {
      if (markFinished) {
        state.activeVisit.status = 'Terminée';
        state.activeVisit.completedAt = new Date().toISOString();
        saveActiveVisit();
      }
      state.reportHtml = await buildReportPagesHtml();
      $('#reportPreview').innerHTML = `${reportStyles(false)}<div class="report-document">${state.reportHtml}</div>`;
      $('#reportSubtitle').textContent = `${state.activeMachine.parkNumber || state.activeMachine.id} · ${state.activeVisit.status}`;
    } catch (error) {
      console.error(error);
      toast('Impossible de préparer le rapport.');
    } finally {
      loading.classList.add('hidden');
    }
  }

  function openPrintableReport() {
    if (!state.reportHtml) return toast('Préparez d’abord l’aperçu du rapport.');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return toast('Autorisez l’ouverture de la fenêtre du rapport.');
    const title = `${state.activeMachine.parkNumber || state.activeMachine.id}_VFG_${new Date().toISOString().slice(0, 10)}`;
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title>${reportStyles(true)}</head><body><div class="print-toolbar"><button class="close" onclick="window.close()">Fermer</button><button class="print" onclick="window.print()">Imprimer / Enregistrer en PDF</button></div><div class="report-document">${state.reportHtml}</div></body></html>`);
    printWindow.document.close();
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
        cancelFindingForm();
      } else if (state.activeScreen === 'inspection') {
        renderZone(state.activeZone);
      } else if (state.activeScreen === 'placeholder') {
        if (state.activeZone) renderZone(state.activeZone);
        else showScreen('dashboard');
      } else if (state.activeScreen === 'findings') {
        if (state.activeZone) renderZone(state.activeZone);
        else showScreen('dashboard');
      } else if (state.activeScreen === 'report') {
        showScreen('dashboard');
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
    $('#previewReport').addEventListener('click', () => renderReportScreen(false));
    $('#reportBack').addEventListener('click', () => showScreen('dashboard'));
    $('#printReport').addEventListener('click', openPrintableReport);
    $('#finishVisit').addEventListener('click', async () => {
      const carrier = zoneProgress(state.activeVisit, 'carrier');
      const upper = zoneProgress(state.activeVisit, 'upper');
      const remaining = carrier.remaining + upper.remaining;
      if (remaining > 0) toast(`Impossible de terminer : ${remaining} point(s) restent à contrôler.`);
      else await renderReportScreen(true);
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
    screens.report = $('#reportScreen');
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
