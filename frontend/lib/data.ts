import { getSupabaseClient as getNullableSupabaseClient } from '@/lib/supabase';
import type { Company, Certificate, LogEntry } from '@/types';

const getSupabaseClient = () => {
  const client = getNullableSupabaseClient();

  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  return client;
};

/**
 * Store these fields as plain text, not HTML.
 * Strip tags/control chars, normalize whitespace, and cap length.
 */
const clean = (s: string) =>
  s
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);

interface LogActivityInput {
  action: string;
  entity?: string | null;
  companyId?: string | null;
  certId?: string | null;
  performedBy?: string | null;
}

export async function logActivity({
  action,
  entity,
  companyId,
  certId,
  performedBy,
}: LogActivityInput) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('logs').insert({
    action,
    entity: entity || null,
    company_id: companyId || null,
    cert_id: certId || null,
    performed_by: performedBy || null,
  });

  if (error) {
    throw error;
  }
}

/**
 * Validates image magic bytes to prevent MIME-type spoofing
 */
async function validateImageHeader(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  // PNG, JPEG, WebP, SVG signatures
  return /^(89504e47|ffd8ff|52494646|3c737667|3c3f786d)/.test(hex);
}

export async function uploadImage(bucket: 'company-logos' | 'cert-logos', file: File, scopeId: string) {
  // 1. Enforce size limit (2MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('File size exceeds 2MB limit.');
  }

  // 2. Validate magic bytes
  const isValid = await validateImageHeader(file);
  if (!isValid) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed.');
  }

  const supabase = getSupabaseClient();
  const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
  
  // 3. Randomize filename to prevent path traversal or overwrites
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const filePath = `${scopeId}/${fileName}`;

  const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

// ==== COMPANIES ====
export async function fetchCompanies(): Promise<Company[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, logo_url, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchCompanyById(id: string): Promise<Company | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, logo_url, created_at')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  return data;
}

export async function createCompany(name: string, logoUrl?: string | null): Promise<Company> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('companies')
    .insert([{ name: clean(name), logo_url: logoUrl || null }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCompanyName(id: string, name: string): Promise<Company> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('companies')
    .update({ name: clean(name) })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCompanyLogo(id: string, logoUrl: string): Promise<Company> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('companies')
    .update({ logo_url: logoUrl })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCompany(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('companies').delete().eq('id', id);

  if (error) throw error;
}

// ==== CERTIFICATES ====
export async function fetchCertificatesByCompanyId(companyId: string): Promise<Certificate[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('certificates')
    .select('id, company_id, name, issuing_body, issue_date, expiry_date, status, logo_url, created_at')
    .eq('company_id', companyId)
    .order('expiry_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchAllCertificates(): Promise<Certificate[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('certificates')
    .select('id, company_id, name, issuing_body, issue_date, expiry_date, status, logo_url, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchCertificateById(id: string): Promise<Certificate | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('certificates')
    .select('id, company_id, name, issuing_body, issue_date, expiry_date, status, logo_url, created_at')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createCertificate(
  companyId: string,
  name: string,
  issuingBody: string | null,
  issueDate: string | null,
  expiryDate: string | null,
  logoUrl: string | null,
): Promise<Certificate> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('certificates')
    .insert([
      {
        company_id: companyId,
        name: clean(name),
        issuing_body: issuingBody ? clean(issuingBody) : null,
        issue_date: issueDate || null,
        expiry_date: expiryDate || null,
        logo_url: logoUrl || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCertificate(id: string): Promise<Certificate | null> {
  const cert = await fetchCertificateById(id);
  if (!cert) return null;

  const supabase = getSupabaseClient();
  const { error } = await supabase.from('certificates').delete().eq('id', id);

  if (error) throw error;
  return cert;
}

export async function insertCertificate(cert: Certificate): Promise<Certificate> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('certificates')
    .insert([cert])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==== SETTINGS ====
export async function fetchSettings(): Promise<Record<string, string>> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('settings').select('*');
  // Settings are keys - selective select not applicable to key/value pairs
  if (error) throw error;

  const result: Record<string, string> = {};
  (data || []).forEach((row: { key: string; value: string }) => {
    result[row.key] = row.value;
  });
  return result;
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value: clean(value) }, { onConflict: 'key' });

  if (error) throw error;
}

// ==== LOGS ====
export async function fetchLogs(limit = 20, offset = 0): Promise<{ data: LogEntry[]; total: number }> {
  const supabase = getSupabaseClient();

  const { data, error, count } = await supabase
    .from('logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data: data || [], total: count || 0 };
}

export async function fetchLogsByAction(
  action: string,
  limit = 20,
  offset = 0,
): Promise<{ data: LogEntry[]; total: number }> {
  const supabase = getSupabaseClient();

  const { data, error, count } = await supabase
    .from('logs')
    .select('*', { count: 'exact' })
    .eq('action', action)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data: data || [], total: count || 0 };
}

export async function fetchLogsByCompany(
  companyId: string,
  limit = 20,
  offset = 0,
): Promise<{ data: LogEntry[]; total: number }> {
  const supabase = getSupabaseClient();

  const { data, error, count } = await supabase
    .from('logs')
    .select('*', { count: 'exact' })
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data: data || [], total: count || 0 };
}

export async function fetchAllLogs(): Promise<LogEntry[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
