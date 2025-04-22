import { NextRequest } from "next/server";

export const createSecurityHeaders = (req: NextRequest) => {
    const origin = req.headers.get('origin') || '';
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    const isAllowedOrigin = allowedOrigins.includes(origin);
  
    return {
      'Access-Control-Allow-Origin': isAllowedOrigin ? origin : '*',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    } as Record<string, string>;
  };
