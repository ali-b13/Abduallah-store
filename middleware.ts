// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Explicitly configure the matcher
export const config = {
  matcher: [
    '/admin-panel/:path*',
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
  ],
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const response = NextResponse.next();

  try {
    // Admin panel protection
    if (path.startsWith('/admin-panel')) {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET!,
      });

      if (!token?.isAdmin) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Security headers for admin panel
   
    }

    // Common security headers for all routes
    

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}