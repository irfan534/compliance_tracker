'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  serverCreateCertificate,
  serverCreateCompany,
  serverFetchCompanies,
  serverLogActivity,
  serverUploadImage,
} from '@/app/actions/db';
import AddCertModal, { AddCertificateFormValues } from '@/components/AddCertModal';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppSettings } from '@/components/providers/app-settings-provider';
import {
  getCertificateStatus,
  getCompanyStatusLabel,
  getCompliancePercentage,
  getStatusBadgeVariant,
  getSupabaseErrorMessage,
} from '@/lib/utils';
import type { Company } from '@/types';

type CompanyRow = Company & {
  certificates: Array<{
    id: string;
    expiry_date: string | null;
  }>;
};

const fileToBase64 = async (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });

export default function CompaniesPage() {
  const router = useRouter();
  const { expiryThreshold } = useAppSettings();
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyRow | null>(null);
  const [addingCertificate, setAddingCertificate] = useState(false);

  useEffect(() => {
    let active = true;

    const loadCompanies = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await serverFetchCompanies();

        if (!active) {
          return;
        }

        setCompanies((data as CompanyRow[]) ?? []);
      } catch (caughtError) {
        if (active) {
          setError(getSupabaseErrorMessage(caughtError, 'Unable to load companies.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadCompanies();

    return () => {
      active = false;
    };
  }, []);

  const handleCreateCompany = async () => {
    if (!companyName.trim()) {
      setError('Enter a company name.');
      return;
    }

    setCreatingCompany(true);
    setError(null);

    try {
      const company = await serverCreateCompany(companyName.trim());
      setCompanies((current) =>
        [...current, { ...company, certificates: [] }].sort((left, right) => left.name.localeCompare(right.name)),
      );
      setCreateOpen(false);
      setCompanyName('');

      await serverLogActivity({
        action: 'Company Added',
        entity: company.name,
        companyId: company.id,
        performedBy: 'internal-user',
      });
    } catch (caughtError) {
      setError(getSupabaseErrorMessage(caughtError, 'Unable to create company.'));
    } finally {
      setCreatingCompany(false);
    }
  };

  const handleAddCertificate = async (values: AddCertificateFormValues) => {
    if (!selectedCompany) {
      return;
    }

    setAddingCertificate(true);
    setError(null);

    try {
      let logoUrl: string | null = null;
      if (values.logoFile) {
        const base64 = await fileToBase64(values.logoFile);
        logoUrl = await serverUploadImage(
          'cert-logos',
          {
            base64,
            mimeType: values.logoFile.type,
            size: values.logoFile.size,
          },
          selectedCompany.id,
        );
      }

      const certificate = await serverCreateCertificate(
        selectedCompany.id,
        values.name,
        values.issuingBody || null,
        values.issueDate || null,
        values.expiryDate || null,
        logoUrl,
      );

      setCompanies((current) =>
        current.map((company) =>
          company.id === selectedCompany.id
            ? {
                ...company,
                certificates: [...company.certificates, { id: certificate.id, expiry_date: certificate.expiry_date }],
              }
            : company,
        ),
      );

      await serverLogActivity({
        action: 'Certificate Added',
        entity: `${selectedCompany.name} - ${certificate.name}`,
        companyId: selectedCompany.id,
        certId: certificate.id,
        performedBy: 'internal-user',
      });

      if (logoUrl) {
        await serverLogActivity({
          action: 'Certificate Logo Updated',
          entity: `${selectedCompany.name} - ${certificate.name}`,
          companyId: selectedCompany.id,
          certId: certificate.id,
          performedBy: 'internal-user',
        });
      }

      setCertificateModalOpen(false);
      setSelectedCompany(null);
    } catch (caughtError) {
      setError(getSupabaseErrorMessage(caughtError, 'Unable to add certificate.'));
    } finally {
      setAddingCertificate(false);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="page-eyebrow">Companies</p>
            <h1 className="text-[28px] font-bold tracking-[-0.5px] text-[#1D1D1F]">Company directory</h1>
            <p className="mt-2 text-[15px] text-[#6E6E73]">
              Browse company compliance status, logo assets, and certificate coverage.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Company
          </Button>
        </section>

        {error ? (
          <Card className="border-[#FFC5C1] bg-[#FFECEB]">
            <p className="text-sm text-[#7A0000]">{error}</p>
          </Card>
        ) : null}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-52 animate-pulse rounded-[16px] border border-[#E5E5E5] bg-white" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {companies.map((company, index) => {
              const companyStatus = getCompanyStatusLabel(company.certificates, expiryThreshold);
              const variant = getStatusBadgeVariant(companyStatus);
              const activeCount = company.certificates.filter(
                (certificate) => getCertificateStatus(certificate.expiry_date, expiryThreshold) === 'active',
              ).length;
              const percentage = getCompliancePercentage(company.certificates, expiryThreshold);

              return (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                >
                  <Card className="h-full">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {company.logo_url ? (
                          <div
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '16px',
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
                              src={company.logo_url}
                              alt={`${company.name} logo`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                objectPosition: 'center',
                                padding: '4px'
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F5F7]">
                            <Building2 className="h-7 w-7 text-[#6E6E73]" />
                          </div>
                        )}
                        <div>
                          <h2 className="text-[20px] font-semibold text-[#1D1D1F]">{company.name}</h2>
                          <p className="mt-1 text-sm text-[#6E6E73]">
                            {company.certificates.length} certificate{company.certificates.length === 1 ? '' : 's'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="mt-2 h-5 w-5 text-[#6E6E73]" />
                    </div>

                    <div className="mt-8">
                      <Badge variant={variant}>{companyStatus}</Badge>
                    </div>

                    <div className="mt-6 rounded-[16px] border border-[#E5E5E5] bg-[#F5F5F7] px-4 py-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6E6E73]">Active certificates</span>
                        <span className="font-medium text-[#1D1D1F]">
                          {activeCount}/{company.certificates.length}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => router.push(`/companies/${company.id}`)}>
                        Open
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setSelectedCompany(company);
                          setCertificateModalOpen(true);
                        }}
                      >
                        Add Certificate
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {!companies.length ? (
              <Card className="md:col-span-2 xl:col-span-3">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[1.75rem] bg-[#F5F5F7]">
                    <Building2 className="h-7 w-7 text-[#6E6E73]" />
                  </div>
                  <h2 className="mt-5 text-[20px] font-semibold text-[#1D1D1F]">No companies yet</h2>
                  <p className="mt-2 max-w-md text-sm text-[#6E6E73]">
                    Add company records in Supabase and they will appear here automatically.
                  </p>
                  <Button className="mt-6" onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Company
                  </Button>
                </div>
              </Card>
            ) : null}
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md rounded-[24px] border border-[#E5E5E5] bg-white p-0">
          <DialogHeader className="border-b border-[#E5E5E5] px-6 py-5">
            <DialogTitle className="text-2xl font-semibold tracking-tight">Create Company</DialogTitle>
            <DialogDescription className="text-[14px] text-[#6E6E73]">
              Add a new company record and start tracking its certificates.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D1D1F]">Company Name</label>
              <Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Acme Corporation" />
            </div>
          </div>

          <DialogFooter className="border-t border-[#E5E5E5] px-6 py-5">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleCreateCompany()} disabled={creatingCompany}>
              {creatingCompany ? 'Creating...' : 'Create Company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddCertModal
        open={certificateModalOpen}
        onOpenChange={(open) => {
          setCertificateModalOpen(open);
          if (!open) {
            setSelectedCompany(null);
          }
        }}
        isSubmitting={addingCertificate}
        onSave={handleAddCertificate}
      />
    </>
  );
}
