'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { StatusPill } from '@/components/StatusPill';
import { decideSold, getSoldById, type SoldRow } from '@/lib/demo/store';

function stepState(current: string, doneValues: string[], activeValues: string[]) {
  if (doneValues.includes(current)) return 'done' as const;
  if (activeValues.includes(current)) return 'current' as const;
  return 'todo' as const;
}

function PipelineStepper({ row }: { row: SoldRow }) {
  const ops = stepState(
    row.statusOps,
    ['auto', 'approved'],
    ['escalate', 'pending'],
  );
  const wh = stepState(
    row.statusWarehouse,
    ['ready', 'auto', 'done'],
    ['pending', 'not_ready'],
  );
  // Treat req as current only after ops cleared and warehouse not still pending-only gate
  const opsDone = ops === 'done';
  const req =
    row.statusReq === 'done' || row.statusReq === 'approved'
      ? ('done' as const)
      : opsDone
        ? ('current' as const)
        : ('todo' as const);

  // Clarify warehouse current: if ops not done, warehouse is todo
  const whFinal = !opsDone ? ('todo' as const) : wh === 'todo' ? ('current' as const) : wh;

  const steps = [
    { key: 'Ops', state: ops === 'todo' && row.statusOps === 'escalate' ? ('current' as const) : ops },
    { key: 'Warehouse', state: whFinal },
    { key: 'Requisition', state: req },
  ];

  // Ensure exactly one current when escalate
  const hasCurrent = steps.some((s) => s.state === 'current');
  if (!hasCurrent) {
    const firstTodo = steps.find((s) => s.state === 'todo');
    if (firstTodo) firstTodo.state = 'current';
  }

  return (
    <ol className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
      {steps.map((s, i) => (
        <li key={s.key} className="flex flex-1 items-center gap-1">
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                s.state === 'done'
                  ? 'bg-emerald-600 text-white'
                  : s.state === 'current'
                    ? 'bg-amber-500 text-zinc-950 ring-2 ring-amber-300/40'
                    : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {s.state === 'done' ? '✓' : i + 1}
            </span>
            <span
              className={`truncate text-[11px] font-medium ${
                s.state === 'current' ? 'text-amber-200' : s.state === 'done' ? 'text-emerald-300' : 'text-zinc-500'
              }`}
            >
              {s.key}
            </span>
          </div>
          {i < steps.length - 1 ? (
            <div
              className={`mb-4 h-0.5 w-4 shrink-0 sm:w-8 ${
                s.state === 'done' ? 'bg-emerald-700' : 'bg-zinc-800'
              }`}
              aria-hidden
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function isAutoReason(reason: string, statusOps: string) {
  const r = reason.toLowerCase();
  if (
    r.includes('escalate') ||
    r.includes('mismatch') ||
    r.includes('unknown') ||
    r.includes('not in') ||
    r.includes('conflicts with') ||
    r.includes('not seen in property')
  ) {
    return false;
  }
  if (
    r.includes('customer note match') ||
    r.includes('property install history match') ||
    r.includes('fallback: global safe pair') ||
    r.includes('safe') ||
    r.includes('canonical') ||
    r.includes('override') ||
    r.includes('auto')
  ) {
    return true;
  }
  return statusOps === 'auto' || statusOps === 'approved';
}

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

  const opsCleared = useMemo(
    () => row != null && (row.statusOps === 'auto' || row.statusOps === 'approved'),
    [row],
  );

  const showOpsActions =
    row != null && (row.statusOps === 'escalate' || row.statusOps === 'pending');

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

  const autoReasons = row.decisionReasons.filter((r) => isAutoReason(r, row.statusOps));
  const escalateReasons = row.decisionReasons.filter((r) => !isAutoReason(r, row.statusOps));

  return (
    <div className="space-y-5 pb-4">
      <Link href="/sold" className="tap-target inline-flex items-center text-sm text-zinc-400 hover:text-white">
        ← Back to queue
      </Link>

      <PipelineStepper row={row} />

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h1 className="text-2xl font-semibold">{row.locationName}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Est #{row.estimateId} · Job {row.jobNumber || 'N/A'} · {row.installType || 'type n/a'}
          {row.tonnage ? ` · ${row.tonnage}T` : ''}
          {row.total != null ? ` · $${row.total}` : ''}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {row.skus.map((sku) => (
            <span
              key={sku}
              className="rounded-md border border-zinc-700 bg-zinc-950/80 px-2 py-1 text-xs text-zinc-200"
            >
              {sku}
            </span>
          ))}
        </div>
        {row.serviceDescription ? (
          <p className="mt-3 text-sm text-zinc-400">{row.serviceDescription}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusPill label="Ops" value={row.statusOps} />
          <StatusPill label="WH" value={row.statusWarehouse} />
          <StatusPill label="Req" value={row.statusReq} />
          {row.warehouseHint ? <StatusPill label="Hint" value={row.warehouseHint} /> : null}
          {row.a2lFlag ? <StatusPill value="A2L sensor" /> : null}
        </div>
      </div>

      {(row.customerNote || (row.customerNoteSkus && row.customerNoteSkus.length > 0)) ? (
        <div className="rounded-xl border border-sky-900/50 bg-sky-950/20 p-4">
          <h2 className="text-sm font-medium text-sky-300">Customer note</h2>
          {row.customerNote ? (
            <blockquote className="mt-2 border-l-2 border-sky-700/60 pl-3 text-sm italic text-zinc-300">
              {row.customerNote}
            </blockquote>
          ) : null}
          {row.customerNoteSkus && row.customerNoteSkus.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {row.customerNoteSkus.map((sku) => (
                <span
                  key={sku}
                  className="rounded-md border border-sky-800/60 bg-zinc-950/80 px-2 py-1 font-mono text-xs text-sky-100"
                >
                  {sku}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {(row.historySummary || (row.historySets && row.historySets.length > 0)) ? (
        <div className="rounded-xl border border-violet-900/50 bg-violet-950/20 p-4">
          <h2 className="text-sm font-medium text-violet-300">Property history</h2>
          {row.historySummary ? (
            <p className="mt-2 text-sm text-zinc-300">{row.historySummary}</p>
          ) : null}
          {row.historySets && row.historySets.length > 0 ? (
            <div className="mt-3 space-y-2">
              {row.historySets.map((set, i) => (
                <div key={i} className="flex flex-wrap gap-1.5">
                  {set.map((sku) => (
                    <span
                      key={`${i}-${sku}`}
                      className="rounded-md border border-violet-800/60 bg-zinc-950/80 px-2 py-1 font-mono text-xs text-violet-100"
                    >
                      {sku}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-3">
        {autoReasons.length > 0 ? (
          <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-4">
            <h2 className="text-sm font-medium text-emerald-300">Why auto</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-emerald-100/90">
              {autoReasons.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {escalateReasons.length > 0 ? (
          <div className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-4">
            <h2 className="text-sm font-medium text-amber-300">Why escalate</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-amber-100/90">
              {escalateReasons.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {opsCleared ? (
        <div className="flex flex-wrap gap-2">
          <button
            disabled={busy}
            onClick={() => decide('ready')}
            className="tap-target rounded-xl border border-emerald-700 bg-emerald-950/40 px-4 text-sm font-medium text-emerald-200 hover:bg-emerald-900/50 disabled:opacity-50"
          >
            Warehouse Ready
          </button>
          <button
            disabled={busy}
            onClick={() => decide('not_ready')}
            className="tap-target rounded-xl border border-zinc-700 px-4 text-sm hover:bg-zinc-800 disabled:opacity-50"
          >
            Not Ready
          </button>
        </div>
      ) : null}

      {showOpsActions ? (
        <div className="sticky-actions flex gap-2">
          <button
            disabled={busy}
            onClick={() => decide('approve')}
            className="tap-target flex-1 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            disabled={busy}
            onClick={() => decide('decline')}
            className="tap-target flex-1 rounded-xl bg-rose-800 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            Decline
          </button>
        </div>
      ) : null}
    </div>
  );
}
