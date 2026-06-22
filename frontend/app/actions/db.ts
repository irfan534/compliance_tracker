'use server';

import { getServerSupabaseClient } from '@/lib/supabase-server';
import { getSupabaseServerClient } from '@/lib/supabase-server-auth';
import type { Certificate, Company, LogEntry } from '@/types';

const MAX_TEXT_LENGTH = 500;
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/**
 * SECURITY GATE: Verifies that the current session user has access to a company.
 * Prevents IDOR when using the Service Role client.
 */
async function requireAuthenticatedUser() {
  const authClient = await getSupabaseServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  return user;
}

async function verifyMembership(companyId: string) {
  const user = await requireAuthenticatedUser();
  const serviceClient = getServerSupabaseClient();
  const { data } = await serviceClient
    .from('companies')
    .select('id, owner_id, company_members(user_id)')
    .eq('id', companyId)
    .single();

  const isOwner = data?.owner_id === user.id;
  const isMember = data?.company_members?.some((m: any) => m.user_id === user.id);

  if (!isOwner && !isMember) {
    throw new Error('Forbidden: You do not have access to this company.');
  }
  return user;
}

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

type StorageBucket = 'company-logos' | 'cert-logos';

const parseLogoValue = (value: string | null) => {
  if (!value) {
    return null;
  }

  const storageUrlMatch = value.match(
    /^https:\/\/[^/]+\/storage\/v1\/object\/public\/(company-logos|cert-logos)\/(.+)$/,
  );

  if (storageUrlMatch) {
    return {
      bucket: storageUrlMatch[1] as StorageBucket,
      path: storageUrlMatch[2],
    };
  }

  const pathMatch = value.match(/^(company-logos|cert-logos)\/(.+)$/);
  if (pathMatch) {
    return {
      bucket: pathMatch[1] as StorageBucket,
      path: pathMatch[2],
    };
  }

  return null;
};

const resolveLogoUrl = async (value: string | null, bucketHint?: StorageBucket) => {
  if (!value) {
    return null;
  }

  try {
    const supabase = getServerSupabaseClient();
    const parsed = parseLogoValue(value);

    if (parsed) {
      const { data, error } = await supabase.storage.from(parsed.bucket).createSignedUrl(parsed.path, 60 * 60);
      if (error || !data?.signedUrl) {
        return value;
      }

      return data.signedUrl;
    }

    if (bucketHint && !value.startsWith('http')) {
      const { data, error } = await supabase.storage.from(bucketHint).createSignedUrl(value, 60 * 60);
      if (error || !data?.signedUrl) {
        return value;
      }

      return data.signedUrl;
    }

    return value;
  } catch {
    // Fallback to original URL if signing fails
    return value;
  }
};

const signCompanyLogo = async <T extends { logo_url: string | null } | null>(company: T) => {
  if (!company) {
    return company;
  }

  return {
    ...company,
    logo_url: await resolveLogoUrl(company.logo_url, 'company-logos'),
  } as T;
};

const signCertificateLogo = async <T extends { logo_url: string | null }>(certificate: T) => ({
  ...certificate,
  logo_url: await resolveLogoUrl(certificate.logo_url, 'cert-logos'),
});

export async function serverFetchCompanies() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, logo_url, created_at, certificates(id, expiry_date)')
    .order('name', { ascending: true })
    .limit(500);

  if (error) {
    throw error;
  }

  const companies = data ?? [];
  return await Promise.all(
    companies.map(async (company: Company) => signCompanyLogo(company)),
  );
}

export async function serverCreateCompany(name: string, logoUrl?: string | null) {
  const user = await requireAuthenticatedUser();

  const supabase = getServerSupabaseClient();
  const { data, error } = await supabase
    .from('companies')
    .insert([{ name: cleanText(name), logo_url: logoUrl || null, owner_id: user.id }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function serverDeleteCompany(id: string) {
  await verifyMembership(id);
  const supabase = getServerSupabaseClient();
  const { error } = await supabase.from('companies').delete().eq('id', id);

  if (error) {
    throw error;
  }
}

export async function serverUpdateCompanyName(id: string, name: string) {
  await requireAuthenticatedUser();
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
  await requireAuthenticatedUser();
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

  return await signCompanyLogo(data);
}

export async function serverFetchDashboard() {
  const supabase = await getSupabaseServerClient();
  const [certResponse, logsResponse] = await Promise.all([
    supabase
      .from('certificates')
      .select(
        'id, company_id, name, issuing_body, issue_date, expiry_date, status, logo_url, created_at, companies(name)',
      )
      .order('expiry_date', { ascending: true })
      .limit(200),
    supabase.from('logs').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  if (certResponse.error) {
    throw certResponse.error;
  }

  if (logsResponse.error) {
    throw logsResponse.error;
  }

  return {
    certificates: await Promise.all((certResponse.data ?? []).map(async (certificate) => signCertificateLogo(certificate))),
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
  await requireAuthenticatedUser();
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

  return await signCertificateLogo(data);
}

export async function serverDeleteCertificate(id: string) {
  await requireAuthenticatedUser();
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
  await requireAuthenticatedUser();
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

  return await signCertificateLogo(data);
}

export async function serverLogActivity(input: {
  action: string;
  entity?: string | null;
  companyId?: string | null;
  certId?: string | null;
  performedBy?: string | null;
}) {
  await requireAuthenticatedUser();
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
  const supabase = await getSupabaseServerClient();
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
  await requireAuthenticatedUser();
  const supabase = getServerSupabaseClient();
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value: cleanText(value) }, { onConflict: 'key' });

  if (error) {
    throw error;
  }
}

export async function serverFetchLogs(limit = 20, offset = 0): Promise<{ data: LogEntry[]; total: number }> {
  const supabase = await getSupabaseServerClient();
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
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from('logs').select('*').order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function serverFetchCompanyById(id: string) {
  const supabase = await getSupabaseServerClient();
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

  return await signCompanyLogo(data);
}

export async function serverFetchCertificatesByCompany(companyId: string) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from('certificates')
    .select('id, company_id, name, issuing_body, issue_date, expiry_date, status, logo_url, created_at')
    .eq('company_id', companyId)
    .order('expiry_date', { ascending: true })
    .limit(500);

  if (error) {
    throw error;
  }

  return await Promise.all((data ?? []).map(async (certificate) => signCertificateLogo(certificate)));
}

export async function serverUploadImage(
  bucket: 'company-logos' | 'cert-logos',
  fileData: { base64: string; mimeType: string; size: number },
  scopeId: string,
): Promise<string> {
  await requireAuthenticatedUser();

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

  return filePath;
}
