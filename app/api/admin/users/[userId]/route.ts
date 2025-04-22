// app/api/admin/users/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/database/prisma"
import { authenticateUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  context:{ params:Promise<{ userId: string }>}
) {
    const {params}=context
    console.log((await params).userId,'user id')
  const session = await authenticateUser(req);
  
  if (!session?.user?.isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: (await params).userId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        Message: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const formattedData = {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      isBlocked:user.isBlocked,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString() || '',
      orders: user.orders.map(order => ({
        id: order.id,
        date: order.createdAt.toISOString(),
        status: order.status,
      })),
      messages: user.Message.map(message => ({
        id: message.id,
        date: message.createdAt.toISOString(),
        content: message.content,
      })),
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('[ADMIN_USER_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}