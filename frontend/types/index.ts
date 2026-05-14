export interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
}

export interface Certificate {
  id: string;
  company_id: string;
  name: string;
  issuing_body: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  status?: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface CompanyWithCertificates extends Company {
  certificates: Certificate[];
}

export interface LogEntry {
  id: string;
  action: string;
  entity: string | null;
  company_id: string | null;
  cert_id: string | null;
  performed_by: string | null;
  created_at: string;
}

export interface Settings {
  app_name?: string;
  expiry_threshold?: string;
}
