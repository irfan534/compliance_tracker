'use client';

import { motion } from 'framer-motion';
import { useCertificationMetrics, useFrameworkMetrics, useCertifications, useComplianceReport } from '@/lib/hooks';
import { formatDate } from '@/lib/utils';

const metricCards = [
  { label: 'Total Certifications', key: 'totalCertifications' },
  { label: 'Active Certifications', key: 'activeCertifications' },
  { label: 'Expiring Soon', key: 'expiringSoon' },
  { label: 'Expired', key: 'expired' },
  { label: 'Total Companies', key: 'totalCompanies' },
];

export default function Dashboard() {
  const metricsQuery = useCertificationMetrics();
  const frameworkMetricsQuery = useFrameworkMetrics();
  const certificationsQuery = useCertifications();

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass p-6"
          >
            <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
            <p className="mt-4 text-3xl font-semibold text-foreground">
              {metricsQuery.isLoading ? '—' : metricsQuery.data?.[metric.key] ?? 0}
            </p>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <motion.div className="glass p-6 col-span-2">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Expiry Trend</h2>
              <p className="text-sm text-muted-foreground">Monitor certificate renewals and expiration risk.</p>
            </div>
          </div>
          <div className="h-72 rounded-3xl bg-slate-950/5 p-4">Chart placeholder</div>
        </motion.div>

        <motion.div className="glass p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Compliance Overview</h2>
            <p className="text-sm text-muted-foreground">Current framework coverage and score.</p>
          </div>
          <div className="rounded-3xl bg-slate-950/5 p-6">
            <p className="text-5xl font-semibold text-foreground">
              {frameworkMetricsQuery.isLoading ? '—' : `${frameworkMetricsQuery.data?.avgCompliance ?? 0}%`}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Average coverage across frameworks.</p>
          </div>
        </motion.div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <motion.div className="glass p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Renewals</h2>
          </div>
          <div className="space-y-4">
            {certificationsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading certifications...</p>
            ) : (
              certificationsQuery.data?.certifications.slice(0, 3).map((cert: any) => (
                <div key={cert.id} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{cert.name}</p>
                      <p className="text-xs text-muted-foreground">{cert.issuingBody}</p>
                    </div>
                    <p className="text-sm text-slate-500">{formatDate(cert.expiryDate)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div className="glass p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-foreground">Audit log synced</p>
              <p className="text-xs text-muted-foreground">Tracker recorded a security event at 09:42</p>
            </div>
            <div className="rounded-3xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-foreground">Excel import completed</p>
              <p className="text-xs text-muted-foreground">Certification data refreshed from upload.</p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
