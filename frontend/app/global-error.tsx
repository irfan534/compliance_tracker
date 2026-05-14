'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(226,232,240,0.78),_rgba(148,163,184,0.32))] p-6 dark:bg-[radial-gradient(circle_at_top,_rgba(15,23,42,1),_rgba(15,23,42,0.94),_rgba(2,6,23,1))]">
          <Card className="w-full max-w-md p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
              <AlertTriangle className="h-8 w-8 text-rose-500" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-slate-950 dark:text-white">Critical Error</h2>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
              {error.message || 'A critical error occurred. Please refresh the page.'}
            </p>
            <Button onClick={() => window.location.reload()} className="flex w-full items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>
          </Card>
        </div>
      </body>
    </html>
  );
}
