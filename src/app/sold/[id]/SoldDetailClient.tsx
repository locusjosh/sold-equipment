'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StatusPill } from '@/components/StatusPill';
import { decideSold, getSoldById, type SoldRow } from '@/lib/demo/store';

export function SoldDetailClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [row, setRow] = useState<SoldRow | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    setRow(getSoldById(params.id));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  function decide(action: string) {
    setBusy(true);
    decideSold(params.id, action);
    load();
    setBusy(false);
    if (action === 'approve') router.push('/warehouse');
  }

  if (!row) {
    return <p className="text-sm text-zinc-500">Loading or not found…</p>;
  }

  return (
    <div className="space-y-6">
      <Link href="/sold" className="text-sm text-zinc-400 hover:text-white">
        ← Back to queue
      </Link>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h1 className="text-2xl font-semibold">{row.locationName}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Est #{row.estimateId} · Job {row.jobNumber || 'N/A'} ·{' '}
          {row.installType || 'type n/a'}
          {row.tonnage ? ` · ${row.tonnage}T` : ''}
          {row.total != null ? ` · $${row.total}` : ''}
        </p>
        <p className="mt-2 font-mono text-sm">{row.skus.join(' + ')}</p>
        {row.serviceDescription ? (
          <p className="mt-2 text-sm text-zinc-400">{row.serviceDescription}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusPill label="Ops" value={row.statusOps} />
          <StatusPill label="WH" value={row.statusWarehouse} />
          <StatusPill label="Req" value={row.statusReq} />
          {row.warehouseHint ? <StatusPill label="Hint" value={row.warehouseHint} /> : null}
          {row.a2lFlag ? <StatusPill value="A2L sensor" /> : null}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 p-4">
        <h2 className="font-medium">Decision reasons</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">
          {row.decisionReasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          disabled={busy}
          onClick={() => decide('approve')}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium hover:bg-emerald-600 disabled:opacity-50"
        >
          Approve (ops)
        </button>
        <button
          disabled={busy}
          onClick={() => decide('decline')}
          className="rounded-lg bg-rose-800 px-4 py-2 text-sm font-medium hover:bg-rose-700 disabled:opacity-50"
        >
          Decline
        </button>
        <button
          disabled={busy}
          onClick={() => decide('ready')}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
        >
          Warehouse Ready
        </button>
        <button
          disabled={busy}
          onClick={() => decide('not_ready')}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
        >
          Not Ready
        </button>
      </div>
      {row.slackTs ? (
        <p className="text-xs text-zinc-500">Slack ts (dry-run ok): {row.slackTs}</p>
      ) : null}
    </div>
  );
}
