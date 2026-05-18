'use client';

import { useEffect, useState, useCallback } from 'react';
import { History, ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react';
import { serverFetchLogs } from '@/app/actions/db';
import BackButton from '@/components/BackButton';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import { formatDateTime, getSupabaseErrorMessage } from '@/lib/utils';
import type { LogEntry } from '@/types';

const ITEMS_PER_PAGE = 15;

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async (currentPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const result = await serverFetchLogs(ITEMS_PER_PAGE, offset);
      setLogs(result.data);
      setTotal(result.total);
    } catch (caughtError) {
      setError(getSupabaseErrorMessage(caughtError, 'Unable to load activity logs.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLogs(page);
  }, [page, loadLogs]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-8">
      <BackButton label="Dashboard" />
      
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="page-eyebrow">Audit Trail</p>
          <h1 className="mt-3 text-[28px] font-bold tracking-[-0.5px] text-[#1D1D1F]">Activity Logs</h1>
          <p className="mt-2 text-[15px] text-[#6E6E73]">
            An append-only record of all system modifications.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => void loadLogs(page)} 
          disabled={loading}
          className="w-fit"
        >
          <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </section>

      {error ? (
        <Card className="border-[#FFC5C1] bg-[#FFECEB]">
          <p className="text-sm text-[#7A0000]">{error}</p>
        </Card>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#F5F5F7] bg-[#FAFAFA]">
                <th className="px-6 py-4 font-semibold text-[#1D1D1F]">Timestamp</th>
                <th className="px-6 py-4 font-semibold text-[#1D1D1F]">Action</th>
                <th className="px-6 py-4 font-semibold text-[#1D1D1F]">Entity</th>
                <th className="px-6 py-4 font-semibold text-[#1D1D1F]">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F7]">
              {loading && logs.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="h-16 px-6">
                      <div className="h-4 w-full rounded bg-[#F5F5F7]" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#6E6E73]">
                    <History className="mx-auto mb-3 h-8 w-8 opacity-20" />
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-[#FAFAFA]">
                    <td className="whitespace-nowrap px-6 py-4 text-[#6E6E73]">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="px-6 py-4 font-medium text-[#1D1D1F]">{log.action}</td>
                    <td className="px-6 py-4 text-[#6E6E73]">{log.entity || '—'}</td>
                    <td className="px-6 py-4 text-[#6E6E73]">{log.performed_by || 'System'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#F5F5F7] px-6 py-4">
            <p className="text-xs text-[#6E6E73]">
              Page {page} of {totalPages} ({total} total entries)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}