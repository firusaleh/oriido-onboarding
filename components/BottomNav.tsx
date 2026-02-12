'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
}

interface MoreMenuItem {
  label: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
}

export default function BottomNav() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

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
      id: 'crm',
      label: 'CRM',
      href: '/crm',
      icon: '📋',
    },
    {
      id: 'mehr',
      label: 'Mehr',
      href: '#',
      icon: '📚',
    },
  ];

  const moreMenuItems: MoreMenuItem[] = [
    { label: 'Dokumente', href: '/dokumente', icon: '📄' },
    { label: 'Einwände', href: '/einwaende', icon: '💬' },
    { label: 'Leitfaden', href: '/leitfaden', icon: '🗺️' },
    { label: 'Briefing', href: '/briefing', icon: '📣' },
    { label: 'Meine Einreichungen', href: '/meine', icon: '📝' },
    ...(userRole === 'admin' ? [
      { label: 'Admin Dashboard', href: '/admin', icon: '⚙️', adminOnly: true },
      { label: 'Dokumente verwalten', href: '/admin/dokumente', icon: '📁', adminOnly: true },
      { label: 'Einwände verwalten', href: '/admin/einwaende', icon: '✏️', adminOnly: true },
      { label: 'Briefing erstellen', href: '/admin/briefing', icon: '📢', adminOnly: true },
    ] : [])
  ];

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
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-t border-border z-40">
        <div className="flex items-center justify-around px-2 py-3 max-w-md mx-auto">
          {navItems.map((item) => {
            if (item.id === 'mehr') {
              return (
                <button
                  key={item.id}
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors min-w-0 flex-1 ${
                    showMoreMenu
                      ? 'text-accent bg-accent/10'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs font-medium truncate">{item.label}</span>
                </button>
              );
            }
            
            return (
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
            );
          })}
        </div>
      </nav>

      {/* More Menu Slide-Up */}
      <AnimatePresence>
        {showMoreMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowMoreMenu(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-2xl z-50 max-h-[70vh] overflow-y-auto"
            >
              <div className="max-w-md mx-auto p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-primary">Mehr Optionen</h2>
                  <button 
                    onClick={() => setShowMoreMenu(false)}
                    className="text-secondary hover:text-primary text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-2">
                  {moreMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMoreMenu(false)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-primary font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}