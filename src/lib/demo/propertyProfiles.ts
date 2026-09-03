import { parseCustomerNoteSkus } from '@/lib/rules/autoApprove';

export type PropertyProfile = {
  customerNote: string;
  customerNoteSkus: string[];
  historySets: string[][];
  historyCount: number;
  /** Short summary for SoldRow.historySummary */
  historySummary: string;
};

const PROFILES: Record<string, Omit<PropertyProfile, 'customerNoteSkus'> & { customerNoteSkus?: string[] }> = {
  clifford: {
    customerNote:
      'Clifford standard: use GLXS4BA2410A + 24HXS05 for 2T SC ceiling. Do not sub without ops.',
    historySets: [
      ['GLXS4BA2410A', '24HXS05'],
      ['GLXS4BA2410A', '24HXS05'],
      ['GLXS4BA2410A', '24HXS05'],
    ],
    historyCount: 12,
    historySummary: '12 prior installs — most common GLXS4BA2410A+24HXS05',
  },
  hue97: {
    customerNote:
      'Hue97 prefers 454B: A5AC4030 + 30HXS05 (2.5T) or A5AC4036 + 36HXS05 (3T). Special-order from Trane when needed.',
    historySets: [
      ['A5AC4030', '30HXS05'],
      ['A5AC4036', '36HXS05'],
      ['A5AC4030', '30HXS05'],
    ],
    historyCount: 8,
    historySummary: '8 prior installs — most common A5AC4030+30HXS05',
  },
  'rise broadway': {
    customerNote:
      'Rise Broadway condenser-only common: GLXS4BA2410A. Flag A2L sensor on condenser installs.',
    historySets: [
      ['GLXS4BA2410A'],
      ['GLXS4BA2410A'],
      ['GLXS4BA2410A', '24HXS05'],
    ],
    historyCount: 15,
    historySummary: '15 prior installs — most common GLXS4BA2410A (condenser-only)',
  },
  ovation: {
    customerNote:
      'Ovation Tempe 2T SC ceiling: GLXS4BA2410A + 24HXS05.',
    historySets: [
      ['GLXS4BA2410A', '24HXS05'],
      ['GLXS4BA2410A', '24HXS05'],
    ],
    historyCount: 10,
    historySummary: '10 prior installs — most common GLXS4BA2410A+24HXS05',
  },
  'park mesa': {
    customerNote:
      'Park Mesa wall: A5AC4024 + FMA5X2400AL only.',
    historySets: [['A5AC4024', 'FMA5X2400AL']],
    historyCount: 4,
    historySummary: '4 prior installs — most common A5AC4024+FMA5X2400AL',
  },
  'desert eagle': {
    customerNote:
      'Desert Eagle 3T SC ceiling: GLXS4BA3610A + 36HXS05 (legacy 36HX5 ok).',
    historySets: [
      ['GLXS4BA3610A', '36HXS05'],
      ['GLXS4BA3610A', '36HX5'],
      ['GLXS4BA2410A', '24HXS05'],
    ],
    historyCount: 7,
    historySummary: '7 prior installs — most common GLXS4BA3610A+36HXS05',
  },
  indigo: {
    customerNote:
      'Indigo HP Closet — GLZS* / multi-position AH. Always escalate to supervisor; do not auto from note alone without review.',
    // Intentionally no parseable required pair that matches HP sold set as "safe auto" —
    // note lists family tokens for conflict/awareness; hard escalate still applies when no note match.
    // We leave concrete SKUs that won't subset-match the seed GLZS+A4AH pair as a full required list:
    // Actually seed sells GLZS4BA3610A + A4AH4P36 — if those appear in note, note-match would auto.
    // Per ops: Indigo should escalate. Use a note that mentions preferred AH family without matching sold,
    // OR list models that conflict. Conflict path: note requires a different approved set.
    customerNoteSkus: ['GLZS4BA3010A', 'A4AH4P30'],
    historySets: [
      ['GLZS4BA3010A', 'A4AH4P30'],
    ],
    historyCount: 3,
    historySummary: '3 prior installs — most common GLZS4BA3010A+A4AH4P30 (HP Closet — review)',
  },
  cornerstone: {
    customerNote:
      'Cornerstone Ranch: 2T GLXS4BA2410A+24HXS05 or 2.5T GLXS4BA3010A+30HXS05.',
    historySets: [
      ['GLXS4BA2410A', '24HXS05'],
      ['GLXS4BA3010A', '30HXS05'],
    ],
    historyCount: 9,
    historySummary: '9 prior installs — most common GLXS4BA2410A+24HXS05',
  },
};

function resolveKey(locationName: string): string | null {
  const l = (locationName || '').toLowerCase();
  const keys = Object.keys(PROFILES).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (l.includes(k)) return k;
  }
  return null;
}

export function getPropertyProfile(locationName: string): PropertyProfile | null {
  const key = resolveKey(locationName);
  if (!key) return null;
  const raw = PROFILES[key];
  const customerNoteSkus =
    raw.customerNoteSkus && raw.customerNoteSkus.length > 0
      ? raw.customerNoteSkus.map((s) => s.toUpperCase())
      : parseCustomerNoteSkus(raw.customerNote);
  return {
    customerNote: raw.customerNote,
    customerNoteSkus,
    historySets: raw.historySets,
    historyCount: raw.historyCount,
    historySummary: raw.historySummary,
  };
}

export function listPropertyProfiles(): { key: string; profile: PropertyProfile }[] {
  return Object.keys(PROFILES).map((key) => ({
    key,
    profile: getPropertyProfile(key)!,
  }));
}
