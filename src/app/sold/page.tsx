'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { StatusPill } from '@/components/StatusPill';
import { getSoldRows, type SoldRow } from '@/lib/demo/store';

type Chip = 'all' | 'auto' | 'escalate' | 'approved';

const CHIPS: { id: Chip; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'auto', label: 'Auto' },
  { id: 'escalate', label: 'Needs review' },
  { id: 'approved', label: 'Approved' },
];

function railClass(statusOps: string) {
  if (statusOps === 'auto' || statusOps === 'approved') return 'bg-emerald-500';
  if (statusOps === 'escalate') return 'bg-amber-500';
  if (statusOps === 'declined') return 'bg-rose-500';
  return 'bg-zinc-600';
}

function readChipFromUrl(): Chip {
  if (typeof window === 'undefined') return 'all';
  const v = new URLSearchParams(window.location.search).get('chip');
  if (v === 'auto' || v === 'escalate' || v === 'approved') return v;
  return 'all';
}

export default function SoldQueuePage() {
  const [rows, setRows] = useState<SoldRow[]>([]);
  const [chip, setChip] = useState<Chip>('all');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setChip(readChipFromUrl());
    setRows(getSoldRows());
    setLoading(false);
  }, []);

  const filtered = useMemo(() => {
    let list = rows;
    if (chip !== 'all') {
      list = list.filter((r) => r.statusOps === chip);
    }
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.locationName.toLowerCase().includes(needle) ||
          r.estimateId.toLowerCase().includes(needle) ||
          r.skus.some((s) => s.toLowerCase().includes(needle)),
      );
    }
    return list;
  }, [rows, chip, q]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Sold queue</h1>
        <p className="text-sm text-zinc-400">Ops accuracy gate</p>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search location / estimate / SKU"
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm"
        autoComplete="off"
      />

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CHIPS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setChip(c.id)}
            className={`tap-target shrink-0 rounded-full px-4 text-sm font-medium ${
              chip === c.id
                ? 'bg-emerald-700 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">No rows match filters.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => (
            <li key={r.id}>
              <Link
                href={`/sold/${r.id}`}
                className="tap-target relative flex overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-600"
              >
                <span className={`w-1.5 shrink-0 ${railClass(r.statusOps)}`} aria-hidden />
                <div className="flex flex-1 flex-wrap items-start justify-between gap-2 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{r.locationName}</div>
                    <div className="mt-1 text-xs text-zinc-400">
                      Est #{r.estimateId} · Job {r.jobNumber || 'N/A'}
                      {r.total != null ? ` · $${r.total}` : ''}
                      {r.a2lFlag ? ' · A2L' : ''}
                    </div>
                    {r.decisionReasons[0] ? (
                      <p className="mt-2 text-sm text-zinc-300 line-clamp-2">{r.decisionReasons[0]}</p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.skus.map((sku) => (
                        <span
                          key={sku}
                          className="rounded-md border border-zinc-700 bg-zinc-950/80 px-2 py-0.5 text-[11px] text-zinc-200"
                        >
                          {sku}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <StatusPill label="Ops" value={r.statusOps} />
                    <StatusPill label="WH" value={r.statusWarehouse} />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
