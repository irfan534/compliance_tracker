'use server';

import { getServerSupabaseClient } from '@/lib/supabase-server';
import type { Certificate, LogEntry } from '@/types';

const MAX_TEXT_LENGTH = 500;
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

const cleanText = (value: string) =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TEXT_LENGTH);

const cleanOptionalText = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const cleaned = cleanText(value);
  return cleaned || null;
};

export async function serverFetchCompanies() {
  const supabase = getServerSupabaseClient();
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, logo_url, created_at, certificates(id, expiry_date)')
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function serverCreateCompany(name: string, logoUrl?: string | null) {
  const supabase = getServerSupabaseClient();
  const { data, error } = await supabase
    .from('companies')
    .insert([{ name: cleanText(name), logo_url: logoUrl || null }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function serverDeleteCompany(id: string) {
  const supabase = getServerSupabaseClient();
  const { error } = await supabase.from('companies').delete().eq('id', id);

  if (error) {
    throw error;
  }
}

export async function serverUpdateCompanyName(id: string, name: string) {
  const supabase = getServerSupabaseClient();
  const { data, error } = await supabase
    .from('companies')
    .update({ name: cleanText(name) })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function serverUpdateCompanyLogo(id: string, logoUrl: string) {
  const supabase = getServerSupabaseClient();
  const { data, error } = await supabase
    .from('companies')
    .update({ logo_url: logoUrl })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function serverFetchDashboard() {
  const supabase = getServerSupabaseClient();
  const [certResponse, logsResponse] = await Promise.all([
    supabase
      .from('certificates')
      .select(
        'id, company_id, name, issuing_body, issue_date, expiry_date, status, logo_url, created_at, companies(name)',
      )
      .order('expiry_date', { ascending: true }),
    supabase.from('logs').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  if (certResponse.error) {
    throw certResponse.error;
  }

  if (logsResponse.error) {
    throw logsResponse.error;
  }

  return {
    certificates: certResponse.data ?? [],
    logs: logsResponse.data ?? [],
  };
}

export async function serverCreateCertificate(
  companyId: string,
  name: string,
  issuingBody: string | null,
  issueDate: string | null,
  expiryDate: string | null,
  logoUrl: string | null,
) {
  const supabase = getServerSupabaseClient();
  const { data, error } = await supabase
    .from('certificates')
    .insert([
      {
        company_id: companyId,
        name: cleanText(name),
        issuing_body: cleanOptionalText(issuingBody),
        issue_date: issueDate || null,
        expiry_date: expiryDate || null,
        logo_url: logoUrl || null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function serverDeleteCertificate(id: string) {
  const supabase = getServerSupabaseClient();
  const { data: cert, error: fetchError } = await supabase
    .from('certificates')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return null;
    }

    throw fetchError;
  }

  const { error } = await supabase.from('certificates').delete().eq('id', id);

  if (error) {
    throw error;
  }

  return cert;
}

export async function serverInsertCertificate(certificate: Certificate) {
  const supabase = getServerSupabaseClient();
  const { data, error } = await supabase
    .from('certificates')
    .insert([
      {
        id: certificate.id,
        company_id: certificate.company_id,
        name: cleanText(certificate.name),
        issuing_body: cleanOptionalText(certificate.issuing_body),
        issue_date: certificate.issue_date,
        expiry_date: certificate.expiry_date,
        logo_url: certificate.logo_url,
        created_at: certificate.created_at,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function serverLogActivity(input: {
  action: string;
  entity?: string | null;
  companyId?: string | null;
  certId?: string | null;
  performedBy?: string | null;
}) {
  const supabase = getServerSupabaseClient();
  const { error } = await supabase.from('logs').insert({
    action: cleanText(input.action),
    entity: cleanOptionalText(input.entity),
    company_id: input.companyId || null,
    cert_id: input.certId || null,
    performed_by: 'internal-user',
  });

  if (error) {
    throw error;
  }
}

export async function serverFetchSettings() {
  const supabase = getServerSupabaseClient();
  const { data, error } = await supabase.from('settings').select('*');

  if (error) {
    throw error;
  }

  const result: Record<string, string> = {};
  (data ?? []).forEach((row: { key: string; value: string }) => {
    result[row.key] = row.value;
  });

  return result;
}

export async function serverUpdateSetting(key: string, value: string) {
  const supabase = getServerSupabaseClient();
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value: cleanText(value) }, { onConflict: 'key' });

  if (error) {
    throw error;
  }
}

export async function serverFetchLogs(limit = 20, offset = 0): Promise<{ data: LogEntry[]; total: number }> {
  const supabase = getServerSupabaseClient();
  const { data, error, count } = await supabase
    .from('logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data: (data ?? []) as LogEntry[], total: count ?? 0 };
}

export async function serverFetchAllLogs() {
  const supabase = getServerSupabaseClient();
  const { data, error } = await supabase.from('logs').select('*').order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function serverFetchCompanyById(id: string) {
  const supabase = getServerSupabaseClient();
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, logo_url, created_at')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    throw error;
  }

  return data;
}

export async function serverFetchCertificatesByCompany(companyId: string) {
  const supabase = getServerSupabaseClient();
  const { data, error } = await supabase
    .from('certificates')
    .select('id, company_id, name, issuing_body, issue_date, expiry_date, status, logo_url, created_at')
    .eq('company_id', companyId)
    .order('expiry_date', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function serverUploadImage(
  bucket: 'company-logos' | 'cert-logos',
  fileData: { base64: string; mimeType: string; size: number },
  scopeId: string,
): Promise<string> {
  if (fileData.size > MAX_UPLOAD_BYTES) {
    throw new Error('File size exceeds 2MB limit.');
  }

  if (!ALLOWED_IMAGE_TYPES.includes(fileData.mimeType as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP allowed.');
  }

  const supabase = getServerSupabaseClient();
  const extension = fileData.mimeType.split('/')[1];
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const filePath = `${scopeId}/${fileName}`;
  const buffer = Buffer.from(fileData.base64, 'base64');

  const { error } = await supabase.storage.from(bucket).upload(filePath, buffer, {
    contentType: fileData.mimeType,
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function serverCheckLoginLock(ip: string): Promise<{
  isLocked: boolean;
  minutesRemaining: number;
}> {
  const record = loginAttempts.get(ip);
  if (!record) {
    return { isLocked: false, minutesRemaining: 0 };
  }

  if (Date.now() < record.lockedUntil) {
    const minutesRemaining = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    return { isLocked: true, minutesRemaining };
  }

  loginAttempts.delete(ip);
  return { isLocked: false, minutesRemaining: 0 };
}

export async function serverRecordFailedAttempt(ip: string): Promise<{
  isLocked: boolean;
  minutesRemaining: number;
  message: string;
}> {
  const record = loginAttempts.get(ip) ?? { count: 0, lockedUntil: 0 };

  if (Date.now() < record.lockedUntil) {
    const minutesRemaining = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    return {
      isLocked: true,
      minutesRemaining,
      message: `Locked for ${minutesRemaining} more minute(s).`,
    };
  }

  record.count += 1;

  if (record.count >= 15) {
    record.lockedUntil = Date.now() + 24 * 60 * 60 * 1000;
    loginAttempts.set(ip, record);
    return {
      isLocked: true,
      minutesRemaining: 1440,
      message: 'Too many attempts. Locked for 24 hours.',
    };
  }

  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000;
    loginAttempts.set(ip, record);
    return {
      isLocked: true,
      minutesRemaining: 15,
      message: 'Too many attempts. Try again in 15 minutes.',
    };
  }

  loginAttempts.set(ip, record);
  return { isLocked: false, minutesRemaining: 0, message: '' };
}

export async function serverClearLoginAttempts(ip: string): Promise<void> {
  loginAttempts.delete(ip);
}
