'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSoldRows, getInstallRows, resetDemoData } from '@/lib/demo/store';

type Stats = {
  auto: number;
  escalate: number;
  warehousePending: number;
  ready: number;
};

function loadStats(): Stats {
  const sold = getSoldRows();
  const installs = getInstallRows();
  return {
    auto: sold.filter((r) => r.statusOps === 'auto').length,
    escalate: sold.filter((r) => r.statusOps === 'escalate').length,
    warehousePending: installs.filter((r) => r.status === 'Pending' && !r.loadedAt).length,
    ready: installs.filter((r) => r.status === 'Ready' || !!r.loadedAt).length,
  };
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    auto: 0,
    escalate: 0,
    warehousePending: 0,
    ready: 0,
  });

  useEffect(() => {
    setStats(loadStats());
  }, []);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
        Safe to test — no Slack. Local demo only.
      </div>

      <section className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 sm:p-7">
        <p className="text-xs uppercase tracking-widest text-emerald-400/80">Static demo</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Sold Equipment</h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">
          Auto-approve SAFE pairs, review escalations, stage warehouse installs.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: 'Auto', value: stats.auto, href: '/sold?chip=auto', tone: 'text-emerald-300' },
            {
              label: 'Escalate',
              value: stats.escalate,
              href: '/sold?chip=escalate',
              tone: 'text-amber-300',
            },
            {
              label: 'WH pending',
              value: stats.warehousePending,
              href: '/warehouse?status=Pending',
              tone: 'text-zinc-200',
            },
            {
              label: 'Ready',
              value: stats.ready,
              href: '/warehouse?status=Ready',
              tone: 'text-sky-300',
            },
          ].map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="tap-target rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-3 text-center hover:border-zinc-600"
            >
              <div className={`text-2xl font-semibold tabular-nums ${s.tone}`}>{s.value}</div>
              <div className="mt-0.5 text-[11px] uppercase tracking-wide text-zinc-500">{s.label}</div>
            </Link>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/sold"
            className="tap-target inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Sold queue
          </Link>
          <Link
            href="/warehouse"
            className="tap-target inline-flex flex-1 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium hover:bg-zinc-800"
          >
            Warehouse
          </Link>
          <Link
            href="/rules"
            className="tap-target inline-flex flex-1 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium hover:bg-zinc-800"
          >
            Rules
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { title: '1. Seed', body: 'Eight demo estimates scored by the v1 rule engine.' },
          { title: '2. Ops', body: 'SAFE pairs auto-approve; Hue97 / Indigo escalate.' },
          { title: '3. Warehouse', body: 'Mark loaded / ready — saved in localStorage.' },
        ].map((c) => (
          <div key={c.title} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="text-sm font-medium text-zinc-100">{c.title}</h2>
            <p className="mt-1 text-xs text-zinc-400">{c.body}</p>
          </div>
        ))}
      </section>

      <button
        type="button"
        onClick={() => {
          resetDemoData();
          window.location.reload();
        }}
        className="text-xs text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
      >
        Reset demo overrides
      </button>
    </div>
  );
}
