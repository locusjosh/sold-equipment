import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 sm:p-8">
        <p className="text-sm uppercase tracking-widest text-emerald-400/80">Demo mode</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Sold Equipment MVP
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Replaces the Zapier EQUIP SOLD Zap with smart auto-approve, a sold queue,
          and the warehouse installs board. Runs locally with SQLite — no secrets required.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/sold"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Open sold queue
          </Link>
          <Link
            href="/warehouse"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-800"
          >
            Warehouse board
          </Link>
          <Link
            href="/rules"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-800"
          >
            Canonical rules
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: '1. Ingest',
            body: 'POST /api/sold/ingest runs the v1 rule engine and dry-runs Slack.',
          },
          {
            title: '2. Ops gate',
            body: 'SAFE pairs auto-approve; Hue97 / Indigo / mismatches escalate.',
          },
          {
            title: '3. Warehouse',
            body: 'Auto installs land on the board; mark loaded / ready from the UI.',
          },
        ].map((c) => (
          <div key={c.title} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="font-medium text-zinc-100">{c.title}</h2>
            <p className="mt-2 text-sm text-zinc-400">{c.body}</p>
          </div>
        ))}
      </section>

      <a
        href="/api/demo/seed"
        className="inline-flex rounded-lg border border-dashed border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-emerald-600 hover:text-emerald-300"
      >
        Load / refresh demo seed
      </a>
    </div>
  );
}
