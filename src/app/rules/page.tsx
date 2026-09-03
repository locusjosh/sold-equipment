import {
  CANONICAL_PAIRS,
  HIGH_VOLUME_PROPERTIES,
  formatCanonicalPairsForDisplay,
} from '@/lib/rules/autoApprove';

export default function RulesPage() {
  const pairs = formatCanonicalPairsForDisplay();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Auto-approve rules</h1>
        <p className="text-sm text-zinc-400">SAFE SC Ceiling pairs · v1</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-400">
          SAFE pairs
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {pairs.map((p) => (
            <article
              key={p.tonnage}
              className="rounded-xl border border-emerald-900/40 bg-emerald-950/15 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-emerald-800/80 px-3 py-1 text-sm font-semibold text-emerald-100">
                  {p.tonnage}
                </span>
                <span className="text-xs text-zinc-500">{p.label}</span>
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-zinc-500">Condenser</dt>
                  <dd className="mt-0.5 rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-1.5 font-mono text-xs text-zinc-200">
                    {p.condenser}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-zinc-500">Air handler</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {p.airHandlers.map((ah) => (
                      <span
                        key={ah}
                        className="rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-1 font-mono text-xs text-zinc-200"
                      >
                        {ah}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 p-4 text-sm">
          <h2 className="font-medium">Property overrides</h2>
          <ul className="mt-3 space-y-2 text-zinc-300">
            <li className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">
              Rise Broadway condenser-only: GLXS4BA2410A (+ A2L)
            </li>
            <li className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">
              Park Mesa wall: A5AC4024 + FMA5X2400AL
            </li>
            <li className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">
              Griffin wall: GLXS4BA2410A + AWST24SU1305
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-amber-900/50 bg-amber-950/10 p-4 text-sm">
          <h2 className="font-medium text-amber-200">Always escalate</h2>
          <ul className="mt-3 space-y-2 text-zinc-300">
            <li className="rounded-lg border border-amber-900/40 bg-zinc-950/40 px-3 py-2">
              Hue97 unless A5AC4030/36 + matching HXS
            </li>
            <li className="rounded-lg border border-amber-900/40 bg-zinc-950/40 px-3 py-2">
              Indigo / GLZS* / HP Closet
            </li>
            <li className="rounded-lg border border-amber-900/40 bg-zinc-950/40 px-3 py-2">
              Tonnage mismatch / unknown SKUs
            </li>
            <li className="rounded-lg border border-amber-900/40 bg-zinc-950/40 px-3 py-2">
              Never escalate solely for job N/A
            </li>
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 p-4 text-sm">
        <h2 className="font-medium">High-volume properties</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {HIGH_VOLUME_PROPERTIES.map((p) => (
            <span
              key={p}
              className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300"
            >
              {p}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          {Object.keys(CANONICAL_PAIRS).length} canonical tonnage buckets.
        </p>
      </section>
    </div>
  );
}
