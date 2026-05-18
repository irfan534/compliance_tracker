import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 1. Content Security Policy (CSP) Configuration
  // Includes: Next.js scripts, Supabase API/Storage, and Vercel analytics
  // IMPORTANT: If adding new third-party scripts (e.g., Google Analytics, other CDNs),
  // ensure their domains are added to the appropriate CSP directives (e.g., script-src, connect-src)
  // to avoid blocking them.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseWsHost = supabaseUrl.replace('https://', '');

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: ${supabaseUrl};
    font-src 'self' data: https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' ${supabaseUrl} https://*.supabase.co wss://${supabaseWsHost};
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  // 2. Security Headers Map
  const securityHeaders = {
    'Content-Security-Policy': cspHeader,
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  };

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Apply security headers to response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    supabaseResponse.headers.set(key, value);
  });

  // 3. Information Disclosure Hardening
  // Remove Next.js powered-by header if present
  supabaseResponse.headers.delete('x-powered-by');

  // Refresh session — MUST be called before any redirect logic
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Unauthenticated user trying to access a protected route → redirect to login
  if (!user && pathname !== '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Authenticated user visiting login → redirect to dashboard
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // 4. Cache Control for Authenticated Routes
  // Prevent caching of sensitive dashboard/company data
  if (user && (pathname.startsWith('/dashboard') || pathname.startsWith('/companies') || pathname.startsWith('/logs'))) {
    supabaseResponse.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    supabaseResponse.headers.set('Pragma', 'no-cache');
    supabaseResponse.headers.set('Expires', '0');
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.jpeg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
