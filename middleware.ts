// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/admin-panel')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET!,
    });

    if (!token?.isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const response = NextResponse.next();
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'", // Required for Next.js development
        "style-src 'self' 'unsafe-inline' https://fonts.cdnfonts.com", // Allow fonts CDN
        "font-src 'self' https://fonts.cdnfonts.com data:", // Font sources
        "img-src 'self' data: blob:",
        "connect-src 'self'",
        "frame-src 'none'",
        "object-src 'none'",
        "form-action 'self'"
      ].join('; ')
    );

    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');

    return response;
  }
}