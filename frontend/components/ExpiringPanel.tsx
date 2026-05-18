'use client';

import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDate, getDaysUntilExpiry, cn } from '@/lib/utils';
import type { Certificate } from '@/types';

interface ExpiringPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificates: Array<
    Certificate & {
      company_name: string;
    }
  >;
  type?: 'expiring' | 'expired';
}

export default function ExpiringPanel({ open, onOpenChange, certificates, type = 'expiring' }: ExpiringPanelProps) {
  const isExpired = type === 'expired';

  const getExpiryCountdown = (date: string | null) => {
    const days = getDaysUntilExpiry(date);
    if (days === Number.POSITIVE_INFINITY) return null;
    if (days < 0) {
      const daysPast = Math.abs(days);
      return `${daysPast} ${daysPast === 1 ? 'day' : 'days'} ago`;
    }
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-[24px] border border-[#E5E5E5] bg-white p-0">
        <DialogHeader className="border-b border-[#E5E5E5] px-6 py-5">
          <DialogTitle className="text-2xl font-semibold tracking-tight">{isExpired ? 'Expired Certificates' : 'Expiring Soon'}</DialogTitle>
          <DialogDescription className="text-[14px] text-[#6E6E73]">
            {isExpired ? 'Certificates that have already passed their expiry date.' : 'Certificates approaching expiry are listed here with direct links to their company records.'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-[1.6fr_1.2fr_1fr_1.2fr] gap-3 border-b border-[#F0F0F2] px-6 py-4 text-[11px] uppercase tracking-[0.22em] text-[#6E6E73]">
            <span>Certificate</span>
            <span>Issuing Body</span>
            <span>Expiry Date</span>
            <span>Company</span>
          </div>

          <div className="divide-y divide-[#F5F5F7]">
            {certificates.map((certificate) => (
              <Link
                key={certificate.id}
                href={`/companies/${certificate.company_id}`}
                onClick={() => onOpenChange(false)}
                className="grid grid-cols-[1.6fr_1.2fr_1fr_1.2fr] gap-3 px-6 py-4 text-sm transition-colors hover:bg-[#F5F5F7]"
              >
                <span className="font-medium text-[#1D1D1F]">{certificate.name}</span>
                <span className="text-[#6E6E73]">{certificate.issuing_body || 'Not specified'}</span>
                <div className="flex flex-col">
                  <span className="text-[#1D1D1F]">{formatDate(certificate.expiry_date)}</span>
                  <span className={cn('text-[11px] font-medium', isExpired ? 'text-[#FF3B30]' : 'text-[#FF9500]')}>
                    {getExpiryCountdown(certificate.expiry_date)}
                  </span>
                </div>
                <span className="text-[#6E6E73]">{certificate.company_name}</span>
              </Link>
            ))}

            {!certificates.length ? (
              <div className="px-6 py-10 text-sm text-[#6E6E73]">
                {isExpired ? 'No certificates are currently expired.' : 'No certificates are currently inside the warning window.'}
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
