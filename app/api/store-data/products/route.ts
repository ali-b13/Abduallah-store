// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/database/prisma"
import { ratelimit } from '@/lib/security/rate-limiter';
import { validateHeaders } from '@/lib/security/headers-validator';
import { isMaliciousInput } from '@/lib/security/input-sanitizer';
import { createSecurityHeaders } from '@/lib/security/createSecureHeaders';
import { Prisma } from '@prisma/client';

export const GET = async (req: NextRequest) => {
  try {
    // Security Layer 1: Rate Limiting
    const identifier = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { success } = await ratelimit.limit(identifier);
    
    if (!success) {
      return new NextResponse('Too many requests', { status: 429 });
    }

    // Security Layer 2: Header Validation
    const securityCheck = await validateHeaders(req);
    if (!securityCheck.valid) {
      return NextResponse.json(
        { error: securityCheck.message },
        { status: securityCheck.statusCode }
      );
    }
   
    // Security Layer 3: Input Sanitization
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest';
    const category = searchParams.get('category') || '';
   
    if (await isMaliciousInput(search)) {
      return NextResponse.json(
        { error: 'Invalid search query' },
        { status: 400 }
      );
    }

    // Security Layer 4: CORS Protection
    const responseHeaders = createSecurityHeaders(req);

    // Validate sort parameter
    const validSorts = ['newest', 'oldest', 'lowest', 'highest'];
    if (!validSorts.includes(sort)) {
      return NextResponse.json(
        { error: 'Invalid sort parameter' },
        { status: 400, headers: responseHeaders }
      );
    }

   // Validate category against database categories
        const validCategories = await prisma.category.findMany();
        const categoryNames = validCategories.map(cat => cat.type);
        if (category && !categoryNames.includes(category)) {
        return NextResponse.json(
            { error: 'Invalid category parameter' },
            { status: 400, headers: responseHeaders }
        );
        }
     
        // Build Prisma query with timeout
        const baseQuery: Prisma.ProductFindManyArgs = {
          where: {
            name: {
              contains: search,
              mode: 'insensitive' as Prisma.QueryMode
            },
            ...(category && {
              category: {
                type: category
              }
            })
          },
          orderBy: {
            ...(sort === 'newest' && { createdAt: 'desc' }),
            ...(sort === 'oldest' && { createdAt: 'asc' }),
            ...(sort === 'lowest' && { price: 'asc' }),
            ...(sort === 'highest' && { price: 'desc' })
          },
          include: {
            category: true,
            currency: true
          }
        };
        
        const [products, categories] = await Promise.all([
          Promise.race([
            prisma.product.findMany(baseQuery),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database timeout')), 5000)
            )
          ]),
          prisma.category.findMany()
        ]);
 
    // Security Layer 5: Response Validation
    if (!Array.isArray(products) || !Array.isArray(categories)) {
      return NextResponse.json(
        { error: 'Invalid data format from database' },
        { status: 500, headers: responseHeaders }
      );
    }

    return NextResponse.json({products,categories:validCategories}, { 
      status: 200,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    
    // Security Layer 6: Error Handling
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff'
        }
      }
    );
  }
}