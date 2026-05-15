export const formatDate = (date: string | Date | null): string => {
  if (!date) {
    return 'Not set';
  }

  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date | null): string => {
  if (!date) {
    return 'Not set';
  }

  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  return parsedDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getDaysUntilExpiry = (expiryDate: string | Date | null): number => {
  if (!expiryDate) {
    return Number.POSITIVE_INFINITY;
  }

  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getCertificateStatus = (
  expiryDate: string | Date | null,
  thresholdDays = 30,
): 'active' | 'expiring' | 'expired' => {
  const daysRemaining = getDaysUntilExpiry(expiryDate);

  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= thresholdDays) return 'expiring';
  return 'active';
};

export const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' => {
  const normalized = status.toLowerCase();

  if (normalized.includes('active') || normalized.includes('added') || normalized.includes('updated') || normalized.includes('setting')) {
    return 'default';
  }

  if (normalized.includes('expiring')) {
    return 'secondary';
  }

  return 'destructive';
};

export const getStatusLabel = (status: 'active' | 'expiring' | 'expired'): string => {
  if (status === 'active') return 'Active';
  if (status === 'expiring') return 'Expiring';
  return 'Expired';
};

export const cn = (...classes: Array<string | false | null | undefined>): string => classes.filter(Boolean).join(' ');

export const getInitials = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

export const getCompliancePercentage = (
  certificates: Array<{ expiry_date: string | null }>,
  thresholdDays = 30,
) => {
  if (!certificates.length) {
    // If there are no certificates, the company is 100% compliant by default
    return 100;
  }

  const activeCertificates = certificates.filter(
    (certificate) => getCertificateStatus(certificate.expiry_date, thresholdDays) === 'active',
  ).length;

  return Math.round((activeCertificates / certificates.length) * 100);
};

export const getCompanyStatusLabel = (
  certificates: Array<{ expiry_date: string | null }>,
  thresholdDays = 30,
) => {
  if (certificates.length === 0) {
    return 'No Certificates';
  }

  const statuses = certificates.map((certificate) => getCertificateStatus(certificate.expiry_date, thresholdDays));

  if (statuses.includes('expired')) {
    return 'Has Expired';
  }

  if (statuses.includes('expiring')) {
    return 'Expiring Soon';
  }

  return 'All Active';
};

export const maskAccessHash = (hash: string | null) => {
  if (!hash) {
    return 'System';
  }

  return `••••${hash.slice(-4)}`;
};

export const getCertificateInsertPayload = (certificate: {
  id: string;
  company_id: string;
  name: string;
  issuing_body: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  logo_url: string | null;
  created_at: string;
}) => ({
  id: certificate.id,
  company_id: certificate.company_id,
  name: certificate.name,
  issuing_body: certificate.issuing_body,
  issue_date: certificate.issue_date,
  expiry_date: certificate.expiry_date,
  logo_url: certificate.logo_url,
  created_at: certificate.created_at,
});

export const isSupabaseConfigError = (error: unknown) => {
  if (!error || typeof error !== 'object' || !('message' in error) || typeof error.message !== 'string') {
    return false;
  }

  return (
    error.message.includes('SUPABASE_SERVICE_ROLE_KEY') ||
    error.message.includes('NEXT_PUBLIC_SUPABASE_URL')
  );
};

export const getSupabaseErrorMessage = (error: unknown, fallback: string) => {
  if (isSupabaseConfigError(error)) {
    return 'Server database access is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in frontend/.env.local, then restart the app.';
  }

  if (error && typeof error === 'object') {
    // Check for Supabase-specific error structure
    if ('message' in error && typeof error.message === 'string') {
      let errorMessage = error.message;
      if ('details' in error && typeof error.details === 'string' && error.details) {
        errorMessage += ` Details: ${error.details}`;
      }
      return errorMessage;
    }
  }

  return fallback;
};

export const downloadLogsCsv = (
  logs: Array<{
    created_at: string;
    action: string;
    entity: string | null;
    performed_by: string | null;
  }>,
) => {
  const lines = [
    ['Timestamp', 'Action', 'Entity', 'Performed By'].join(','),
    ...logs.map((log) =>
      [log.created_at, log.action, log.entity ?? '', log.performed_by ?? '']
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    ),
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `compliance-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
