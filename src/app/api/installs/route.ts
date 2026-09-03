import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { broadcast } from '@/lib/events';

export const dynamic = 'force-dynamic';

function serialize(row: {
  assignedTechs: string | null;
  [k: string]: unknown;
}) {
  let techs: string[] = [];
  if (row.assignedTechs) {
    try {
      techs = JSON.parse(row.assignedTechs);
    } catch {
      techs = [];
    }
  }
  return { ...row, assignedTechs: techs };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const filter = searchParams.get('filter');

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const rows = await prisma.install.findMany({
    orderBy: [{ scheduledDate: 'asc' }, { dateApproved: 'desc' }],
    where: {
      ...(status ? { status } : {}),
      ...(filter === 'today'
        ? {
            OR: [
              { scheduledDate: { gte: start, lt: end } },
              { scheduledDate: null, dateApproved: { gte: start, lt: end } },
            ],
          }
        : filter === 'upcoming'
          ? { scheduledDate: { gte: end } }
          : {}),
    },
  });

  return NextResponse.json(rows.map(serialize));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = Array.isArray(body) ? body : [body];
  const created = [];
  for (const item of items) {
    const row = await prisma.install.create({
      data: {
        estimateId: item.estimateID || item.estimateId || null,
        equipment: String(item.equipment || ''),
        customer: String(item.customer || ''),
        status: item.status || 'Pending',
        dateApproved: item.dateApproved ? new Date(item.dateApproved) : new Date(),
        installJobNumber: item.installJobNumber || null,
        scheduledDate: item.scheduledDate ? new Date(item.scheduledDate) : null,
        assignedTechs: JSON.stringify(item.assignedTechs || []),
      },
    });
    created.push(serialize(row));
  }
  broadcast('install', { count: created.length });
  return NextResponse.json(created.length === 1 ? created[0] : created, { status: 201 });
}
