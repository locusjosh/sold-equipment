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
        <h1 className="text-2xl font-semibold">Auto-approve rules (v1)</h1>
        <p className="text-sm text-zinc-400">
          Read-only view of canonical pairs and property overrides from{' '}
          <code className="text-zinc-300">src/lib/rules/autoApprove.ts</code>
        </p>
      </div>

      <section className="rounded-xl border border-zinc-800 overflow-hidden">
        <div className="border-b border-zinc-800 bg-zinc-900/80 px-4 py-2 text-sm font-medium">
          SAFE SC Ceiling pairs
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-400">
            <tr>
              <th className="px-4 py-2">Tonnage</th>
              <th className="px-4 py-2">Condenser</th>
              <th className="px-4 py-2">Air handler</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((p) => (
              <tr key={p.tonnage} className="border-t border-zinc-800">
                <td className="px-4 py-2">{p.tonnage}</td>
                <td className="px-4 py-2 font-mono text-xs">{p.condenser}</td>
                <td className="px-4 py-2 font-mono text-xs">{p.airHandlers.join(' / ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 p-4 text-sm">
          <h2 className="font-medium">Property overrides</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-300">
            <li>Rise Broadway condenser-only: GLXS4BA2410A (+ A2L flag)</li>
            <li>Park Mesa wall: A5AC4024 + FMA5X2400AL</li>
            <li>Griffin wall: GLXS4BA2410A + AWST24SU1305</li>
          </ul>
        </div>
        <div className="rounded-xl border border-zinc-800 p-4 text-sm">
          <h2 className="font-medium">Always escalate</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-300">
            <li>Hue97 unless A5AC4030/36 + matching HXS</li>
            <li>Indigo / GLZS* / HP Closet</li>
            <li>Tonnage mismatch / unknown SKUs</li>
            <li>Never escalate solely for job N/A</li>
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 p-4 text-sm">
        <h2 className="font-medium">High-volume properties (hint)</h2>
        <p className="mt-2 text-zinc-400">{HIGH_VOLUME_PROPERTIES.join(', ')}</p>
        <p className="mt-2 text-xs text-zinc-500">
          {Object.keys(CANONICAL_PAIRS).length} canonical tonnage buckets loaded.
        </p>
      </section>
    </div>
  );
}
