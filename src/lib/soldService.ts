import { prisma } from '@/lib/db';
import { evaluateAutoApprove } from '@/lib/rules/autoApprove';
import { formatSoldSlackParent, postSlackMessage } from '@/lib/integrations/slack';
import { createRequisition } from '@/lib/integrations/requisition';
import { broadcast } from '@/lib/events';

export function parseSkus(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') {
    try {
      const j = JSON.parse(raw);
      if (Array.isArray(j)) return j.map(String);
    } catch {
      return raw.split(/[|+,]/).map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

export function serializeSold(row: {
  id: string;
  estimateId: string;
  locationName: string;
  jobNumber: string | null;
  skus: string;
  serviceDescription: string | null;
  installType: string | null;
  tonnage: string | null;
  total: number | null;
  statusOps: string;
  statusWarehouse: string;
  statusReq: string;
  decisionReasons: string;
  warehouseHint: string | null;
  a2lFlag: boolean;
  slackTs: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...row,
    skus: parseSkus(row.skus),
    decisionReasons: parseSkus(row.decisionReasons),
  };
}

export interface IngestPayload {
  estimateId: string;
  locationName: string;
  jobNumber?: string | null;
  skus: string[];
  serviceDescription?: string | null;
  installType?: string | null;
  tonnage?: string | number | null;
  total?: number | null;
}

export async function ingestSoldEstimate(payload: IngestPayload) {
  const decision = evaluateAutoApprove({
    locationName: payload.locationName,
    jobNumber: payload.jobNumber,
    skus: payload.skus,
    serviceDescription: payload.serviceDescription,
    installType: payload.installType,
    tonnage: payload.tonnage,
  });

  const statusOps = decision.opsDecision === 'auto' ? 'auto' : 'escalate';
  const statusWarehouse =
    decision.opsDecision === 'auto'
      ? decision.warehouseHint === 'special-order' || decision.warehouseHint === 'check'
        ? 'pending'
        : 'auto'
      : 'pending';

  const slackText = formatSoldSlackParent({
    estimateId: payload.estimateId,
    locationName: payload.locationName,
    jobNumber: payload.jobNumber,
    skus: payload.skus,
    total: payload.total,
    statusOps,
    statusWarehouse,
    statusReq: 'pending',
    reasons: decision.reasons,
  });

  const slack = await postSlackMessage({ text: slackText });

  const sold = await prisma.soldEstimate.upsert({
    where: { estimateId: payload.estimateId },
    create: {
      estimateId: payload.estimateId,
      locationName: payload.locationName,
      jobNumber: payload.jobNumber || null,
      skus: JSON.stringify(payload.skus),
      serviceDescription: payload.serviceDescription || null,
      installType: payload.installType || null,
      tonnage: payload.tonnage != null ? String(payload.tonnage) : null,
      total: payload.total ?? null,
      statusOps,
      statusWarehouse,
      statusReq: 'pending',
      decisionReasons: JSON.stringify(decision.reasons),
      warehouseHint: decision.warehouseHint,
      a2lFlag: Boolean(decision.a2lFlag),
      slackTs: slack.ts || null,
    },
    update: {
      locationName: payload.locationName,
      jobNumber: payload.jobNumber || null,
      skus: JSON.stringify(payload.skus),
      serviceDescription: payload.serviceDescription || null,
      installType: payload.installType || null,
      tonnage: payload.tonnage != null ? String(payload.tonnage) : null,
      total: payload.total ?? null,
      statusOps,
      statusWarehouse,
      decisionReasons: JSON.stringify(decision.reasons),
      warehouseHint: decision.warehouseHint,
      a2lFlag: Boolean(decision.a2lFlag),
      slackTs: slack.ts || null,
    },
  });

  let install = null;
  if (statusOps === 'auto') {
    install = await prisma.install.upsert({
      where: { estimateId: payload.estimateId },
      create: {
        estimateId: payload.estimateId,
        soldEstimateId: sold.id,
        equipment: payload.skus.join(' + '),
        customer: payload.locationName,
        status: 'Pending',
        assignedTechs: JSON.stringify([]),
      },
      update: {
        soldEstimateId: sold.id,
        equipment: payload.skus.join(' + '),
        customer: payload.locationName,
      },
    });
  }

  let requisition = null;
  if (statusOps === 'auto' && statusWarehouse === 'auto') {
    requisition = await createRequisition({
      estimateId: payload.estimateId,
      skus: payload.skus,
      jobNumber: payload.jobNumber,
    });
    if (requisition.ok) {
      await prisma.soldEstimate.update({
        where: { id: sold.id },
        data: { statusReq: 'done' },
      });
    }
  }

  broadcast('sold', { estimateId: payload.estimateId, statusOps });
  if (install) broadcast('install', { id: install.id });

  return {
    sold: serializeSold(sold),
    decision,
    slack,
    install,
    requisition,
  };
}

export async function applyManualDecision(
  id: string,
  action: 'approve' | 'decline' | 'ready' | 'not_ready'
) {
  const sold = await prisma.soldEstimate.findUnique({ where: { id } });
  if (!sold) return null;

  const skus = parseSkus(sold.skus);

  if (action === 'approve') {
    const updated = await prisma.soldEstimate.update({
      where: { id },
      data: { statusOps: 'approved' },
    });
    const install = await prisma.install.upsert({
      where: { estimateId: sold.estimateId },
      create: {
        estimateId: sold.estimateId,
        soldEstimateId: sold.id,
        equipment: skus.join(' + '),
        customer: sold.locationName,
        status: 'Pending',
        assignedTechs: JSON.stringify([]),
      },
      update: {
        soldEstimateId: sold.id,
        equipment: skus.join(' + '),
        customer: sold.locationName,
      },
    });
    await postSlackMessage({
      text: `Manual ops approve for Est #${sold.estimateId}`,
      threadTs: sold.slackTs || undefined,
    });
    broadcast('sold', { id });
    return { sold: serializeSold(updated), install };
  }

  if (action === 'decline') {
    const updated = await prisma.soldEstimate.update({
      where: { id },
      data: { statusOps: 'declined' },
    });
    await postSlackMessage({
      text: `Declined Est #${sold.estimateId}. Please make changes and confirm.`,
      threadTs: sold.slackTs || undefined,
    });
    broadcast('sold', { id });
    return { sold: serializeSold(updated) };
  }

  if (action === 'ready') {
    const updated = await prisma.soldEstimate.update({
      where: { id },
      data: { statusWarehouse: 'ready' },
    });
    await prisma.install.updateMany({
      where: { estimateId: sold.estimateId },
      data: { status: 'Ready' },
    });
    if (['auto', 'approved'].includes(sold.statusOps)) {
      await createRequisition({
        estimateId: sold.estimateId,
        skus,
        jobNumber: sold.jobNumber,
      });
      await prisma.soldEstimate.update({
        where: { id },
        data: { statusReq: 'done' },
      });
    }
    broadcast('sold', { id });
    return { sold: serializeSold(updated) };
  }

  if (action === 'not_ready') {
    const updated = await prisma.soldEstimate.update({
      where: { id },
      data: { statusWarehouse: 'not_ready' },
    });
    await prisma.install.updateMany({
      where: { estimateId: sold.estimateId },
      data: { status: 'NotReady' },
    });
    broadcast('sold', { id });
    return { sold: serializeSold(updated) };
  }

  return { sold: serializeSold(sold) };
}
