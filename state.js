const STORAGE_KEYS = {
  recents: 'foselev_v3_recent_machines',
  activeMachine: 'foselev_v3_active_machine',
  visits: 'foselev_vfg_visits'
};

export const state = {
  machines: [],
  activeMachine: null,
  recents: [],
  activeScreen: 'search'
};

export function loadRecents() {
  try { state.recents = JSON.parse(localStorage.getItem(STORAGE_KEYS.recents) || '[]'); }
  catch { state.recents = []; }
  return state.recents;
}

export function rememberMachine(machine) {
  const summary = {
    id: machine.id,
    parkNumber: machine.parkNumber,
    brand: machine.brand,
    model: machine.model,
    serialNumber: machine.serialNumber,
    agency: machine.agency,
    category: machine.category
  };
  state.recents = [summary, ...state.recents.filter(item => item.id !== summary.id)].slice(0, 10);
  localStorage.setItem(STORAGE_KEYS.recents, JSON.stringify(state.recents));
  localStorage.setItem(STORAGE_KEYS.activeMachine, JSON.stringify(summary));
}

export function clearRecents() {
  state.recents = [];
  localStorage.removeItem(STORAGE_KEYS.recents);
}

export function visitProgress(machineId) {
  let visits = [];
  try { visits = JSON.parse(localStorage.getItem(STORAGE_KEYS.visits) || '[]'); } catch {}
  const visit = visits.find(v => v.machineSnapshot?.id === machineId || v.machineSnapshot?.parkNumber === machineId);
  if (!visit) {
    return {
      carrier: { remaining: 0, total: 0, ncOpen: 0, ncTotal: 0 },
      upper: { remaining: 0, total: 0, ncOpen: 0, ncTotal: 0 }
    };
  }
  const checks = Array.isArray(visit.checks) ? visit.checks : [];
  const carrierChecks = checks.filter(c => String(c.zone || c.section || '').toLowerCase().includes('porteur'));
  const upperChecks = checks.filter(c => String(c.zone || c.section || '').toLowerCase().includes('tourelle'));
  const derive = list => ({
    remaining: list.filter(c => !['Conforme','Observation','Réserve','Non conforme'].includes(c.status)).length,
    total: list.length,
    ncOpen: list.filter(c => c.status === 'Non conforme' && c.workflowStatus === 'En cours').length,
    ncTotal: list.filter(c => c.status === 'Non conforme').length
  });
  return { carrier: derive(carrierChecks), upper: derive(upperChecks) };
}
