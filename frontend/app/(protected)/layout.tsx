'use client';

import { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import AuthGate from '@/components/AuthGate';
import Sidebar from '@/components/Sidebar';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme();
  const currentTheme = resolvedTheme ?? 'light';
  const isDarkTheme = currentTheme === 'dark';
  const [expanded, setExpanded] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const syncFromStorage = () => {
      setExpanded(localStorage.getItem('sidebar_expanded') === 'true');
    };

    syncFromStorage();
    window.addEventListener('storage', syncFromStorage);

    return () => {
      window.removeEventListener('storage', syncFromStorage);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AuthGate>
      <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
        <Sidebar
          expanded={expanded}
          onToggle={() => setExpanded((prev) => {
            const next = !prev;
            localStorage.setItem('sidebar_expanded', String(next));
            return next;
          })}
        />
        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="min-h-screen min-w-0 bg-[var(--app-bg)]"
          style={{ marginLeft: expanded ? '220px' : '48px', transition: 'margin-left 200ms ease' }}
        >
          <div className="flex justify-end px-8 pt-6">
            <button
              type="button"
              onClick={() => setTheme(isDarkTheme ? 'light' : 'dark')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--app-border)] bg-[var(--app-panel)] text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface)]"
              aria-label={isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {mounted && isDarkTheme ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
          </div>
          <div className="mx-auto h-full max-w-[1200px] overflow-y-auto px-8 py-10">{children}</div>
        </motion.main>
      </div>
    </AuthGate>
  );
}
