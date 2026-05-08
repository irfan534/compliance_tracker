'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface CertificationFormData {
  name: string;
  issueDate: string;
  expiryDate: string;
  issuingBody: string;
  owner?: string;
  description?: string;
  logo?: File;
}

interface AddCertificationDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export default function AddCertificationDialog({ children, onSuccess }: AddCertificationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CertificationFormData>({
    name: '',
    issueDate: '',
    expiryDate: '',
    issuingBody: '',
    owner: '',
    description: '',
    logo: undefined,
  });

  const handleInputChange = (field: keyof CertificationFormData, value: string | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // TODO: Implement API call to create certification
      console.log('Creating certification:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOpen(false);
      setFormData({
        name: '',
        issueDate: '',
        expiryDate: '',
        issuingBody: '',
        owner: '',
        description: '',
        logo: undefined,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Error creating certification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Certification</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Certification Name *
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., ISO 27001"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="issuingBody" className="text-sm font-medium">
              Issuing Body *
            </label>
            <Input
              id="issuingBody"
              value={formData.issuingBody}
              onChange={(e) => handleInputChange('issuingBody', e.target.value)}
              placeholder="e.g., Certification Body Inc."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="issueDate" className="text-sm font-medium">
                Issue Date *
              </label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => handleInputChange('issueDate', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="expiryDate" className="text-sm font-medium">
                Expiry Date *
              </label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="owner" className="text-sm font-medium">
              Owner
            </label>
            <Input
              id="owner"
              value={formData.owner}
              onChange={(e) => handleInputChange('owner', e.target.value)}
              placeholder="e.g., John Doe"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="logo" className="text-sm font-medium">
              Logo
            </label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleInputChange('logo', file);
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Upload a logo image (PNG, JPG, etc.)
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Certification'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
