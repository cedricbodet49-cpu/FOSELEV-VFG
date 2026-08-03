import { state, rememberMachine, visitProgress } from './state.js';

const $ = selector => document.querySelector(selector);
const screens = {
  search: $('#searchScreen'), dashboard: $('#dashboardScreen'), placeholder: $('#placeholderScreen')
};

export function showScreen(name) {
  Object.values(screens).forEach(el => el.classList.remove('active'));
  screens[name].classList.add('active');
  state.activeScreen = name;
  $('#backButton').classList.toggle('hidden', name === 'search');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function categoryIcon(category, model = '') {
  if (/\bmk\b/i.test(model)) return '🏗️';
  if (category === 'CB') return '🚚';
  if (category === 'CN') return '🚐';
  return '🏗️';
}

export function machineRow(machine) {
  const button = document.createElement('button');
  button.className = 'machine-row';
  button.type = 'button';
  button.innerHTML = `
    <span class="machine-icon" aria-hidden="true">${categoryIcon(machine.category, machine.model)}</span>
    <span class="machine-main"><strong>${escapeHtml(machine.parkNumber || machine.id)}</strong><span>${escapeHtml([machine.brand, machine.model].filter(Boolean).join(' · '))}<br>${escapeHtml(machine.agency || '')}</span></span>
    <span class="machine-arrow" aria-hidden="true">›</span>`;
  button.addEventListener('click', () => openMachine(machine));
  return button;
}

export function renderMachineList(container, machines, emptyText) {
  container.replaceChildren();
  if (!machines.length) {
    const empty = document.createElement('div'); empty.className = 'empty-state'; empty.textContent = emptyText;
    container.appendChild(empty); return;
  }
  machines.forEach(machine => container.appendChild(machineRow(machine)));
}

export function openMachine(machine) {
  state.activeMachine = machine;
  rememberMachine(machine);
  $('#dashboardTitle').textContent = `${machine.parkNumber} · ${machine.model || machine.designation || 'Machine'}`;
  $('#dashboardSubtitle').textContent = [machine.brand, machine.serialNumber ? `Série ${machine.serialNumber}` : '', machine.agency].filter(Boolean).join(' · ');
  const progress = visitProgress(machine.id || machine.parkNumber);
  renderProgress('carrier', progress.carrier);
  renderProgress('upper', progress.upper);
  showScreen('dashboard');
}

function renderProgress(zone, progress) {
  $(`#${zone}Progress`).textContent = `${progress.remaining}/${progress.total}`;
  const button = $(`#${zone}Nc`);
  button.textContent = `NC ${progress.ncOpen}/${progress.ncTotal}`;
  button.classList.toggle('hidden', progress.ncTotal === 0);
}

export function openPlaceholder(title, text) {
  $('#placeholderTitle').textContent = title;
  $('#placeholderText').textContent = text;
  showScreen('placeholder');
}

export function toast(message) {
  const el = $('#toast'); el.textContent = message; el.classList.remove('hidden');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.add('hidden'), 2400);
}

function escapeHtml(value='') {
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}
