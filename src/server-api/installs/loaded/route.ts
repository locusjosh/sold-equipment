import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { broadcast } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body.id;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const row = await prisma.install.update({
    where: { id },
    data: { loadedAt: new Date(), status: body.status || 'Ready' },
  });
  broadcast('install', { id, loaded: true });
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const id = body.id;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const row = await prisma.install.update({
    where: { id },
    data: { loadedAt: null },
  });
  broadcast('install', { id, loaded: false });
  return NextResponse.json(row);
}
