import { loadMachines, searchMachines } from './data.js';
import { state, loadRecents, clearRecents } from './state.js';
import { showScreen, renderMachineList, openPlaceholder, toast } from './ui.js';

const $ = selector => document.querySelector(selector);

async function init() {
  loadRecents();
  renderMachineList($('#recentMachines'), state.recents, 'Aucune machine récente. Lancez une recherche.');
  try {
    state.machines = await loadMachines();
  } catch (error) {
    console.error(error);
    toast('Impossible de charger le parc matériel.');
  }
  bindEvents();
}

function bindEvents() {
  const input = $('#machineSearch');
  input.addEventListener('input', () => {
    const query = input.value.trim();
    $('#clearSearch').classList.toggle('hidden', !query);
    const results = searchMachines(state.machines, query);
    $('#resultsSection').classList.toggle('hidden', !query);
    $('#resultCount').textContent = results.length;
    renderMachineList($('#searchResults'), results, 'Aucune machine trouvée.');
  });

  $('#clearSearch').addEventListener('click', () => {
    input.value = ''; input.dispatchEvent(new Event('input')); input.focus();
  });

  $('#clearRecents').addEventListener('click', () => {
    clearRecents();
    renderMachineList($('#recentMachines'), [], 'Aucune machine récente. Lancez une recherche.');
  });

  $('#backButton').addEventListener('click', () => {
    if (state.activeScreen === 'placeholder') showScreen('dashboard');
    else showScreen('search');
  });
  $('#helpButton').addEventListener('click', () => toast('Saisissez un parc, une série, un modèle ou une agence.'));
  document.querySelectorAll('[data-open-zone]').forEach(button => button.addEventListener('click', () => {
    const label = button.dataset.openZone === 'carrier' ? 'Porteur' : 'Tourelle';
    openPlaceholder(label, `La liste de contrôle ${label.toLowerCase()} sera intégrée au Sprint 2.`);
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

init();
