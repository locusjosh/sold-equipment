import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ingestSoldEstimate, parseSkus, serializeSold } from '@/lib/soldService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusOps = searchParams.get('statusOps');
  const q = searchParams.get('q');

  const rows = await prisma.soldEstimate.findMany({
    orderBy: { createdAt: 'desc' },
    where: {
      ...(statusOps ? { statusOps } : {}),
      ...(q
        ? {
            OR: [
              { locationName: { contains: q } },
              { estimateId: { contains: q } },
              { jobNumber: { contains: q } },
            ],
          }
        : {}),
    },
  });

  return NextResponse.json(rows.map(serializeSold));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await ingestSoldEstimate({
    estimateId: String(body.estimateId),
    locationName: String(body.locationName || 'Unknown'),
    jobNumber: body.jobNumber,
    skus: parseSkus(body.skus),
    serviceDescription: body.serviceDescription,
    installType: body.installType,
    tonnage: body.tonnage,
    total: body.total != null ? Number(body.total) : null,
  });
  return NextResponse.json(result, { status: 201 });
}
