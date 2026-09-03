const COLORS: Record<string, string> = {
  auto: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
  approved: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
  Ready: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
  ready: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
  pending: 'bg-amber-900/50 text-amber-200 border-amber-700',
  Pending: 'bg-amber-900/50 text-amber-200 border-amber-700',
  escalate: 'bg-orange-900/50 text-orange-200 border-orange-700',
  declined: 'bg-rose-900/50 text-rose-200 border-rose-700',
  NotReady: 'bg-rose-900/50 text-rose-200 border-rose-700',
  not_ready: 'bg-rose-900/50 text-rose-200 border-rose-700',
  short: 'bg-rose-900/50 text-rose-200 border-rose-700',
  done: 'bg-sky-900/50 text-sky-200 border-sky-700',
};

export function StatusPill({ label, value }: { label?: string; value: string }) {
  const color = COLORS[value] || 'bg-zinc-800 text-zinc-300 border-zinc-700';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${color}`}>
      {label ? <span className="opacity-70">{label}</span> : null}
      <span className="font-medium">{value}</span>
    </span>
  );
}
