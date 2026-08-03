export async function loadMachines() {
  const response = await fetch('./parc.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Chargement parc impossible (${response.status})`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Format parc.json invalide');
  return data;
}

export function normalize(value = '') {
  return String(value)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function searchMachines(machines, query) {
  const q = normalize(query);
  if (!q) return [];
  return machines.filter(machine => normalize([
    machine.parkNumber, machine.rawParkNumber, machine.serialNumber,
    machine.registration, machine.brand, machine.model, machine.designation,
    machine.company, machine.agency, machine.city
  ].filter(Boolean).join(' ')).includes(q)).slice(0, 60);
}
