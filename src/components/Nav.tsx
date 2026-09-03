import Link from 'next/link';

const links = [
  { href: '/', label: 'Home' },
  { href: '/sold', label: 'Sold Queue' },
  { href: '/warehouse', label: 'Warehouse' },
  { href: '/rules', label: 'Rules' },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight text-emerald-400">
          Sold Equipment
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
