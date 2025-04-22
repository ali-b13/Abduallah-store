import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { authenticateUser } from '@/lib/auth';
import bcrypt from 'bcrypt';

export async function PUT(req: NextRequest) {
  // Authenticate and authorize
  const session = await authenticateUser(req);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Parse JSON body
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    // Basic validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'الرجاء ملء جميع الحقول.' },
        { status: 400 }
      );
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.' },
        { status: 400 }
      );
    }

    // Fetch user record
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود.' },
        { status: 404 }
      );
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور الحالية غير صحيحة.' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed }
    });

    return NextResponse.json({ success: true, message: 'تم تحديث كلمة المرور بنجاح.' });
  } catch (err) {
    console.error('[USER_UPDATE_ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ داخلي.' },
      { status: 500 }
    );
  }
}
