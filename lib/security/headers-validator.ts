import { NextRequest } from 'next/server';

export async function validateHeaders(req: NextRequest) {
  const requiredHeaders = {
    'user-agent': 'Mozilla/.*',
    'accept': 'application/json',
    'content-type': 'application/json',
  };

  for (const [header, pattern] of Object.entries(requiredHeaders)) {
    const value = req.headers.get(header);
    if (!value || !new RegExp(pattern).test(value)) {
      return {
        valid: false,
        message: 'Invalid request headers',
        statusCode: 400
      };
    }
  }

  return { valid: true };
}