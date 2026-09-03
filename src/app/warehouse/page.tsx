'use client';

import { useEffect, useState } from 'react';
import { StatusPill } from '@/components/StatusPill';
import {
  clearLoaded,
  getInstallRows,
  markLoaded,
  updateInstall,
  type InstallRow,
} from '@/lib/demo/store';

export default function WarehousePage() {
  const [rows, setRows] = useState<InstallRow[]>([]);
  const [filter, setFilter] = useState('all');
  const [status, setStatus] = useState('');

  function load(f = filter, s = status) {
    setRows(
      getInstallRows({
        filter: f && f !== 'all' ? f : undefined,
        status: s || undefined,
      }),
    );
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Warehouse board</h1>
          <p className="text-sm text-zinc-400">Installs ready to stage / load (static seed)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['today', 'upcoming', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                load(f, status);
              }}
              className={`rounded-full px-3 py-1 text-sm capitalize ${
                filter === f ? 'bg-emerald-700 text-white' : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              {f}
            </button>
          ))}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              load(filter, e.target.value);
            }}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm"
          >
            <option value="">All pills</option>
            <option value="Pending">Pending</option>
            <option value="Ready">Ready</option>
            <option value="NotReady">NotReady</option>
          </select>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-zinc-500">No installs for this filter.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{r.customer}</div>
                  <div className="mt-1 font-mono text-xs text-zinc-300">{r.equipment}</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    Est {r.estimateId || '—'}
                    {r.scheduledDate
                      ? ` · sched ${new Date(r.scheduledDate).toLocaleDateString()}`
                      : ''}
                    {r.loadedAt ? ` · loaded ${new Date(r.loadedAt).toLocaleString()}` : ''}
                    {r.assignedTechs?.length ? ` · ${r.assignedTechs.join(', ')}` : ''}
                  </div>
                </div>
                <StatusPill value={r.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    updateInstall(r.id, { status: 'Ready' });
                    load();
                  }}
                  className="rounded-md bg-emerald-800/80 px-3 py-1 text-xs hover:bg-emerald-700"
                >
                  Ready
                </button>
                <button
                  onClick={() => {
                    updateInstall(r.id, { status: 'NotReady' });
                    load();
                  }}
                  className="rounded-md bg-rose-900/70 px-3 py-1 text-xs hover:bg-rose-800"
                >
                  NotReady
                </button>
                <button
                  onClick={() => {
                    updateInstall(r.id, { status: 'Pending' });
                    load();
                  }}
                  className="rounded-md bg-zinc-800 px-3 py-1 text-xs hover:bg-zinc-700"
                >
                  Pending
                </button>
                {r.loadedAt ? (
                  <button
                    onClick={() => {
                      clearLoaded(r.id);
                      load();
                    }}
                    className="rounded-md border border-zinc-700 px-3 py-1 text-xs"
                  >
                    Clear loaded
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      markLoaded(r.id);
                      load();
                    }}
                    className="rounded-md border border-emerald-700 px-3 py-1 text-xs text-emerald-300"
                  >
                    Mark loaded
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
