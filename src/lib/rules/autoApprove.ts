/**
 * Sold Equipment auto-approve rule engine v1
 * Property-first: customer note → install history → weak global SAFE fallback
 * See docs/docs-auto-approve-v1.md
 */

export type OpsDecision = 'auto' | 'escalate';

export type WarehouseHint = 'auto' | 'check' | 'special-order' | 'short';

export interface AutoApproveInput {
  locationName: string;
  jobNumber?: string | null;
  skus: string[];
  serviceDescription?: string | null;
  installType?: string | null;
  tonnage?: string | number | null;
  /** Models required / allowed from ST customer/location note */
  customerNoteSkus?: string[] | null;
  /** Past approved SKU sets at this property */
  propertyHistorySets?: string[][] | null;
  /** Optional count of prior installs (for reason text) */
  propertyHistoryCount?: number | null;
}

export interface AutoApproveResult {
  opsDecision: OpsDecision;
  warehouseHint: WarehouseHint;
  reasons: string[];
  a2lFlag?: boolean;
  matchedRule?: string;
}

/** Canonical SC Ceiling pairs by tonnage — weak global fallback only */
export const CANONICAL_PAIRS: Record<
  string,
  { condenser: string; ah: string[]; label: string }
> = {
  '2': {
    condenser: 'GLXS4BA2410A',
    ah: ['24HXS05'],
    label: '2T SC Ceiling',
  },
  '2.5': {
    condenser: 'GLXS4BA3010A',
    ah: ['30HXS05'],
    label: '2.5T SC Ceiling',
  },
  '3': {
    condenser: 'GLXS4BA3610A',
    ah: ['36HXS05', '36HX5'],
    label: '3T SC Ceiling',
  },
};

/** @deprecated Prefer property note + history; kept for display of fallback pairs */
export const HIGH_VOLUME_PROPERTIES = [
  'rise',
  'clifford',
  'station 21',
  'cornerstone',
  'imt ahwatukee',
  'ovation',
  'dana park',
  'montero',
  'desert eagle',
  'biscayne',
  'talise',
  'sonoran',
  'residences',
  'the turn',
  'the core',
  'cambria',
  'san riva',
  'village at sun valley',
  'olive east',
  'morgan park',
  'renue',
  'la costa',
];

/**
 * Parse free-text ST customer/location note into equipment model SKUs.
 * Matches uppercase HVAC model tokens (GLXS*, GLZS*, A5AC*, FMA5*, AWST*, HXS, etc.).
 */
export function parseCustomerNoteSkus(note: string | null | undefined): string[] {
  if (!note || !String(note).trim()) return [];
  const upper = String(note).toUpperCase();
  const re =
    /\b(?:GLXS[A-Z0-9]{4,}|GLZS[A-Z0-9]{4,}|A5AC[A-Z0-9]{2,}|FMA5X[A-Z0-9]{3,}|AWST[A-Z0-9]{4,}|A4AH4P[A-Z0-9]{2,}|\d{2}HXS?\d{1,3}[A-Z]?)\b/g;
  const found = upper.match(re) || [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of found) {
    if (!seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

function normalizeSkus(skus: string[]): string[] {
  return skus
    .map((s) => String(s || '').trim().toUpperCase())
    .filter(Boolean)
    .sort();
}

function loc(name: string): string {
  return (name || '').toLowerCase().trim();
}

function isHue97(locationName: string): boolean {
  return /hue\s*97|hue97/i.test(locationName);
}

function isIndigo(locationName: string): boolean {
  return /\bindigo\b/i.test(locationName);
}

function isRiseBroadway(locationName: string): boolean {
  return /rise\s*broadway/i.test(locationName);
}

function isRiseCondenserProperty(locationName: string): boolean {
  return /rise\s*(broadway|suncrest|mcclintock)/i.test(locationName);
}

function isParkMesa(locationName: string): boolean {
  return /park\s*mesa/i.test(locationName);
}

function isGriffin(locationName: string): boolean {
  return /\bgriffin\b/i.test(locationName);
}

function hasGlzs(skus: string[]): boolean {
  return skus.some((s) => s.startsWith('GLZS'));
}

function detectTonnageFromSkus(skus: string[]): number | null {
  const set = new Set(skus);
  if (set.has('GLXS4BA2410A') || set.has('A5AC4024') || set.has('24HXS05')) return 2;
  if (set.has('GLXS4BA3010A') || set.has('A5AC4030') || set.has('30HXS05')) return 2.5;
  if (set.has('GLXS4BA3610A') || set.has('A5AC4036') || set.has('36HXS05') || set.has('36HX5'))
    return 3;
  for (const s of skus) {
    const m = s.match(/(?:GLXS4BA|GLZS4BA|A5AC40)(\d{2})/i);
    if (m) {
      const tons = Number(m[1]) / 12;
      if (tons === 2 || tons === 2.5 || tons === 3) return tons;
    }
  }
  return null;
}

function parseDeclaredTonnage(t?: string | number | null): number | null {
  if (t === null || t === undefined || t === '') return null;
  if (typeof t === 'number' && !Number.isNaN(t)) return t;
  const s = String(t).toLowerCase().replace(/ton(s)?/g, '').trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function setsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

function isSubset(sold: string[], allowed: string[]): boolean {
  const allow = new Set(normalizeSkus(allowed));
  return sold.length > 0 && sold.every((s) => allow.has(s));
}

function noteHasA5ac(noteSkus: string[] | null | undefined): boolean {
  return (noteSkus || []).some((s) => String(s).toUpperCase().startsWith('A5AC'));
}

function historyHasA5ac(sets: string[][] | null | undefined): boolean {
  return (sets || []).some((set) => set.some((s) => String(s).toUpperCase().startsWith('A5AC')));
}

function matchCanonicalPair(skus: string[]): { tonnage: string; label: string } | null {
  for (const [tons, pair] of Object.entries(CANONICAL_PAIRS)) {
    for (const ah of pair.ah) {
      if (setsEqual(skus, [pair.condenser, ah])) {
        return { tonnage: tons, label: pair.label };
      }
    }
  }
  return null;
}

function detectInstallType(input: AutoApproveInput, skus: string[]): string {
  if (input.installType) return input.installType;
  const desc = (input.serviceDescription || '').toLowerCase();
  if (/hp\s*closet|heat\s*pump|closet/.test(desc) || hasGlzs(skus)) return 'HP Closet';
  if (/wall/.test(desc)) return 'Wall';
  if (/condenser\s*only|condenser install/.test(desc)) return 'Condenser Only';
  if (/ceiling|sc\s*ceiling|straight\s*cool/.test(desc)) return 'SC Ceiling';
  if (skus.includes('FMA5X2400AL') || skus.includes('AWST24SU1305')) return 'Wall';
  if (skus.length === 1 && skus[0] === 'GLXS4BA2410A') return 'Condenser Only';
  if (matchCanonicalPair(skus)) return 'SC Ceiling';
  return 'Unknown';
}

function hue97Preferred(skus: string[]): boolean {
  const set = new Set(skus);
  if (set.has('A5AC4030') && set.has('30HXS05')) return true;
  if (set.has('A5AC4036') && (set.has('36HXS05') || set.has('36HX5'))) return true;
  return false;
}

function hasNote(input: AutoApproveInput): boolean {
  return Array.isArray(input.customerNoteSkus) && input.customerNoteSkus.length > 0;
}

function hasHistory(input: AutoApproveInput): boolean {
  return Array.isArray(input.propertyHistorySets) && input.propertyHistorySets.length > 0;
}

export function evaluateAutoApprove(input: AutoApproveInput): AutoApproveResult {
  const reasons: string[] = [];
  const skus = normalizeSkus(input.skus || []);
  const locationName = input.locationName || '';
  const jobNumber = (input.jobNumber || '').trim();
  const noteSkus = normalizeSkus(input.customerNoteSkus || []);
  const historySets = (input.propertyHistorySets || []).map((set) => normalizeSkus(set));
  const historyCount =
    input.propertyHistoryCount != null && input.propertyHistoryCount > 0
      ? input.propertyHistoryCount
      : historySets.length;

  if (!jobNumber || /^#?n\/?a$/i.test(jobNumber)) {
    reasons.push('Job is N/A (normal — does not block auto-approve)');
  }

  // 1. Empty skus → escalate
  if (skus.length === 0) {
    return {
      opsDecision: 'escalate',
      warehouseHint: 'check',
      reasons: [...reasons, 'No equipment SKUs detected'],
      matchedRule: 'empty-skus',
    };
  }

  const installType = detectInstallType(input, skus);
  const declaredTons = parseDeclaredTonnage(input.tonnage);
  const skuTons = detectTonnageFromSkus(skus);
  const notePresent = hasNote(input);
  const historyPresent = hasHistory(input);

  // 2–3. Customer note (property-first)
  if (notePresent) {
    if (isSubset(skus, noteSkus)) {
      reasons.push(
        `Customer note match: sold=[${skus.join(', ')}] ⊆ note=[${noteSkus.join(', ')}]`,
      );
      return {
        opsDecision: 'auto',
        warehouseHint: isHue97(locationName) && noteHasA5ac(noteSkus) ? 'special-order' : 'auto',
        reasons,
        a2lFlag:
          (isRiseBroadway(locationName) || isRiseCondenserProperty(locationName)) &&
          skus.length === 1 &&
          skus[0] === 'GLXS4BA2410A',
        matchedRule: 'customer-note-match',
      };
    }
    reasons.push(
      `Conflicts with property customer note: note=[${noteSkus.join(', ')}] sold=[${skus.join(', ')}]`,
    );
    return {
      opsDecision: 'escalate',
      warehouseHint: 'check',
      reasons,
      matchedRule: 'customer-note-conflict',
    };
  }

  // 4–5. Property install history
  if (historyPresent) {
    const matched = historySets.some((set) => setsEqual(skus, set));
    if (matched) {
      reasons.push(`Property install history match (${historyCount} prior installs)`);
      return {
        opsDecision: 'auto',
        warehouseHint:
          isHue97(locationName) && historyHasA5ac(input.propertyHistorySets)
            ? 'special-order'
            : 'auto',
        reasons,
        a2lFlag:
          (isRiseBroadway(locationName) || isRiseCondenserProperty(locationName)) &&
          skus.length === 1 &&
          skus[0] === 'GLXS4BA2410A',
        matchedRule: 'property-history-match',
      };
    }
    reasons.push('Sold SKUs not seen in property install history');
    return {
      opsDecision: 'escalate',
      warehouseHint: 'check',
      reasons,
      matchedRule: 'property-history-miss',
    };
  }

  // 6. Hard escalates (only when no note and no history)
  if (isIndigo(locationName) || hasGlzs(skus) || /hp\s*closet/i.test(installType)) {
    reasons.push('Indigo / GLZS* / HP Closet requires supervisor review');
    return {
      opsDecision: 'escalate',
      warehouseHint: 'special-order',
      reasons,
      matchedRule: 'indigo-hp-closet',
    };
  }

  if (declaredTons !== null && skuTons !== null && declaredTons !== skuTons) {
    reasons.push(
      `Tonnage mismatch: line=${declaredTons}T vs SKU-encoded=${skuTons}T`,
    );
    return {
      opsDecision: 'escalate',
      warehouseHint: 'check',
      reasons,
      matchedRule: 'tonnage-mismatch',
    };
  }

  // 7. Hue97 — note/history already handled above; here prefer existing A5AC logic
  if (isHue97(locationName)) {
    if (hue97Preferred(skus)) {
      reasons.push('Hue97 preferred 454B A5AC + matching HXS — ops auto');
      return {
        opsDecision: 'auto',
        warehouseHint: 'special-order',
        reasons: [
          ...reasons,
          'Warehouse: Hue97 A5AC often special-order — prefer stock check',
        ],
        matchedRule: 'hue97-preferred',
      };
    }
    reasons.push('Hue97 without preferred A5AC4030/36 + HXS — escalate');
    return {
      opsDecision: 'escalate',
      warehouseHint: 'special-order',
      reasons,
      matchedRule: 'hue97-escalate',
    };
  }

  // 8. Fallback: global SAFE pairs / location overrides (no note and no history only)
  if (
    (isRiseBroadway(locationName) || isRiseCondenserProperty(locationName)) &&
    skus.length === 1 &&
    skus[0] === 'GLXS4BA2410A'
  ) {
    reasons.push(
      'Fallback: global SAFE pair — Rise condenser-only GLXS4BA2410A; flag A2L sensor add',
    );
    return {
      opsDecision: 'auto',
      warehouseHint: 'auto',
      reasons,
      a2lFlag: true,
      matchedRule: 'rise-condenser-only',
    };
  }

  if (isParkMesa(locationName) && setsEqual(skus, ['A5AC4024', 'FMA5X2400AL'])) {
    reasons.push('Fallback: global SAFE pair — Park Mesa wall A5AC4024 + FMA5X2400AL');
    return {
      opsDecision: 'auto',
      warehouseHint: 'auto',
      reasons,
      matchedRule: 'park-mesa-wall',
    };
  }

  if (isGriffin(locationName) && setsEqual(skus, ['AWST24SU1305', 'GLXS4BA2410A'])) {
    reasons.push('Fallback: global SAFE pair — Griffin wall GLXS4BA2410A + AWST24SU1305');
    return {
      opsDecision: 'auto',
      warehouseHint: 'auto',
      reasons,
      matchedRule: 'griffin-wall',
    };
  }

  if (/wall|closet|hp|misc/i.test(installType) && installType !== 'SC Ceiling') {
    if (installType === 'Condenser Only') {
      reasons.push('Condenser-only outside Rise override — escalate');
      return {
        opsDecision: 'escalate',
        warehouseHint: 'check',
        reasons,
        matchedRule: 'condenser-only-unknown',
      };
    }
    reasons.push(`Install type "${installType}" not in SAFE overrides — escalate`);
    return {
      opsDecision: 'escalate',
      warehouseHint: 'check',
      reasons,
      matchedRule: 'non-safe-install-type',
    };
  }

  const canonical = matchCanonicalPair(skus);
  if (canonical) {
    if (declaredTons !== null && Number(canonical.tonnage) !== declaredTons) {
      reasons.push(
        `Tonnage mismatch: line=${declaredTons}T vs pair=${canonical.tonnage}T`,
      );
      return {
        opsDecision: 'escalate',
        warehouseHint: 'check',
        reasons,
        matchedRule: 'tonnage-mismatch-pair',
      };
    }

    reasons.push(
      `Fallback: global SAFE pair — ${canonical.label} (${skus.join(' + ')})`,
    );
    return {
      opsDecision: 'auto',
      warehouseHint: 'auto',
      reasons,
      matchedRule: `canonical-${canonical.tonnage}t-fallback`,
    };
  }

  reasons.push(`SKU set not in canonical table: ${skus.join(', ')}`);
  return {
    opsDecision: 'escalate',
    warehouseHint: 'check',
    reasons,
    matchedRule: 'unknown-skus',
  };
}

export function formatCanonicalPairsForDisplay() {
  return Object.entries(CANONICAL_PAIRS).map(([tons, p]) => ({
    tonnage: `${tons}T`,
    condenser: p.condenser,
    airHandlers: p.ah,
    label: p.label,
  }));
}

/** @deprecated use loc matching via property profiles */
export function isHighVolumeProperty(locationName: string): boolean {
  const l = loc(locationName);
  return HIGH_VOLUME_PROPERTIES.some((p) => l.includes(p));
}
