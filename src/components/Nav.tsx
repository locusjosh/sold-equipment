'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home', icon: '⌂' },
  { href: '/sold', label: 'Sold', icon: '☰' },
  { href: '/warehouse', label: 'Warehouse', icon: '▣' },
  { href: '/rules', label: 'Rules', icon: '⚙' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/' || pathname === '';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname() || '/';

  return (
    <>
      {/* Compact top brand bar (desktop + mobile) */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur pt-[var(--safe-top)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5">
          <Link href="/" className="font-semibold tracking-tight text-emerald-400">
            Sold Equipment
          </Link>
          <nav className="hidden gap-1 text-sm md:flex">
            {links.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`tap-target inline-flex items-center rounded-md px-3 py-2 ${
                    active
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <span className="rounded-full border border-emerald-800/60 bg-emerald-950/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-emerald-400 md:hidden">
            Demo
          </span>
        </div>
      </header>

      {/* Sticky bottom tabs — iPhone one-hand */}
      <nav
        className="bottom-tab-bar fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur md:hidden"
        aria-label="Primary"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {links.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`tap-target flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium ${
                  active ? 'text-emerald-400' : 'text-zinc-400'
                }`}
              >
                <span className="text-base leading-none" aria-hidden>
                  {l.icon}
                </span>
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
