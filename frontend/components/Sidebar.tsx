'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Building2, FileText, LayoutGrid, PanelLeft, PanelLeftClose, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/logs', label: 'Logs', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

export default function Sidebar({ expanded, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen overflow-hidden border-r border-[color:var(--app-border)] bg-[var(--app-panel)]"
      style={{ width: expanded ? '220px' : '48px', transition: 'width 200ms ease' }}
    >
      <div className="flex h-full flex-col py-2">
        <div className={cn('flex flex-col', expanded ? 'px-3 pt-4 pb-2' : 'items-center pt-4 pb-2')}>
          {expanded ? (
            <div className="flex items-center justify-between w-full px-1 mb-4">
              <Image
                src="/logo.jpeg"
                alt="Compliance Tracking"
                width={140}
                height={56}
                style={{ objectFit: 'contain', borderRadius: '8px' }}
              />
              <button
                type="button"
                onClick={onToggle}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--app-muted)] transition-colors hover:bg-[var(--app-surface)] hover:text-[var(--app-text)]"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-[18px] w-[18px]" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 mb-4">
              <Image
                src="/logo.jpeg"
                alt="Compliance Tracking"
                width={32}
                height={32}
                style={{ borderRadius: '6px', objectFit: 'cover', objectPosition: 'center top' }}
              />
              <button
                type="button"
                onClick={onToggle}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--app-muted)] transition-colors hover:bg-[var(--app-surface)] hover:text-[var(--app-text)]"
                aria-label="Expand sidebar"
              >
                <PanelLeft className="h-[18px] w-[18px]" />
              </button>
            </div>
          )}
        </div>

        <nav className={cn('flex-1 space-y-1', expanded ? 'px-2' : 'px-1')}>
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (!expanded) {
                    onToggle();
                  }
                }}
                className={cn(
                  'group flex h-10 overflow-hidden rounded-lg text-[15px] font-medium transition-colors duration-200',
                  expanded ? 'items-center gap-3 px-3' : 'items-center justify-center',
                  active ? 'bg-[var(--app-surface)] text-[var(--app-text)]' : 'text-[var(--app-muted)] hover:bg-[var(--app-surface)] hover:text-[var(--app-text)]',
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <Icon className={cn('h-5 w-5', active ? 'text-[var(--app-text)]' : 'text-[var(--app-muted)] group-hover:text-[var(--app-text)]')} />
                </div>
                <span
                  className={cn(
                    'whitespace-nowrap transition-opacity duration-150',
                    expanded ? 'opacity-100 delay-150' : 'pointer-events-none w-0 opacity-0',
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
