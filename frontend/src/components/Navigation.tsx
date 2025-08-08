'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BarChart3, FileEdit, Home, Settings } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Navigation() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, current: pathname === '/' },
    { name: 'Evaluate', href: '/evaluate', icon: FileEdit, current: pathname === '/evaluate' },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-[--color-border] bg-[--color-card]">
      {/* Brand */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-[--color-border]">
        <div className="w-9 h-9 rounded-lg bg-[--color-primary] text-[--color-primary-foreground] flex items-center justify-center">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[--color-foreground]">EvalBot</h1>
          <p className="text-xs text-[--color-muted-foreground]">Evaluate & Improve</p>
        </div>
      </div>

      {/* Nav list */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="px-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.current;
            return (
              <li key={item.name}>
                <Link href={item.href} className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm",
                  active
                    ? "bg-[--color-primary] text-[--color-primary-foreground]"
                    : "text-[--color-muted-foreground] hover:text-[--color-foreground] hover:bg-[--color-muted]"
                )}>
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer actions */}
      <div className="p-3 border-t border-[--color-border] space-y-2">
        <ThemeToggle />
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm bg-[--color-muted] text-[--color-foreground] hover:opacity-90">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}