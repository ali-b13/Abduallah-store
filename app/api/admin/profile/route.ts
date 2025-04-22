// app/api/admin/users/[userId]/block/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/database/prisma"
import { authenticateUser } from '@/lib/auth';

export async function GET(
  req: NextRequest
) {
  const session = await authenticateUser(req);
  
  if (!session?.user?.isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Get current user status
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { mobile:true,name:true}
    });

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 });
    }



    return NextResponse.json({
     user:currentUser
    });
  } catch (error) {
    console.error('[USER_NOT_FOUND]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}







export async function PUT(
  req: NextRequest
) {
  const session = await authenticateUser(req);
  
  if (!session?.user?.isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Get current user status
    const body = await req.json();
    const { name, mobile } = body;  
    
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { mobile:true,name:true,id:true}
    });
  
    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    if(name.length>25){
        return new NextResponse(' الاسم يجب أن تكون على اقل من 25 أحرف', { status: 400 });

    }
    if(mobile.length!==9){
        return new NextResponse(' الرقم يجب أن يكون  من 9 ارقام بدون فتح خط', { status: 400 });

    }
  await prisma.user.update({where:{id:currentUser.id},data:{
        mobile:mobile,
        name:name
    }})



    return NextResponse.json({
     success:true,
     message:"updated successfully"
    });
  } catch (error) {
    console.error('[USER_NOT_FOUND]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}