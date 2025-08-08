'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { BarChart3, FileEdit, Home, Settings } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      current: pathname === '/',
    },
    {
      name: 'Evaluate',
      href: '/evaluate',
      icon: FileEdit,
      current: pathname === '/evaluate',
    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-black border-b border-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  EvalBot
                </h1>
              </div>
            </div>
            
            {/* Navigation Links */}
            <div className="ml-12 flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <button className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      item.current
                        ? "bg-white text-black"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    )}>
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Settings */}
            <button className="p-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}