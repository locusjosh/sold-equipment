'use client';

import { SEED_DATA, type InstallRow, type SoldRow } from './seedData';

export type { InstallRow, SoldRow };

const SOLD_KEY = 'sold-equipment:sold-overrides';
const INSTALL_KEY = 'sold-equipment:install-overrides';

type SoldOverrides = Record<string, Partial<SoldRow>>;
type InstallOverrides = Record<string, Partial<InstallRow>>;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getSoldRows(opts?: { q?: string; statusOps?: string }): SoldRow[] {
  const overrides = readJson<SoldOverrides>(SOLD_KEY, {});
  let rows = SEED_DATA.sold.map((r) => ({ ...r, ...overrides[r.id] }));
  if (opts?.statusOps) {
    rows = rows.filter((r) => r.statusOps === opts.statusOps);
  }
  if (opts?.q) {
    const q = opts.q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.locationName.toLowerCase().includes(q) ||
        r.estimateId.toLowerCase().includes(q) ||
        r.skus.some((s) => s.toLowerCase().includes(q)),
    );
  }
  return rows;
}

export function getSoldById(id: string): SoldRow | null {
  return getSoldRows().find((r) => r.id === id) || null;
}

export function updateSold(id: string, patch: Partial<SoldRow>) {
  const overrides = readJson<SoldOverrides>(SOLD_KEY, {});
  overrides[id] = { ...overrides[id], ...patch };
  writeJson(SOLD_KEY, overrides);
}

export function decideSold(id: string, action: string): SoldRow | null {
  const row = getSoldById(id);
  if (!row) return null;

  if (action === 'approve') {
    updateSold(id, {
      statusOps: 'approved',
      statusWarehouse: row.statusWarehouse === 'pending' ? 'auto' : row.statusWarehouse,
    });
    // Ensure an install exists for approved rows
    const installs = getInstallRows();
    if (!installs.some((i) => i.estimateId === row.estimateId)) {
      upsertInstall({
        id: `install-${row.estimateId}`,
        estimateId: row.estimateId,
        equipment: row.skus.join(' + '),
        customer: row.locationName,
        dateApproved: new Date().toISOString(),
        status: 'Pending',
        loadedAt: null,
        scheduledDate: null,
        assignedTechs: [],
        installJobNumber: null,
      });
    }
  } else if (action === 'decline') {
    updateSold(id, { statusOps: 'declined' });
  } else if (action === 'ready') {
    updateSold(id, { statusWarehouse: 'ready' });
    const install = getInstallRows().find((i) => i.estimateId === row.estimateId);
    if (install) updateInstall(install.id, { status: 'Ready' });
  } else if (action === 'not_ready') {
    updateSold(id, { statusWarehouse: 'not_ready' });
    const install = getInstallRows().find((i) => i.estimateId === row.estimateId);
    if (install) updateInstall(install.id, { status: 'NotReady' });
  }

  return getSoldById(id);
}

function upsertInstall(row: InstallRow) {
  const overrides = readJson<InstallOverrides>(INSTALL_KEY, {});
  const extraKey = 'sold-equipment:extra-installs';
  const extras = readJson<InstallRow[]>(extraKey, []);
  if (!SEED_DATA.installs.some((i) => i.id === row.id) && !extras.some((i) => i.id === row.id)) {
    extras.push(row);
    writeJson(extraKey, extras);
  } else {
    overrides[row.id] = { ...overrides[row.id], ...row };
    writeJson(INSTALL_KEY, overrides);
  }
}

export function getInstallRows(opts?: { filter?: string; status?: string }): InstallRow[] {
  const overrides = readJson<InstallOverrides>(INSTALL_KEY, {});
  const extras = readJson<InstallRow[]>('sold-equipment:extra-installs', []);
  let rows = [...SEED_DATA.installs, ...extras].map((r) => ({ ...r, ...overrides[r.id] }));

  if (opts?.status) {
    rows = rows.filter((r) => r.status === opts.status);
  }

  if (opts?.filter === 'today') {
    const today = new Date().toDateString();
    rows = rows.filter((r) => {
      if (!r.scheduledDate) return r.status === 'Ready';
      return new Date(r.scheduledDate).toDateString() === today;
    });
  } else if (opts?.filter === 'upcoming') {
    const now = Date.now();
    rows = rows.filter((r) => {
      if (!r.scheduledDate) return false;
      return new Date(r.scheduledDate).getTime() >= now;
    });
  }

  return rows;
}

export function updateInstall(id: string, patch: Partial<InstallRow>) {
  const overrides = readJson<InstallOverrides>(INSTALL_KEY, {});
  overrides[id] = { ...overrides[id], ...patch };
  writeJson(INSTALL_KEY, overrides);
}

export function markLoaded(id: string) {
  updateInstall(id, { loadedAt: new Date().toISOString() });
}

export function clearLoaded(id: string) {
  updateInstall(id, { loadedAt: null });
}

export function resetDemoData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SOLD_KEY);
  localStorage.removeItem(INSTALL_KEY);
  localStorage.removeItem('sold-equipment:extra-installs');
}
