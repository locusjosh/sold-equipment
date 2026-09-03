import { describe, it, expect } from 'vitest';
import { evaluateAutoApprove } from './autoApprove';

describe('evaluateAutoApprove', () => {
  it('auto-approves SAFE 2T ceiling pair', () => {
    const r = evaluateAutoApprove({
      locationName: 'The Clifford',
      jobNumber: 'N/A',
      skus: ['GLXS4BA2410A', '24HXS05'],
      serviceDescription: '2 Ton SC Ceiling',
      tonnage: 2,
    });
    expect(r.opsDecision).toBe('auto');
    expect(r.matchedRule).toMatch(/canonical-2/);
    expect(r.reasons.some((x) => /N\/A/.test(x))).toBe(true);
  });

  it('auto-approves 2.5T and 3T pairs (36HX5 legacy ok)', () => {
    const a = evaluateAutoApprove({
      locationName: 'Cornerstone Ranch',
      skus: ['GLXS4BA3010A', '30HXS05'],
      tonnage: 2.5,
    });
    expect(a.opsDecision).toBe('auto');

    const b = evaluateAutoApprove({
      locationName: 'Desert Eagle',
      skus: ['GLXS4BA3610A', '36HX5'],
      tonnage: 3,
    });
    expect(b.opsDecision).toBe('auto');
  });

  it('never escalates solely for missing/N/A job', () => {
    const r = evaluateAutoApprove({
      locationName: 'Ovation Tempe',
      jobNumber: '#N/A',
      skus: ['24HXS05', 'GLXS4BA2410A'],
      tonnage: 2,
    });
    expect(r.opsDecision).toBe('auto');
  });

  it('Rise Broadway condenser-only with a2lFlag', () => {
    const r = evaluateAutoApprove({
      locationName: 'Rise Broadway',
      skus: ['GLXS4BA2410A'],
      serviceDescription: 'Condenser Install (SC)',
    });
    expect(r.opsDecision).toBe('auto');
    expect(r.a2lFlag).toBe(true);
    expect(r.matchedRule).toBe('rise-condenser-only');
  });

  it('Park Mesa and Griffin wall overrides', () => {
    const park = evaluateAutoApprove({
      locationName: 'Park Mesa',
      skus: ['A5AC4024', 'FMA5X2400AL'],
    });
    expect(park.opsDecision).toBe('auto');
    expect(park.matchedRule).toBe('park-mesa-wall');

    const griffin = evaluateAutoApprove({
      locationName: 'The Griffin',
      skus: ['GLXS4BA2410A', 'AWST24SU1305'],
    });
    expect(griffin.opsDecision).toBe('auto');
    expect(griffin.matchedRule).toBe('griffin-wall');
  });

  it('escalates Hue97 unless A5AC4030/36 + HXS', () => {
    const bad = evaluateAutoApprove({
      locationName: 'Hue97',
      skus: ['GLXS4BA2410A', '24HXS05'],
    });
    expect(bad.opsDecision).toBe('escalate');
    expect(bad.matchedRule).toBe('hue97-escalate');

    const good = evaluateAutoApprove({
      locationName: 'Hue97 B301',
      skus: ['A5AC4036', '36HXS05'],
    });
    expect(good.opsDecision).toBe('auto');
    expect(good.warehouseHint).toBe('special-order');
  });

  it('escalates Indigo / GLZS / HP Closet', () => {
    const r = evaluateAutoApprove({
      locationName: 'Indigo',
      skus: ['GLZS4BA3610A', 'A4AH4P36'],
      installType: 'HP Closet',
    });
    expect(r.opsDecision).toBe('escalate');
    expect(r.matchedRule).toBe('indigo-hp-closet');
  });

  it('escalates tonnage mismatch and unknown SKUs', () => {
    const mismatch = evaluateAutoApprove({
      locationName: 'Montero at Dana Park',
      skus: ['GLXS4BA2410A', '24HXS05'],
      tonnage: 3,
    });
    expect(mismatch.opsDecision).toBe('escalate');
    expect(mismatch.matchedRule).toMatch(/tonnage-mismatch/);

    const unknown = evaluateAutoApprove({
      locationName: 'Somewhere',
      skus: ['WEIRD123', 'OTHER999'],
    });
    expect(unknown.opsDecision).toBe('escalate');
    expect(unknown.matchedRule).toBe('unknown-skus');
  });
});
