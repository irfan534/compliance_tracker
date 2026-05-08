export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getDaysUntilExpiry = (expiryDate: string | Date): number => {
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getCertificationStatus = (expiryDate: string | Date): 'active' | 'expiring' | 'expired' => {
  const daysRemaining = getDaysUntilExpiry(expiryDate);
  
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= 30) return 'expiring';
  return 'active';
};

export const getStatusBadgeColor = (status: string): 'default' | 'secondary' | 'destructive' => {
  if (status === 'active' || status === 'ACTIVE') return 'default';
  if (status === 'expiring' || status === 'EXPIRING_SOON') return 'secondary';
  return 'destructive';
};

export const cn = (...classes: any[]): string => {
  return classes.filter(Boolean).join(' ');
};
