'use client';

import { Building2, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { formatDate, getCertificateStatus, getStatusBadgeVariant, getStatusLabel } from '@/lib/utils';
import type { Certificate } from '@/types';

interface CertTableProps {
  certificates: Certificate[];
  expiryThreshold: number;
  onDelete: (certificate: Certificate) => void;
}

export default function CertTable({ certificates, expiryThreshold, onDelete }: CertTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead>
          <tr className="border-b border-[#E5E5E5] text-[11px] uppercase tracking-[0.22em] text-[#6E6E73]">
            <th className="px-4 py-3 font-medium text-center">Logo</th>
            <th className="px-4 py-3 font-medium">Certificate Name</th>
            <th className="px-4 py-3 font-medium">Issuing Body</th>
            <th className="px-4 py-3 font-medium">Issue Date</th>
            <th className="px-4 py-3 font-medium">Expiry Date</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Delete</th>
          </tr>
        </thead>
        <tbody>
          {certificates.length ? (
            certificates.map((certificate) => {
              const status = getCertificateStatus(certificate.expiry_date, expiryThreshold);

              return (
                <tr key={certificate.id} className="border-b border-[#F5F5F7] text-sm">
                  <td className="px-4 py-6">
                    <div className="flex items-center justify-center">
                      {certificate.logo_url ? (
                        <div
                          style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            background: '#F5F5F7',
                            border: '1px solid #E5E5E5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <img
                            src={certificate.logo_url}
                            alt={`${certificate.name} logo`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              objectPosition: 'center',
                              padding: '10px'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex h-[120px] w-[120px] items-center justify-center rounded-[1.5rem] bg-[#F5F5F7]">
                          <Building2 className="h-16 w-16 text-[#6E6E73]" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-[#1D1D1F]">{certificate.name}</td>
                  <td className="px-4 py-4 text-[#6E6E73]">{certificate.issuing_body || 'Not specified'}</td>
                  <td className="px-4 py-4 text-[#1D1D1F]">{formatDate(certificate.issue_date)}</td>
                  <td className="px-4 py-4 text-[#1D1D1F]">{formatDate(certificate.expiry_date)}</td>
                  <td className="px-4 py-4">
                    <Badge variant={getStatusBadgeVariant(status)}>{getStatusLabel(status, certificate.expiry_date)}</Badge>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button
                      variant="outline"
                      className="h-10 w-10 p-0 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => onDelete(certificate)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td className="px-4 py-10 text-center text-sm text-[#6E6E73]" colSpan={7}>
                No certificates recorded for this company yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
