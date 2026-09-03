'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { StatusPill } from '@/components/StatusPill';

type Sold = {
  id: string;
  estimateId: string;
  locationName: string;
  jobNumber: string | null;
  skus: string[];
  total: number | null;
  statusOps: string;
  statusWarehouse: string;
  statusReq: string;
  a2lFlag: boolean;
  createdAt: string;
};

export default function SoldQueuePage() {
  const [rows, setRows] = useState<Sold[]>([]);
  const [statusOps, setStatusOps] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  async function load(nextQ = q, nextStatus = statusOps) {
    setLoading(true);
    const params = new URLSearchParams();
    if (nextQ) params.set('q', nextQ);
    if (nextStatus) params.set('statusOps', nextStatus);
    const res = await fetch(`/api/sold?${params}`);
    const data = await res.json();
    setRows(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sold queue</h1>
          <p className="text-sm text-zinc-400">Ops accuracy gate — auto vs escalate</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search location / estimate"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
          />
          <select
            value={statusOps}
            onChange={(e) => setStatusOps(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="auto">auto</option>
            <option value="escalate">escalate</option>
            <option value="approved">approved</option>
            <option value="declined">declined</option>
            <option value="pending">pending</option>
          </select>
          <button
            onClick={() => load()}
            className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium hover:bg-emerald-600"
          >
            Filter
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No rows. <a className="text-emerald-400 underline" href="/api/demo/seed">Seed demo data</a>
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/sold/${r.id}`}
                className="block rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-zinc-600"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{r.locationName}</div>
                    <div className="mt-1 text-xs text-zinc-400">
                      Est #{r.estimateId} · Job {r.jobNumber || 'N/A'}
                      {r.total != null ? ` · $${r.total}` : ''}
                      {r.a2lFlag ? ' · A2L flag' : ''}
                    </div>
                    <div className="mt-2 font-mono text-xs text-zinc-300">{r.skus.join(' + ')}</div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <StatusPill label="Ops" value={r.statusOps} />
                    <StatusPill label="WH" value={r.statusWarehouse} />
                    <StatusPill label="Req" value={r.statusReq} />
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
