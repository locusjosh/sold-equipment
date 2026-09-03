/**
 * ServiceTitan stub client — dry-run when credentials unset.
 */

export function stConfigured(): boolean {
  return Boolean(
    process.env.ST_TENANT_ID &&
      process.env.ST_CLIENT_ID &&
      process.env.ST_CLIENT_SECRET &&
      process.env.ST_APP_KEY
  );
}

export async function getInventoryOnHand(skus: string[]): Promise<{
  dryRun: boolean;
  items: { sku: string; onHand: number | null }[];
}> {
  if (!stConfigured()) {
    console.log('[st:dry-run] getInventoryOnHand', skus);
    return {
      dryRun: true,
      items: skus.map((sku) => ({ sku, onHand: null })),
    };
  }
  // Live ST inventory lookup would go here
  console.log('[st] getInventoryOnHand live stub', skus);
  return {
    dryRun: false,
    items: skus.map((sku) => ({ sku, onHand: null })),
  };
}

export async function fetchEstimate(estimateId: string): Promise<{
  dryRun: boolean;
  estimateId: string;
}> {
  if (!stConfigured()) {
    console.log('[st:dry-run] fetchEstimate', estimateId);
    return { dryRun: true, estimateId };
  }
  console.log('[st] fetchEstimate live stub', estimateId);
  return { dryRun: false, estimateId };
}
