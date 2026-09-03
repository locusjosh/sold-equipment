import {
  CANONICAL_PAIRS,
  formatCanonicalPairsForDisplay,
} from '@/lib/rules/autoApprove';
import { listPropertyProfiles } from '@/lib/demo/propertyProfiles';

export default function RulesPage() {
  const pairs = formatCanonicalPairsForDisplay();
  const profiles = listPropertyProfiles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Auto-approve rules</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Property-first: customer note → install history → weak global SAFE fallback
        </p>
      </div>

      <section className="rounded-xl border border-sky-900/40 bg-sky-950/15 p-4 text-sm">
        <h2 className="font-medium text-sky-200">Decision order</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-zinc-300">
          <li>Empty SKUs → escalate</li>
          <li>
            <strong className="text-zinc-100">Customer note</strong> — sold SKUs subset/exact of
            note models → auto; conflict → escalate
          </li>
          <li>
            <strong className="text-zinc-100">Property install history</strong> — set equality with
            a prior approved set → auto; history present but miss → escalate
          </li>
          <li>Hard escalate: Indigo / GLZS* / HP Closet; tonnage mismatch</li>
          <li>Hue97: prefer A5AC from note/history; else existing A5AC + HXS logic</li>
          <li>
            Only if <em>no note and no history</em> → Fallback: global SAFE pair (Rise / Park Mesa /
            Griffin / canonical)
          </li>
          <li>Job N/A never escalates alone</li>
        </ol>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-400">
          Demo property notes &amp; history
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {profiles.map(({ key, profile }) => (
            <article
              key={key}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm"
            >
              <h3 className="font-medium capitalize text-zinc-100">{key}</h3>
              <p className="mt-2 line-clamp-3 text-xs text-zinc-400">{profile.customerNote}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {profile.customerNoteSkus.map((s) => (
                  <span
                    key={s}
                    className="rounded border border-sky-900/50 bg-zinc-950 px-1.5 py-0.5 font-mono text-[10px] text-sky-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-violet-300/90">{profile.historySummary}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-sm font-medium uppercase tracking-wide text-zinc-400">
          Fallback: global SAFE pairs
        </h2>
        <p className="mb-3 text-xs text-zinc-500">
          Used only when the property has no customer note and no install history.
        </p>
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
          <h2 className="font-medium">Fallback location overrides</h2>
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
              Note conflict / history miss
            </li>
            <li className="rounded-lg border border-amber-900/40 bg-zinc-950/40 px-3 py-2">
              Hue97 unless A5AC4030/36 + matching HXS (when no note/history)
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

      <p className="text-xs text-zinc-500">
        {Object.keys(CANONICAL_PAIRS).length} canonical tonnage buckets as weak fallback only.
      </p>
    </div>
  );
}
