import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { broadcast } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.status != null) data.status = body.status;
  if (body.equipment != null) data.equipment = body.equipment;
  if (body.customer != null) data.customer = body.customer;
  if (body.installJobNumber != null) data.installJobNumber = body.installJobNumber;
  if (body.scheduledDate != null) data.scheduledDate = new Date(body.scheduledDate);
  if (body.assignedTechs != null) data.assignedTechs = JSON.stringify(body.assignedTechs);
  if (body.loadedAt !== undefined) data.loadedAt = body.loadedAt ? new Date(body.loadedAt) : null;

  const row = await prisma.install.update({ where: { id }, data });
  broadcast('install', { id });
  return NextResponse.json(row);
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  await prisma.install.delete({ where: { id } });
  broadcast('install', { id, deleted: true });
  return NextResponse.json({ ok: true });
}
