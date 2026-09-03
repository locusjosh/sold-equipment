import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { evaluateAutoApprove } from '@/lib/rules/autoApprove';

export const dynamic = 'force-dynamic';

const SEED = [
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

export async function GET() {
  await prisma.install.deleteMany();
  await prisma.soldEstimate.deleteMany();

  for (const row of SEED) {
    const decision = evaluateAutoApprove({
      locationName: row.locationName,
      jobNumber: row.jobNumber,
      skus: row.skus,
      serviceDescription: row.serviceDescription,
      installType: row.installType,
      tonnage: row.tonnage,
    });
    const statusOps = decision.opsDecision === 'auto' ? 'auto' : 'escalate';
    const statusWarehouse =
      decision.opsDecision === 'auto'
        ? decision.warehouseHint === 'special-order'
          ? 'pending'
          : 'auto'
        : 'pending';

    const sold = await prisma.soldEstimate.create({
      data: {
        estimateId: row.estimateId,
        locationName: row.locationName,
        jobNumber: row.jobNumber,
        skus: JSON.stringify(row.skus),
        serviceDescription: row.serviceDescription,
        installType: row.installType,
        tonnage: row.tonnage,
        total: row.total,
        statusOps,
        statusWarehouse,
        statusReq: 'pending',
        decisionReasons: JSON.stringify(decision.reasons),
        warehouseHint: decision.warehouseHint,
        a2lFlag: Boolean(decision.a2lFlag),
        slackTs: `${Date.now() / 1000}.seed`,
      },
    });

    if (statusOps === 'auto') {
      await prisma.install.create({
        data: {
          estimateId: row.estimateId,
          soldEstimateId: sold.id,
          equipment: row.skus.join(' + '),
          customer: row.locationName,
          status: 'Pending',
          assignedTechs: JSON.stringify([]),
        },
      });
    }
  }

  await prisma.install.create({
    data: {
      estimateId: 'WH-STUB-01',
      equipment: 'GLXS4BA2410A + 24HXS05',
      customer: 'Station 21 #1032 (warehouse stub)',
      status: 'Ready',
      scheduledDate: new Date(),
      assignedTechs: JSON.stringify(['Tech A', 'Tech B']),
    },
  });

  return NextResponse.json({ ok: true, sold: SEED.length, message: 'Demo seed applied' });
}
