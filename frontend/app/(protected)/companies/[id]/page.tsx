'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Building2, ImagePlus, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import {
  serverCreateCertificate,
  serverDeleteCertificate,
  serverDeleteCompany,
  serverFetchCertificatesByCompany,
  serverFetchCompanyById,
  serverInsertCertificate,
  serverLogActivity,
  serverUpdateCompanyLogo,
  serverUpdateCompanyName,
  serverUploadImage,
} from '@/app/actions/db';
import AddCertModal, { AddCertificateFormValues } from '@/components/AddCertModal';
import BackButton from '@/components/BackButton';
import CertTable from '@/components/CertTable';
import ComplianceBar from '@/components/ComplianceBar';
import UndoToast from '@/components/UndoToast';
import { useAppSettings } from '@/components/providers/app-settings-provider';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Input from '@/components/ui/input';
import {
  getCertificateInsertPayload,
  getCertificateStatus,
  getCompliancePercentage,
  getSupabaseErrorMessage, sanitizeInput,
} from '@/lib/utils'; // Import sanitizeInput from utils
import type { Certificate, Company } from '@/types';

const fileToBase64 = async (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { expiryThreshold } = useAppSettings();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const undoTimeoutRef = useRef<number | null>(null);
  const deletedCertificateRef = useRef<Certificate | null>(null);
  const deletedCompanyRef = useRef<Company | null>(null); // New ref for company undo

  const [company, setCompany] = useState<Company | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [addingCertificate, setAddingCertificate] = useState(false);
  const [undoVisible, setUndoVisible] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [certDeleteConfirmOpen, setCertDeleteConfirmOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState<Certificate | null>(null);

  useEffect(() => {
    let active = true;

    const loadCompany = async () => {
      setLoading(true);
      setError(null);

      try {
        const companyId = params.id;
        const [companyData, certificateData] = await Promise.all([
          serverFetchCompanyById(companyId),
          serverFetchCertificatesByCompany(companyId),
        ]);

        if (!active) {
          return;
        }

        setCompany(companyData);
        setEditingName(companyData?.name ?? '');
        setCertificates(certificateData ?? []);
      } catch (caughtError) {
        if (active) {
          setError(getSupabaseErrorMessage(caughtError, 'Unable to load company details.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadCompany();

    return () => {
      active = false;
      if (undoTimeoutRef.current) {
        window.clearTimeout(undoTimeoutRef.current);
      }
    };
  }, [params.id]);

  const activeCount = useMemo(
    () => certificates.filter((certificate) => getCertificateStatus(certificate.expiry_date, expiryThreshold) === 'active').length,
    [certificates, expiryThreshold],
  );
  const compliance = useMemo(() => getCompliancePercentage(certificates, expiryThreshold), [certificates, expiryThreshold]);

  const handleNameSave = async () => {
    if (!company || !editingName.trim() || editingName.trim() === company.name) {
      setEditingName(company?.name ?? '');
      return;
    }

    setSavingName(true);
    setError(null);

    try {
      const nextName = sanitizeInput(editingName);
      const updatedCompany = await serverUpdateCompanyName(company.id, nextName);
      setCompany(updatedCompany);
      setEditingName(updatedCompany.name);
      await serverLogActivity({
        action: 'Company Name Updated',
        entity: `${company.name} -> ${nextName}`,
        companyId: company.id,
      });
    } catch (caughtError) {
      setError(getSupabaseErrorMessage(caughtError, 'Unable to update company name.'));
      setEditingName(company.name);
    } finally {
      setSavingName(false);
    }
  };

  const handleCompanyLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !company) {
      return;
    }

    setLogoUploading(true);
    setError(null);

    try {
      const base64 = await fileToBase64(file);
      const logoUrl = await serverUploadImage(
        'company-logos',
        { base64, mimeType: file.type, size: file.size },
        company.id,
      );
      const updatedCompany = await serverUpdateCompanyLogo(company.id, logoUrl);

      setCompany(updatedCompany);
      await serverLogActivity({
        action: 'Company Logo Updated',
        entity: company.name,
        companyId: company.id,
      });
    } catch (caughtError) {
      setError(getSupabaseErrorMessage(caughtError, 'Unable to upload company logo.'));
    } finally {
      setLogoUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteCompany = async () => {
    if (!company) {
      return;
    }

    setDeletingCompany(true);
    setDeleteConfirmOpen(false);
    setError(null);

    // Store the company for potential undo
    deletedCompanyRef.current = company;
    // Visually remove the company and its certificates from the page immediately
    setCompany(null);
    setCertificates([]);

    setUndoVisible(true);

    if (undoTimeoutRef.current) {
      window.clearTimeout(undoTimeoutRef.current);
    }

    undoTimeoutRef.current = window.setTimeout(async () => {
      try {
        if (deletedCompanyRef.current) { // Ensure it hasn't been undone
          await serverDeleteCompany(deletedCompanyRef.current.id);
          await serverLogActivity({
            action: 'Company Deleted',
            entity: deletedCompanyRef.current.name,
            companyId: deletedCompanyRef.current.id,
          });
        }
      } catch (caughtError) {
        console.error('Failed to permanently delete company after undo window:', caughtError);
        setError(getSupabaseErrorMessage(caughtError, 'Failed to permanently delete company.'));
      } finally {
        router.push('/companies'); // Redirect after the undo window or permanent delete
        setDeletingCompany(false);
      }
    }, 5000);
  };

  const handleAddCertificate = async (values: AddCertificateFormValues) => {
    if (!company) {
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
          { base64, mimeType: values.logoFile.type, size: values.logoFile.size },
          company.id,
        );
      }

      const data = await serverCreateCertificate(
        company.id,
        values.name,
        values.issuingBody || null,
        values.issueDate || null,
        values.expiryDate || null,
        logoUrl,
      );

      setCertificates((current) => sortCertificates([...current, data]));
      setModalOpen(false);

      await serverLogActivity({
        action: 'Certificate Added',
        entity: `${company.name} - ${data.name}`,
        companyId: company.id,
        certId: data.id,
      });

      if (logoUrl) {
        await serverLogActivity({
          action: 'Certificate Logo Updated',
          entity: `${company.name} - ${data.name}`,
          companyId: company.id,
          certId: data.id,
        });
      }
    } catch (caughtError) {
      setError(getSupabaseErrorMessage(caughtError, 'Unable to add certificate.'));
    } finally {
      setAddingCertificate(false);
    }
  };

  const handleDeleteCertificate = (certificate: Certificate) => {
    setCertToDelete(certificate);
    setCertDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteCertificate = async () => {
    if (!company || !certToDelete) {
      return;
    }

    const certificate = certToDelete;
    setCertDeleteConfirmOpen(false);
    setCertToDelete(null);
    setError(null);
    setCertificates((current) => current.filter((item) => item.id !== certificate.id));

    try {
      const deletedCertificate = await serverDeleteCertificate(certificate.id);
      if (!deletedCertificate) {
        throw new Error('Certificate not found.');
      }

      await serverLogActivity({
        action: 'Certificate Deleted',
        entity: `${company.name} - ${certificate.name}`,
        companyId: company.id,
        certId: certificate.id,
      });
    } catch (caughtError) {
      setCertificates((current) => sortCertificates([...current, certificate]));
      setError(getSupabaseErrorMessage(caughtError, 'Unable to delete certificate.'));
    }
  };

  const handleUndoDelete = async () => {
    setUndoing(true);
    setError(null);

    if (undoTimeoutRef.current) {
      window.clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }

    try {
      if (deletedCertificateRef.current) {
        const payload = getCertificateInsertPayload(deletedCertificateRef.current);
        const data = await serverInsertCertificate(payload);
        setCertificates((current) => sortCertificates([...current, data]));
        await serverLogActivity({
          action: 'Certificate Deletion Undone',
          entity: `${company?.name} - ${data.name}`,
          companyId: company?.id,
          certId: data.id,
        });
        deletedCertificateRef.current = null;
      } else if (deletedCompanyRef.current) {
        setCompany(deletedCompanyRef.current);
        const certificateData = await serverFetchCertificatesByCompany(deletedCompanyRef.current.id);
        setCertificates(certificateData);
        await serverLogActivity({
          action: 'Company Deletion Undone',
          entity: deletedCompanyRef.current.name,
          companyId: deletedCompanyRef.current.id,
        });
        deletedCompanyRef.current = null;
      }
    } catch (caughtError) {
      setError(getSupabaseErrorMessage(caughtError, 'Unable to restore.'));
    } finally {
      setUndoing(false);
      setUndoVisible(false);
      setDeletingCompany(false); // Reset deleting state
    }
  };

  if (loading) {
    return <CompanyDetailSkeleton />;
  }

  return (
    <>
      {!company ? (
        <Card>
          <p className="text-sm text-[#6E6E73]">Company not found.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          <BackButton label="Companies" />
          <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-5">
            {company.logo_url ? (
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '28px',
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
                    padding: '6px'
                  }}
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-[#F5F5F7]">
                <Building2 className="h-10 w-10 text-[#6E6E73]" />
              </div>
            )}

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  onBlur={() => {
                    void handleNameSave();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  className="min-w-[240px] border-transparent bg-transparent px-0 py-0 text-[28px] font-bold tracking-[-0.5px] text-[#1D1D1F] focus:border-transparent focus:ring-0"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                void handleCompanyLogoUpload(event);
              }}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={logoUploading}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              {logoUploading ? 'Uploading Logo...' : 'Upload Logo'}
            </Button>
            <Button
              variant="outline"
              className="border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={deletingCompany}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deletingCompany ? 'Deleting...' : 'Delete Company'}</Button>
            <Button onClick={() => setModalOpen(true)}>Add Certificate</Button>
          </div>
        </section>

        {error ? (
          <Card className="border-[#FFC5C1] bg-[#FFECEB]">
            <p className="text-sm text-[#7A0000]">{error}</p>
          </Card>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <p className="label-caps">Status Overview</p>
            <h1 className="mt-2 text-[28px] font-bold tracking-[-0.5px] text-[#1D1D1F]">{company.name}</h1>
            <p className="mt-2 text-sm text-[#6E6E73]">
              {activeCount} of {certificates.length} certificates are active
            </p>
          </Card>

          <Card>
            <div className="grid gap-4 md:grid-cols-3">
              <MetricTile label="Total Certificates" value={String(certificates.length)} />
              <MetricTile label="Active" value={String(activeCount)} />
              <MetricTile
                label="Needs Attention"
                value={String(
                  certificates.filter((certificate) => getCertificateStatus(certificate.expiry_date, expiryThreshold) !== 'active').length,
                )}
              />
            </div>
          </Card>
        </section>

        <section>
          <Card>
            <div>
              <p className="label-caps">Certificates</p>
              <h2 className="mt-2 text-[20px] font-semibold text-[#1D1D1F]">Certificate registry</h2>
            </div>
            <div className="mt-6">
              <CertTable certificates={certificates} expiryThreshold={expiryThreshold} onDelete={handleDeleteCertificate} />
            </div>
          </Card>
        </section>
      </div>
      )}

      <AddCertModal open={modalOpen} onOpenChange={setModalOpen} isSubmitting={addingCertificate} onSave={handleAddCertificate} />

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-[400px] rounded-[32px] border border-[#E5E5E5] bg-white p-8 overflow-hidden shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#FFF1F0]">
              <Trash2 className="h-10 w-10 text-[#FF3B30]" />
            </div>
            
            <DialogHeader className="mb-8 space-y-3 p-0">
              <DialogTitle className="text-2xl font-bold tracking-tight text-[#1D1D1F]">Delete this item?</DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed text-[#6E6E73]">
                This action cannot be undone. The item will be permanently removed.
              </DialogDescription>
            </DialogHeader>

            <div className="flex w-full flex-col gap-3">
              <Button 
                className="h-14 w-full rounded-2xl bg-[#FF3B30] text-[17px] font-semibold text-white transition-all hover:bg-[#D70015] active:scale-[0.98]" 
                onClick={() => void handleDeleteCompany()}
              >
                Delete
              </Button>
              <Button 
                variant="ghost" 
                className="h-14 w-full rounded-2xl text-[17px] font-medium text-[#6E6E73] transition-all hover:bg-[#F5F5F7] active:scale-[0.98]"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={certDeleteConfirmOpen} onOpenChange={setCertDeleteConfirmOpen}>
        <DialogContent className="max-w-[400px] rounded-[32px] border border-[#E5E5E5] bg-white p-8 overflow-hidden shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#FFF1F0]">
              <Trash2 className="h-10 w-10 text-[#FF3B30]" />
            </div>
            
            <DialogHeader className="mb-8 space-y-3 p-0">
              <DialogTitle className="text-2xl font-bold tracking-tight text-[#1D1D1F]">Delete this item?</DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed text-[#6E6E73]">
                This action cannot be undone. The item will be permanently removed.
              </DialogDescription>
            </DialogHeader>

            <div className="flex w-full flex-col gap-3">
              <Button 
                className="h-14 w-full rounded-2xl bg-[#FF3B30] text-[17px] font-semibold text-white transition-all hover:bg-[#D70015] active:scale-[0.98]" 
                onClick={() => void handleConfirmDeleteCertificate()}
              >
                Delete
              </Button>
              <Button 
                variant="ghost" 
                className="h-14 w-full rounded-2xl text-[17px] font-medium text-[#6E6E73] transition-all hover:bg-[#F5F5F7] active:scale-[0.98]"
                onClick={() => {
                  setCertDeleteConfirmOpen(false);
                  setCertToDelete(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UndoToast open={undoVisible} onUndo={handleUndoDelete} undoing={undoing} />
    </>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[#E5E5E5] bg-[#F5F5F7] px-4 py-5">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[#6E6E73]">{label}</p>
      <p className="mt-4 text-[40px] font-bold tracking-[-1px] text-[#1D1D1F]">{value}</p>
    </div>
  );
}

function sortCertificates(certificates: Certificate[]) {
  return [...certificates].sort((left, right) => {
    const leftTime = left.expiry_date ? new Date(left.expiry_date).getTime() : Number.MAX_SAFE_INTEGER;
    const rightTime = right.expiry_date ? new Date(right.expiry_date).getTime() : Number.MAX_SAFE_INTEGER;

    return leftTime - rightTime;
  });
}

function CompanyDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-32 animate-pulse rounded-[16px] border border-[#E5E5E5] bg-white" />
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="h-52 animate-pulse rounded-[16px] border border-[#E5E5E5] bg-white" />
        <div className="h-52 animate-pulse rounded-[16px] border border-[#E5E5E5] bg-white" />
      </div>
      <div className="h-80 animate-pulse rounded-[16px] border border-[#E5E5E5] bg-white" />
    </div>
  );
}
