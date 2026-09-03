/**
 * Slack stub — dry-run logs when SLACK_BOT_TOKEN is unset.
 */

export interface SlackPostArgs {
  channel?: string;
  text: string;
  threadTs?: string;
}

export async function postSlackMessage(args: SlackPostArgs): Promise<{
  ok: boolean;
  ts?: string;
  dryRun: boolean;
}> {
  const token = process.env.SLACK_BOT_TOKEN;
  const channel =
    args.channel || process.env.SLACK_D2D_CHANNEL_ID || 'C023D32SLLR';

  if (!token) {
    const fakeTs = `${Date.now() / 1000}.dryrun`;
    console.log('[slack:dry-run]', { channel, text: args.text, threadTs: args.threadTs, ts: fakeTs });
    return { ok: true, ts: fakeTs, dryRun: true };
  }

  // Live path stub (no real call shapes beyond fetch) — still guarded
  try {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        channel,
        text: args.text,
        thread_ts: args.threadTs,
      }),
    });
    const json = (await res.json()) as { ok: boolean; ts?: string; error?: string };
    if (!json.ok) {
      console.error('[slack] error', json.error);
      return { ok: false, dryRun: false };
    }
    return { ok: true, ts: json.ts, dryRun: false };
  } catch (err) {
    console.error('[slack] fetch failed', err);
    return { ok: false, dryRun: false };
  }
}

export function formatSoldSlackParent(input: {
  estimateId: string;
  locationName: string;
  jobNumber?: string | null;
  skus: string[];
  total?: number | null;
  statusOps: string;
  statusWarehouse: string;
  statusReq: string;
  reasons: string[];
}): string {
  const lines = [
    `*SOLD* Est #${input.estimateId} — ${input.locationName}`,
    `Job: ${input.jobNumber || 'N/A'} | Total: ${input.total != null ? `$${input.total}` : 'n/a'}`,
    `Equipment: ${input.skus.join(' | ') || 'none'}`,
    `Ops: ${input.statusOps} | Warehouse: ${input.statusWarehouse} | Req: ${input.statusReq}`,
    ...input.reasons.map((r) => `• ${r}`),
  ];
  return lines.join('\n');
}
