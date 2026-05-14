# Production Deployment Checklist

### Security
- [ ] **Rotate Hashes**: Update `lib/auth-config.ts` with 4 new unique 10-char hashes.
- [ ] **Environment**: Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your CI/CD.
- [ ] **Supabase Origins**: Go to Supabase -> API Settings -> Allowed Origins and set your production domain (e.g., `https://tracker.yourdomain.com`).
- [ ] **RLS Check**: Run the SQL hardening script to ensure Row Level Security and log immutability are active.
- [ ] **Audit**: Run `npm run audit` to ensure no high-severity vulnerabilities in dependencies.

### Performance
- [ ] **Compression**: Verify the hosting platform (Vercel/Netlify) uses Brotli/Gzip.
- [ ] **CDN**: Ensure Supabase Storage assets are being served via CDN (default for Supabase).

### Maintenance
- [ ] **Backups**: Enable daily backups in Supabase project settings.