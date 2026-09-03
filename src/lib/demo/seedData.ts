import { evaluateAutoApprove } from '@/lib/rules/autoApprove';
import { getPropertyProfile } from '@/lib/demo/propertyProfiles';

export type SoldRow = {
  id: string;
  estimateId: string;
  locationName: string;
  jobNumber: string | null;
  skus: string[];
  serviceDescription: string | null;
  installType: string | null;
  tonnage: string | null;
  total: number | null;
  statusOps: string;
  statusWarehouse: string;
  statusReq: string;
  decisionReasons: string[];
  warehouseHint: string | null;
  a2lFlag: boolean;
  slackTs: string | null;
  createdAt: string;
  customerNote: string | null;
  customerNoteSkus: string[];
  historySummary: string | null;
  historySets: string[][];
};

export type InstallRow = {
  id: string;
  estimateId: string | null;
  equipment: string;
  customer: string;
  dateApproved: string;
  status: string;
  loadedAt: string | null;
  scheduledDate: string | null;
  assignedTechs: string[];
  installJobNumber: string | null;
};

const RAW_SEED = [
  {
    estimateId: '40780001',
    locationName: 'The Clifford #214',
    jobNumber: 'N/A',
    skus: ['GLXS4BA2410A', '24HXS05'],
    serviceDescription: '2 Ton SC Ceiling Install',
    installType: 'SC Ceiling',
    tonnage: '2',
    total: 3995,
  },
  {
    estimateId: '40780002',
    locationName: 'Hue97 E207',
    jobNumber: '4522101',
    skus: ['GLXS4BA3010A', '30HXS05'],
    serviceDescription: '2.5 Ton SC Ceiling',
    installType: 'SC Ceiling',
    tonnage: '2.5',
    total: 4200,
  },
  {
    estimateId: '40780003',
    locationName: 'Rise Broadway #118',
    jobNumber: 'N/A',
    skus: ['GLXS4BA2410A'],
    serviceDescription: 'Condenser Install (SC)',
    installType: 'Condenser Only',
    tonnage: '2',
    total: 2795,
  },
  {
    estimateId: '40780004',
    locationName: 'Ovation Tempe #305',
    jobNumber: '#N/A',
    skus: ['GLXS4BA2410A', '24HXS05'],
    serviceDescription: '2 Ton SC Ceiling',
    installType: 'SC Ceiling',
    tonnage: '2',
    total: 4050,
  },
  {
    estimateId: '40780005',
    locationName: 'Indigo #228',
    jobNumber: '4522199',
    skus: ['GLZS4BA3610A', 'A4AH4P36'],
    serviceDescription: 'HP Closet AH',
    installType: 'HP Closet',
    tonnage: '3',
    total: 6100,
  },
  {
    estimateId: '40780006',
    locationName: 'Park Mesa #12',
    jobNumber: 'N/A',
    skus: ['A5AC4024', 'FMA5X2400AL'],
    serviceDescription: 'Wall AH Install',
    installType: 'Wall',
    tonnage: '2',
    total: 4900,
  },
  {
    estimateId: '40780007',
    locationName: 'Desert Eagle #401',
    jobNumber: '4522300',
    skus: ['GLXS4BA3610A', '36HXS05'],
    serviceDescription: '3 Ton SC Ceiling',
    installType: 'SC Ceiling',
    tonnage: '3',
    total: 4450,
  },
  {
    estimateId: '40780008',
    locationName: 'Cornerstone Ranch #2106',
    jobNumber: 'N/A',
    skus: ['WEIRD-SKU', 'UNKNOWN99'],
    serviceDescription: 'Misc equipment',
    installType: 'Misc',
    tonnage: null as string | null,
    total: 3500,
  },
];

function buildSeed(): { sold: SoldRow[]; installs: InstallRow[] } {
  const sold: SoldRow[] = [];
  const installs: InstallRow[] = [];
  const now = new Date().toISOString();

  for (const row of RAW_SEED) {
    const profile = getPropertyProfile(row.locationName);
    const customerNote = profile?.customerNote ?? null;
    const customerNoteSkus = profile?.customerNoteSkus ?? [];
    const historySets = profile?.historySets ?? [];
    const historySummary = profile?.historySummary ?? null;

    const decision = evaluateAutoApprove({
      locationName: row.locationName,
      jobNumber: row.jobNumber,
      skus: row.skus,
      serviceDescription: row.serviceDescription,
      installType: row.installType,
      tonnage: row.tonnage,
      customerNoteSkus: customerNoteSkus.length ? customerNoteSkus : null,
      propertyHistorySets: historySets.length ? historySets : null,
      propertyHistoryCount: profile?.historyCount ?? null,
    });

    const statusOps = decision.opsDecision === 'auto' ? 'auto' : 'escalate';
    const statusWarehouse =
      decision.opsDecision === 'auto'
        ? decision.warehouseHint === 'special-order'
          ? 'pending'
          : 'auto'
        : 'pending';

    const id = `seed-${row.estimateId}`;
    sold.push({
      id,
      estimateId: row.estimateId,
      locationName: row.locationName,
      jobNumber: row.jobNumber,
      skus: row.skus,
      serviceDescription: row.serviceDescription,
      installType: row.installType,
      tonnage: row.tonnage,
      total: row.total,
      statusOps,
      statusWarehouse,
      statusReq: 'pending',
      decisionReasons: decision.reasons,
      warehouseHint: decision.warehouseHint,
      a2lFlag: Boolean(decision.a2lFlag),
      slackTs: `${Date.now() / 1000}.seed`,
      createdAt: now,
      customerNote,
      customerNoteSkus,
      historySummary,
      historySets,
    });

    if (statusOps === 'auto') {
      installs.push({
        id: `install-${row.estimateId}`,
        estimateId: row.estimateId,
        equipment: row.skus.join(' + '),
        customer: row.locationName,
        dateApproved: now,
        status: 'Pending',
        loadedAt: null,
        scheduledDate: null,
        assignedTechs: [],
        installJobNumber: null,
      });
    }
  }

  installs.push({
    id: 'install-WH-STUB-01',
    estimateId: 'WH-STUB-01',
    equipment: 'GLXS4BA2410A + 24HXS05',
    customer: 'Station 21 #1032 (warehouse stub)',
    dateApproved: now,
    status: 'Ready',
    loadedAt: null,
    scheduledDate: now,
    assignedTechs: ['Tech A', 'Tech B'],
    installJobNumber: null,
  });

  return { sold, installs };
}

export const SEED_DATA = buildSeed();
export const SOLD_IDS = SEED_DATA.sold.map((s) => s.id);
