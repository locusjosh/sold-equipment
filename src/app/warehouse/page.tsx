'use client';

import { useEffect, useMemo, useState } from 'react';
import { StatusPill } from '@/components/StatusPill';
import {
  clearLoaded,
  getInstallRows,
  getSoldRows,
  markLoaded,
  updateInstall,
  type InstallRow,
} from '@/lib/demo/store';

type StatusChip = '' | 'Pending' | 'Ready' | 'Loaded';
type TonnageChip = 'all' | string;

function tonnageForInstall(r: InstallRow, tonnageByEst: Map<string, string | null>) {
  if (r.estimateId && tonnageByEst.has(r.estimateId)) {
    return tonnageByEst.get(r.estimateId) || null;
  }
  // Heuristic from equipment SKUs (24→2T, 30→2.5T, 36→3T)
  const eq = r.equipment.toUpperCase();
  if (/\b36|A5AC4036|GLXS4BA36|GLZS4BA36/.test(eq)) return '3';
  if (/\b30|A5AC4030|GLXS4BA30/.test(eq)) return '2.5';
  if (/\b24|A5AC4024|GLXS4BA24|24HXS/.test(eq)) return '2';
  return null;
}

function readStatusFromUrl(): StatusChip {
  if (typeof window === 'undefined') return '';
  const v = new URLSearchParams(window.location.search).get('status');
  if (v === 'Pending' || v === 'Ready' || v === 'Loaded') return v;
  return '';
}

export default function WarehousePage() {
  const [rows, setRows] = useState<InstallRow[]>([]);
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'all'>('all');
  const [statusChip, setStatusChip] = useState<StatusChip>('');
  const [tonnageChip, setTonnageChip] = useState<TonnageChip>('all');
  const [tonnageByEst, setTonnageByEst] = useState<Map<string, string | null>>(new Map());

  function load(f: typeof filter = filter) {
    setRows(
      getInstallRows({
        filter: f && f !== 'all' ? f : undefined,
      }),
    );
    const map = new Map<string, string | null>();
    for (const s of getSoldRows()) {
      map.set(s.estimateId, s.tonnage);
    }
    setTonnageByEst(map);
  }

  useEffect(() => {
    setStatusChip(readStatusFromUrl());
    load('all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tonnageOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      const t = tonnageForInstall(r, tonnageByEst);
      if (t) set.add(t);
    }
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [rows, tonnageByEst]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusChip === 'Loaded' && !r.loadedAt) return false;
      if (statusChip === 'Ready' && r.status !== 'Ready') return false;
      if (statusChip === 'Pending' && r.status !== 'Pending') return false;
      if (tonnageChip !== 'all') {
        const t = tonnageForInstall(r, tonnageByEst);
        if (t !== tonnageChip) return false;
      }
      return true;
    });
  }, [rows, statusChip, tonnageChip, tonnageByEst]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Warehouse</h1>
        <p className="text-sm text-zinc-400">Stage · load · ready</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(['today', 'upcoming', 'all'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setFilter(f);
              load(f);
            }}
            className={`tap-target shrink-0 rounded-full px-4 text-sm capitalize ${
              filter === f ? 'bg-emerald-700 text-white' : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(
          [
            { id: '' as StatusChip, label: 'All status' },
            { id: 'Pending' as StatusChip, label: 'Pending' },
            { id: 'Ready' as StatusChip, label: 'Ready' },
            { id: 'Loaded' as StatusChip, label: 'Loaded' },
          ] as const
        ).map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => setStatusChip(c.id)}
            className={`tap-target shrink-0 rounded-full px-4 text-sm ${
              statusChip === c.id ? 'bg-sky-800 text-white' : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {tonnageOptions.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setTonnageChip('all')}
            className={`tap-target shrink-0 rounded-full px-4 text-sm ${
              tonnageChip === 'all' ? 'bg-zinc-600 text-white' : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            All tons
          </button>
          {tonnageOptions.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTonnageChip(t)}
              className={`tap-target shrink-0 rounded-full px-4 text-sm ${
                tonnageChip === t ? 'bg-zinc-600 text-white' : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              {t}T
            </button>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">No installs for this filter.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => {
            const tons = tonnageForInstall(r, tonnageByEst);
            const isLoaded = !!r.loadedAt;
            const isReady = r.status === 'Ready';
            return (
              <li
                key={r.id}
                className={`rounded-xl border p-4 ${
                  isLoaded
                    ? 'border-sky-800/70 bg-sky-950/20'
                    : isReady
                      ? 'border-emerald-800/60 bg-emerald-950/15'
                      : 'border-zinc-800 bg-zinc-900/60'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{r.customer}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.equipment.split(/\s*\+\s*/).map((sku) => (
                        <span
                          key={sku}
                          className="rounded-md border border-zinc-700 bg-zinc-950/80 px-2 py-0.5 text-[11px] text-zinc-200"
                        >
                          {sku}
                        </span>
                      ))}
                      {tons ? (
                        <span className="rounded-md border border-zinc-600 bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-200">
                          {tons}T
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">
                      Est {r.estimateId || '—'}
                      {r.scheduledDate
                        ? ` · sched ${new Date(r.scheduledDate).toLocaleDateString()}`
                        : ''}
                      {r.assignedTechs?.length ? ` · ${r.assignedTechs.join(', ')}` : ''}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusPill value={r.status} />
                    {isLoaded ? (
                      <span className="rounded-full border border-sky-700 bg-sky-900/50 px-2 py-0.5 text-[11px] font-medium text-sky-200">
                        Loaded
                      </span>
                    ) : isReady ? (
                      <span className="rounded-full border border-emerald-700 bg-emerald-900/40 px-2 py-0.5 text-[11px] font-medium text-emerald-200">
                        Ready to load
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateInstall(r.id, { status: 'Ready' });
                      load();
                    }}
                    className="tap-target rounded-xl bg-emerald-800/80 px-4 text-sm font-medium hover:bg-emerald-700"
                  >
                    Ready
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateInstall(r.id, { status: 'NotReady' });
                      load();
                    }}
                    className="tap-target rounded-xl bg-rose-900/70 px-4 text-sm hover:bg-rose-800"
                  >
                    NotReady
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateInstall(r.id, { status: 'Pending' });
                      load();
                    }}
                    className="tap-target rounded-xl bg-zinc-800 px-4 text-sm hover:bg-zinc-700"
                  >
                    Pending
                  </button>
                </div>

                <div className="mt-2">
                  {isLoaded ? (
                    <button
                      type="button"
                      onClick={() => {
                        clearLoaded(r.id);
                        load();
                      }}
                      className="tap-target w-full rounded-xl border border-zinc-600 px-4 text-sm text-zinc-300"
                    >
                      Clear loaded
                      {r.loadedAt
                        ? ` · ${new Date(r.loadedAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}`
                        : ''}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        markLoaded(r.id);
                        load();
                      }}
                      className="tap-target w-full rounded-xl border-2 border-emerald-600 bg-emerald-950/50 px-4 text-base font-semibold text-emerald-200 hover:bg-emerald-900/60"
                    >
                      Mark Loaded
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
