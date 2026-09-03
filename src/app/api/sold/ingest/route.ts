import { NextRequest, NextResponse } from 'next/server';
import { ingestSoldEstimate, parseSkus } from '@/lib/soldService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.estimateId) {
    return NextResponse.json({ error: 'estimateId required' }, { status: 400 });
  }
  const result = await ingestSoldEstimate({
    estimateId: String(body.estimateId),
    locationName: String(body.locationName || body.customer || 'Unknown'),
    jobNumber: body.jobNumber ?? body.job ?? null,
    skus: parseSkus(body.skus ?? body.equipment),
    serviceDescription: body.serviceDescription ?? body.lineItem ?? null,
    installType: body.installType ?? null,
    tonnage: body.tonnage ?? null,
    total: body.total != null ? Number(body.total) : body.price != null ? Number(body.price) : null,
  });
  return NextResponse.json(result, { status: 201 });
}
