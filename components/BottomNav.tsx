'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
}

export default function BottomNav() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get user role from session
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUserRole(data.role);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };

    checkAuth();
  }, []);

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      href: '/dashboard',
      icon: '🏠',
    },
    {
      id: 'tools',
      label: 'Tools',
      href: '/tools',
      icon: '🧰',
    },
    {
      id: 'meine',
      label: 'Meine',
      href: '/meine',
      icon: '📋',
    },
    {
      id: 'admin',
      label: 'Admin',
      href: '/admin',
      icon: '⚙️',
      adminOnly: true,
    },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.adminOnly || userRole === 'admin'
  );

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  // Don't show on login/register pages
  if (pathname === '/' || pathname === '/registrieren' || !userRole) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-t border-border z-50">
      <div className="flex items-center justify-around px-2 py-3 max-w-md mx-auto">
        {filteredNavItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors min-w-0 flex-1 ${
              isActive(item.href)
                ? 'text-accent bg-accent/10'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs font-medium truncate">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}