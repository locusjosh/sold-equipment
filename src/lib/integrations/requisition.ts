/**
 * Requisition stub — creates ST requisition only when both gates green.
 */

export interface RequisitionInput {
  estimateId: string;
  skus: string[];
  jobNumber?: string | null;
}

export async function createRequisition(input: RequisitionInput): Promise<{
  ok: boolean;
  dryRun: boolean;
  requisitionId?: string;
}> {
  const stReady = Boolean(
    process.env.ST_TENANT_ID &&
      process.env.ST_CLIENT_ID &&
      process.env.ST_CLIENT_SECRET &&
      process.env.ST_APP_KEY
  );

  if (!stReady) {
    const id = `dry-req-${input.estimateId}`;
    console.log('[requisition:dry-run]', { ...input, requisitionId: id });
    return { ok: true, dryRun: true, requisitionId: id };
  }

  console.log('[requisition] live stub', input);
  return { ok: true, dryRun: false, requisitionId: `req-${input.estimateId}` };
}
