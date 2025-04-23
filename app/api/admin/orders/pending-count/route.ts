// pages/api/admin/orders/pending-count.ts
import prisma from '@/lib/database/prisma';
import { authenticateUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export const  GET=async(req: NextRequest)=> {
    const session = await authenticateUser(req);
        if (!session || !session.user?.isAdmin) {
          return new Response("Unauthorized", { status: 403 });
        }
  try {
    const count = await prisma.order.count({
      where: {
        status: 'pending' // Update with your actual pending status
      }
    });

    return NextResponse.json({count},{status:200})
  } catch (error) {
    console.error('Error fetching pending orders count:', error);
    return NextResponse.json({error:"NOT_FOUND"},{status:422})
  }
}