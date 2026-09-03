import { describe, it, expect } from 'vitest';
import { evaluateAutoApprove, parseCustomerNoteSkus } from './autoApprove';

describe('parseCustomerNoteSkus', () => {
  it('extracts common HVAC model tokens from free text', () => {
    const skus = parseCustomerNoteSkus(
      'Use GLXS4BA2410A + 24HXS05; alt A5AC4030 / FMA5X2400AL / AWST24SU1305. Legacy 36HX5 ok.',
    );
    expect(skus).toEqual(
      expect.arrayContaining([
        'GLXS4BA2410A',
        '24HXS05',
        'A5AC4030',
        'FMA5X2400AL',
        'AWST24SU1305',
        '36HX5',
      ]),
    );
  });

  it('returns empty for blank notes', () => {
    expect(parseCustomerNoteSkus(null)).toEqual([]);
    expect(parseCustomerNoteSkus('')).toEqual([]);
    expect(parseCustomerNoteSkus('no models here')).toEqual([]);
  });
});

describe('evaluateAutoApprove — property-first', () => {
  it('escalates on empty skus', () => {
    const r = evaluateAutoApprove({
      locationName: 'The Clifford',
      skus: [],
      customerNoteSkus: ['GLXS4BA2410A', '24HXS05'],
    });
    expect(r.opsDecision).toBe('escalate');
    expect(r.matchedRule).toBe('empty-skus');
  });

  it('auto on customer note match (subset, order-independent)', () => {
    const r = evaluateAutoApprove({
      locationName: 'The Clifford #214',
      jobNumber: 'N/A',
      skus: ['24HXS05', 'GLXS4BA2410A'],
      customerNoteSkus: ['GLXS4BA2410A', '24HXS05', 'GLXS4BA3010A', '30HXS05'],
      propertyHistorySets: [['GLXS4BA3610A', '36HXS05']],
    });
    expect(r.opsDecision).toBe('auto');
    expect(r.matchedRule).toBe('customer-note-match');
    expect(r.reasons.some((x) => /Customer note match/i.test(x))).toBe(true);
  });

  it('escalates on customer note conflict', () => {
    const r = evaluateAutoApprove({
      locationName: 'Hue97 E207',
      skus: ['GLXS4BA3010A', '30HXS05'],
      customerNoteSkus: ['A5AC4030', '30HXS05', 'A5AC4036', '36HXS05'],
    });
    expect(r.opsDecision).toBe('escalate');
    expect(r.matchedRule).toBe('customer-note-conflict');
    expect(r.reasons.some((x) => /Conflicts with property customer note/i.test(x))).toBe(true);
    expect(r.reasons.some((x) => /note=\[/.test(x) && /sold=\[/.test(x))).toBe(true);
  });

  it('auto on property install history set equality', () => {
    const r = evaluateAutoApprove({
      locationName: 'Ovation Tempe',
      skus: ['GLXS4BA2410A', '24HXS05'],
      customerNoteSkus: null,
      propertyHistorySets: [
        ['GLXS4BA3010A', '30HXS05'],
        ['GLXS4BA2410A', '24HXS05'],
      ],
      propertyHistoryCount: 10,
    });
    expect(r.opsDecision).toBe('auto');
    expect(r.matchedRule).toBe('property-history-match');
    expect(r.reasons.some((x) => /Property install history match \(10 prior installs\)/.test(x))).toBe(
      true,
    );
  });

  it('escalates when history exists but sold set not seen', () => {
    const r = evaluateAutoApprove({
      locationName: 'Cornerstone Ranch',
      skus: ['WEIRD-SKU', 'UNKNOWN99'],
      customerNoteSkus: null,
      propertyHistorySets: [
        ['GLXS4BA2410A', '24HXS05'],
        ['GLXS4BA3010A', '30HXS05'],
      ],
    });
    expect(r.opsDecision).toBe('escalate');
    expect(r.matchedRule).toBe('property-history-miss');
    expect(r.reasons.some((x) => /not seen in property install history/i.test(x))).toBe(true);
  });

  it('note takes priority over history', () => {
    const r = evaluateAutoApprove({
      locationName: 'Desert Eagle',
      skus: ['GLXS4BA3610A', '36HXS05'],
      customerNoteSkus: ['GLXS4BA3610A', '36HXS05'],
      propertyHistorySets: [['GLXS4BA2410A', '24HXS05']],
    });
    expect(r.matchedRule).toBe('customer-note-match');
  });

  it('Fallback: global SAFE pair when no note and no history', () => {
    const r = evaluateAutoApprove({
      locationName: 'Random Apartments',
      jobNumber: 'N/A',
      skus: ['GLXS4BA2410A', '24HXS05'],
      tonnage: 2,
      customerNoteSkus: null,
      propertyHistorySets: null,
    });
    expect(r.opsDecision).toBe('auto');
    expect(r.matchedRule).toMatch(/canonical-2.*fallback/);
    expect(r.reasons.some((x) => /Fallback: global SAFE pair/i.test(x))).toBe(true);
    expect(r.reasons.some((x) => /high-volume/i.test(x))).toBe(false);
  });

  it('never escalates solely for missing/N/A job', () => {
    const r = evaluateAutoApprove({
      locationName: 'Somewhere New',
      jobNumber: '#N/A',
      skus: ['24HXS05', 'GLXS4BA2410A'],
      tonnage: 2,
    });
    expect(r.opsDecision).toBe('auto');
    expect(r.reasons.some((x) => /N\/A/.test(x))).toBe(true);
  });

  it('Rise / Park Mesa / Griffin fallbacks labeled as Fallback', () => {
    const rise = evaluateAutoApprove({
      locationName: 'Rise Broadway',
      skus: ['GLXS4BA2410A'],
      serviceDescription: 'Condenser Install (SC)',
    });
    expect(rise.opsDecision).toBe('auto');
    expect(rise.a2lFlag).toBe(true);
    expect(rise.reasons.some((x) => /Fallback: global SAFE pair/i.test(x))).toBe(true);

    const park = evaluateAutoApprove({
      locationName: 'Park Mesa',
      skus: ['A5AC4024', 'FMA5X2400AL'],
    });
    expect(park.opsDecision).toBe('auto');
    expect(park.reasons.some((x) => /Fallback: global SAFE pair/i.test(x))).toBe(true);

    const griffin = evaluateAutoApprove({
      locationName: 'The Griffin',
      skus: ['GLXS4BA2410A', 'AWST24SU1305'],
    });
    expect(griffin.opsDecision).toBe('auto');
    expect(griffin.reasons.some((x) => /Fallback: global SAFE pair/i.test(x))).toBe(true);
  });

  it('Hue97: note A5AC match autos; without note/history prefers A5AC logic', () => {
    const viaNote = evaluateAutoApprove({
      locationName: 'Hue97 B301',
      skus: ['A5AC4036', '36HXS05'],
      customerNoteSkus: ['A5AC4030', '30HXS05', 'A5AC4036', '36HXS05'],
    });
    expect(viaNote.opsDecision).toBe('auto');
    expect(viaNote.matchedRule).toBe('customer-note-match');
    expect(viaNote.warehouseHint).toBe('special-order');

    const preferred = evaluateAutoApprove({
      locationName: 'Hue97 B301',
      skus: ['A5AC4036', '36HXS05'],
    });
    expect(preferred.opsDecision).toBe('auto');
    expect(preferred.matchedRule).toBe('hue97-preferred');

    const bad = evaluateAutoApprove({
      locationName: 'Hue97',
      skus: ['GLXS4BA2410A', '24HXS05'],
    });
    expect(bad.opsDecision).toBe('escalate');
    expect(bad.matchedRule).toBe('hue97-escalate');
  });

  it('hard escalates Indigo / GLZS / HP Closet when no note/history', () => {
    const r = evaluateAutoApprove({
      locationName: 'Indigo',
      skus: ['GLZS4BA3610A', 'A4AH4P36'],
      installType: 'HP Closet',
    });
    expect(r.opsDecision).toBe('escalate');
    expect(r.matchedRule).toBe('indigo-hp-closet');
  });

  it('escalates tonnage mismatch on fallback path', () => {
    const mismatch = evaluateAutoApprove({
      locationName: 'Montero at Dana Park',
      skus: ['GLXS4BA2410A', '24HXS05'],
      tonnage: 3,
    });
    expect(mismatch.opsDecision).toBe('escalate');
    expect(mismatch.matchedRule).toMatch(/tonnage-mismatch/);
  });

  it('escalates unknown SKUs on fallback path', () => {
    const unknown = evaluateAutoApprove({
      locationName: 'Somewhere',
      skus: ['WEIRD123', 'OTHER999'],
    });
    expect(unknown.opsDecision).toBe('escalate');
    expect(unknown.matchedRule).toBe('unknown-skus');
  });

  it('legacy SAFE 2.5T and 3T still auto via fallback', () => {
    const a = evaluateAutoApprove({
      locationName: 'Some Complex',
      skus: ['GLXS4BA3010A', '30HXS05'],
      tonnage: 2.5,
    });
    expect(a.opsDecision).toBe('auto');
    expect(a.reasons.some((x) => /Fallback: global SAFE pair/i.test(x))).toBe(true);

    const b = evaluateAutoApprove({
      locationName: 'Another Place',
      skus: ['GLXS4BA3610A', '36HX5'],
      tonnage: 3,
    });
    expect(b.opsDecision).toBe('auto');
  });
});
