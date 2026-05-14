'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, BadgeCheck, Files, ShieldAlert } from 'lucide-react';
import Card from '@/components/ui/card';
import ComplianceBar from '@/components/ComplianceBar';
import ExpiringPanel from '@/components/ExpiringPanel';
import { useAppSettings } from '@/components/providers/app-settings-provider';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { formatDate, formatDateTime, getCertificateStatus, getCompliancePercentage, getSupabaseErrorMessage } from '@/lib/utils';
import type { Certificate, LogEntry } from '@/types';

type ExpiringCertificate = Certificate & {
  company_name: string;
};

const statCards = [
  { key: 'total', title: 'Total Certificates', icon: Files },
  { key: 'active', title: 'Active Certificates', icon: BadgeCheck },
  { key: 'expiring', title: 'Expiring Soon', icon: AlertTriangle },
  { key: 'expired', title: 'Expired', icon: ShieldAlert },
] as const;

export default function DashboardPage() {
  const { expiryThreshold } = useAppSettings();
  const [certificates, setCertificates] = useState<ExpiringCertificate[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          if (active) {
            setLoading(false);
          }
          return;
        }

        const [certificateResponse, logsResponse] = await Promise.all([
          supabase
            .from('certificates')
            .select('id, company_id, name, issuing_body, issue_date, expiry_date, status, logo_url, created_at, companies(name)')
            .order('expiry_date', { ascending: true }),
          supabase.from('logs').select('*').order('created_at', { ascending: false }).limit(5),
        ]);

        if (certificateResponse.error) {
          throw certificateResponse.error;
        }

        if (logsResponse.error) {
          throw logsResponse.error;
        }

        const mappedCertificates = (certificateResponse.data ?? []).map((item) => {
          const companyRelation = item.companies as { name?: string } | Array<{ name?: string }> | null;
          const companyName = Array.isArray(companyRelation)
            ? companyRelation[0]?.name ?? 'Unknown Company'
            : companyRelation?.name ?? 'Unknown Company';

          return {
          id: item.id,
          company_id: item.company_id,
          name: item.name,
          issuing_body: item.issuing_body,
          issue_date: item.issue_date,
          expiry_date: item.expiry_date,
          status: item.status,
          logo_url: item.logo_url,
          created_at: item.created_at,
            company_name: companyName,
          };
        });

        if (!active) {
          return;
        }

        setCertificates(mappedCertificates);
        setLogs(logsResponse.data ?? []);
      } catch (caughtError) {
        if (active) {
          setError(getSupabaseErrorMessage(caughtError, 'Unable to load dashboard data.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    const total = certificates.length;
    const active = certificates.filter((certificate) => getCertificateStatus(certificate.expiry_date, expiryThreshold) === 'active').length;
    const expiringCertificates = certificates.filter(
      (certificate) => getCertificateStatus(certificate.expiry_date, expiryThreshold) === 'expiring',
    );
    const expired = certificates.filter((certificate) => getCertificateStatus(certificate.expiry_date, expiryThreshold) === 'expired').length;

    return {
      total,
      active,
      expiring: expiringCertificates.length,
      expired,
      expiringCertificates,
      compliance: getCompliancePercentage(certificates, expiryThreshold),
    };
  }, [certificates, expiryThreshold]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <div className="space-y-8">
        <section className="flex flex-col gap-3">
          <p className="page-eyebrow">Dashboard</p>
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.5px] text-[var(--app-text)]">Overview</h1>
            <p className="mt-2 text-[15px] text-[var(--app-muted)]">
              Monitor certificate health, upcoming expiries, and recent activity in one place.
            </p>
          </div>
        </section>

        {!isSupabaseConfigured && process.env.NODE_ENV === 'development' ? (
          <div
            style={{
              background: '#FFF4E5',
              border: '1px solid #FF9500',
              borderRadius: '12px',
              padding: '14px 18px',
              fontSize: '14px',
              color: '#7A4500',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>⚠️</span>
            <span>
              Add <code style={{ background: '#FFE5B4', borderRadius: '4px', padding: '1px 6px' }}>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
              <code style={{ background: '#FFE5B4', borderRadius: '4px', padding: '1px 6px' }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your{' '}
              <code>.env.local</code> file.
            </span>
          </div>
        ) : null}

        {error ? (
          <Card className="border-[#FFC5C1] bg-[#FFECEB]">
            <p className="text-sm text-[#7A0000]">{error}</p>
          </Card>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            const value =
              card.key === 'total'
                ? summary.total
                : card.key === 'active'
                  ? summary.active
                  : card.key === 'expiring'
                    ? summary.expiring
                    : summary.expired;
            const isExpiringCard = card.key === 'expiring';
            const isExpiredCard = card.key === 'expired';

            return (
              <motion.button
                key={card.key}
                type="button"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className="text-left"
                onClick={() => {
                  if (isExpiringCard) {
                    setPanelOpen(true);
                  }
                }}
                disabled={!isExpiringCard}
              >
                <Card
                  className={`h-full ${
                    isExpiringCard ? 'cursor-pointer border-l-4 border-l-transparent hover:border-l-[#FF9500]' : ''
                  } ${isExpiredCard ? 'border-l-4 border-l-transparent hover:border-l-[#FF3B30]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--app-muted)]">{card.title}</p>
                      <p className="mt-6 text-[40px] font-bold tracking-[-1px] text-[var(--app-text)]">{value}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--app-surface)]">
                      <Icon className="h-5 w-5 text-[var(--app-muted)]" />
                    </div>
                  </div>
                  {isExpiringCard ? (
                    <p className="mt-6 text-[13px] text-[#0071E3]">
                      View expiring →
                    </p>
                  ) : null}
                </Card>
              </motion.button>
            );
          })}
        </section>

        <section>
          <Card className="max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--app-surface)]">
                <Activity className="h-5 w-5 text-[var(--app-muted)]" />
              </div>
              <div>
                <p className="label-caps">Recent Logs</p>
                <h2 className="mt-1 text-[20px] font-semibold text-[var(--app-text)]">Latest Activity</h2>
              </div>
            </div>
            <div className="mt-6">
              {logs.length ? (
                logs.map((logEntry) => (
                  <div
                    key={logEntry.id}
                    className="border-b border-[color:var(--app-border)] px-1 py-3 last:border-b-0"
                  >
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <span className="text-[14px] font-medium text-[var(--app-text)]">{logEntry.action}</span>
                      <span className="text-[12px] text-[var(--app-muted)]">
                        {formatDateTime(logEntry.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] text-[var(--app-muted)]">{logEntry.entity || 'System activity'}</p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--app-surface)]">
                    <Activity className="h-5 w-5 text-[var(--app-muted)]" />
                  </div>
                  <p className="mt-4 text-sm text-[var(--app-muted)]">No logs recorded yet</p>
                </div>
              )}
            </div>
          </Card>
        </section>

        <section>
          <Card>
            <div>
              <p className="label-caps">Expiring Soon Snapshot</p>
              <h2 className="mt-2 text-[20px] font-semibold text-[var(--app-text)]">Certificates requiring attention</h2>
            </div>
            <div className="mt-6 overflow-hidden rounded-[16px] border border-[color:var(--app-border)] bg-[var(--app-panel)]">
              <div className="grid grid-cols-[1.8fr_1.2fr_1fr_1.1fr] gap-3 bg-[var(--app-surface)] px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-[var(--app-muted)]">
                <span>Certificate</span>
                <span>Issuer</span>
                <span>Expiry</span>
                <span>Company</span>
              </div>
              <div className="divide-y divide-[color:var(--app-border)]">
                {summary.expiringCertificates.slice(0, 5).map((certificate) => (
                  <div key={certificate.id} className="grid grid-cols-[1.8fr_1.2fr_1fr_1.1fr] gap-3 px-5 py-4 text-sm">
                    <span className="font-medium text-[var(--app-text)]">{certificate.name}</span>
                    <span className="text-[var(--app-muted)]">{certificate.issuing_body || 'Not specified'}</span>
                    <span className="text-[var(--app-text)]">{formatDate(certificate.expiry_date)}</span>
                    <span className="text-[var(--app-muted)]">{certificate.company_name}</span>
                  </div>
                ))}
                {!summary.expiringCertificates.length ? (
                  <div className="px-5 py-8 text-sm text-[var(--app-muted)]">
                    Nothing is expiring within the current threshold.
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
        </section>
      </div>

      <ExpiringPanel open={panelOpen} onOpenChange={setPanelOpen} certificates={summary.expiringCertificates} />
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="h-3 w-28 animate-pulse rounded-full bg-[#E5E5E5]" />
        <div className="h-10 w-80 animate-pulse rounded-2xl bg-[#E5E5E5]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-[16px] border border-[#E5E5E5] bg-white" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="h-52 animate-pulse rounded-[16px] border border-[#E5E5E5] bg-white" />
        <div className="h-52 animate-pulse rounded-[16px] border border-[#E5E5E5] bg-white" />
      </div>
    </div>
  );
}
