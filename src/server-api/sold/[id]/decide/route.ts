import { NextRequest, NextResponse } from 'next/server';
import { applyManualDecision } from '@/lib/soldService';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.json();
  const action = body.action as 'approve' | 'decline' | 'ready' | 'not_ready';
  if (!['approve', 'decline', 'ready', 'not_ready'].includes(action)) {
    return NextResponse.json({ error: 'invalid action' }, { status: 400 });
  }
  const result = await applyManualDecision(id, action);
  if (!result) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(result);
}
