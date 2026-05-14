'use client';

import { FormEvent, useEffect, useState } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface AddCertificateFormValues {
  name: string;
  issuingBody: string;
  issueDate: string;
  expiryDate: string;
  logoFile: File | null;
}

interface AddCertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: AddCertificateFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const initialState: AddCertificateFormValues = {
  name: '',
  issuingBody: '',
  issueDate: '',
  expiryDate: '',
  logoFile: null,
};

export default function AddCertModal({ open, onOpenChange, onSave, isSubmitting }: AddCertModalProps) {
  const [values, setValues] = useState<AddCertificateFormValues>(initialState);

  useEffect(() => {
    if (!open) {
      setValues(initialState);
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSave(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[24px] border border-[#E5E5E5] bg-white p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-[#E5E5E5] px-6 py-5">
            <DialogTitle className="text-2xl font-semibold tracking-tight">Add Certificate</DialogTitle>
            <DialogDescription className="text-[14px] text-[#6E6E73]">
              Capture certificate details and upload an optional logo asset stored in Supabase.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
            <Field label="Certificate Name">
              <Input
                required
                value={values.name}
                onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
              />
            </Field>
            <Field label="Issuing Body">
              <Input
                required
                value={values.issuingBody}
                onChange={(event) => setValues((current) => ({ ...current, issuingBody: event.target.value }))}
              />
            </Field>
            <Field label="Issue Date">
              <Input
                required
                type="date"
                value={values.issueDate}
                onChange={(event) => setValues((current) => ({ ...current, issueDate: event.target.value }))}
              />
            </Field>
            <Field label="Expiry Date">
              <Input
                required
                type="date"
                value={values.expiryDate}
                onChange={(event) => setValues((current) => ({ ...current, expiryDate: event.target.value }))}
              />
            </Field>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-[#1D1D1F]">Certificate Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    logoFile: event.target.files?.[0] ?? null,
                  }))
                }
                className="block w-full rounded-xl border border-[#D2D2D7] bg-white px-4 py-3 text-sm text-[#1D1D1F]"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-[#E5E5E5] px-6 py-5">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Certificate'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#1D1D1F]">{label}</label>
      {children}
    </div>
  );
}
