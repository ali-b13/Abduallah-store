// app/api/logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/database/prisma"
import { authenticateUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await authenticateUser(req);
  
  if (!session?.user?.isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const logs = await prisma.logs.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include:{user:{
        select:{name:true}
      }},
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.logs.count();
    return NextResponse.json({
      logs,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('[LOGS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}