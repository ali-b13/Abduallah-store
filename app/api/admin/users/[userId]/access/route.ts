// app/api/admin/users/[userId]/block/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/database/prisma"
import { authenticateUser } from '@/lib/auth';
import { createLog } from '@/lib/logger';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await authenticateUser(req);
  
  if (!session?.user?.isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Get current user status
    const currentUser = await prisma.user.findUnique({
      where: { id: (await params).userId },
      select: { isBlocked: true, name: true }
    });

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Toggle block status
    const updatedUser = await prisma.user.update({
      where: { id: (await params).userId },
      data: { isBlocked: !currentUser.isBlocked },
    });

    // Create log with proper Arabic message
    const action = updatedUser.isBlocked ? 'حظر' : 'رفع الحظر';
    await createLog({
      actionType: 'UPDATE',
      entityType: 'USER',
      entityId: updatedUser.id,
      userId: session.user.id,
      details: `تم ${action} المستخدم ${currentUser.name}`
    });

    return NextResponse.json({
      message: `User ${updatedUser.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('[USER_BLOCK_TOGGLE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}