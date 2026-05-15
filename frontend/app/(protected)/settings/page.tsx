'use client';

import { useEffect, useState } from 'react';
import { Download, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { serverFetchAllLogs, serverLogActivity, serverUpdateSetting } from '@/app/actions/db';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import Button from '@/components/ui/button';
import BackButton from '@/components/BackButton';
import Card from '@/components/ui/card';
import Input from '@/components/ui/input';
import { useAppSettings } from '@/components/providers/app-settings-provider';
import { downloadLogsCsv, getSupabaseErrorMessage } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const { expiryThreshold, refreshSettings } = useAppSettings();
  const [thresholdValue, setThresholdValue] = useState(String(expiryThreshold));
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setThresholdValue(String(expiryThreshold));
  }, [expiryThreshold]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const nextThreshold = Number(thresholdValue) || 30;
      await serverUpdateSetting('expiry_threshold', String(nextThreshold));

      if (nextThreshold !== expiryThreshold) {
        await serverLogActivity({
          action: 'Setting Changed',
          entity: 'Expiry Warning Threshold',
          performedBy: 'internal-user',
        });
      }

      await refreshSettings();
    } catch (caughtError) {
      setError(getSupabaseErrorMessage(caughtError, 'Unable to save settings.'));
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);

    try {
      const data = await serverFetchAllLogs();
      downloadLogsCsv(data);
    } catch (caughtError) {
      setError(getSupabaseErrorMessage(caughtError, 'Unable to export logs.'));
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    // Use window.location to force a full refresh and clear all caches
    window.location.href = '/login';
  };

  return (
    <div className="space-y-8">
      <BackButton label="Dashboard" />
      <section>
        <p className="page-eyebrow">Settings</p>
        <h1 className="mt-3 text-[28px] font-bold tracking-[-0.5px] text-[var(--app-text)]">Workspace settings</h1>
        <p className="mt-2 text-[15px] text-[var(--app-muted)]">
          Manage the expiry warning logic and log export.
        </p>
      </section>

      {error ? (
        <Card className="border-[#FFC5C1] bg-[#FFECEB]">
          <p className="text-sm text-[#7A0000]">{error}</p>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--app-text)]">Expiry Warning Threshold</label>
              <Input type="number" min="1" value={thresholdValue} onChange={(event) => setThresholdValue(event.target.value)} />
            </div>

            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="space-y-6">
            <div className="rounded-[16px] border border-[color:var(--app-border)] bg-[var(--app-surface)] p-4">
              <p className="label-caps">Export Logs</p>
              <p className="mt-2 text-sm text-[var(--app-muted)]">
                Download the full append-only log history as CSV.
              </p>
              <Button onClick={() => void handleExport()} variant="outline" className="mt-4" disabled={exporting}>
                <Download className="mr-2 h-4 w-4" />
                {exporting ? 'Preparing CSV...' : 'Export Logs'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Button onClick={() => void handleLogout()} className="border-red-200 bg-red-600 text-white hover:bg-red-700">
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}
