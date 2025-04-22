import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { ratelimit } from '@/lib/security/rate-limiter';
import validator from 'validator';
import { authenticateUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const userData = await authenticateUser(request)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  // Rate limiting by IP
  const { success: rateLimitSuccess } = await ratelimit.limit(ip);
  if (!rateLimitSuccess) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429 }
    );
  }

  // Validate input
  const body = await request.json();
  const { name, mobile, message } = body;

  // Input validation
  if (!name || !mobile || !message) {
    return NextResponse.json(
      { error: 'جميع الحقول مطلوبة' },
      { status: 400 }
    );
  }

  if (name.length > 50 || mobile.length > 20 || message.length > 500) {
    return NextResponse.json(
      { error: 'تجاوزت الحد المسموح للأحرف' },
      { status: 400 }
    );
  }

  // Sanitize input
  const sanitizedData = {
    name: validator.escape(name.trim()),
    mobile: validator.escape(mobile.trim()),
    content: validator.escape(message.trim()),
    userId: userData?.user?.id
  };

  // Validate mobile format (Yemeni numbers)
  const mobileRegex = /^(?:00967|967|\+967|0)?7[0-9]{8}$/;
  if (!mobileRegex.test(sanitizedData.mobile)) {
    return NextResponse.json(
      { error: 'رقم الجوال غير صحيح' },
      { status: 400 }
    );
  }

  try {
    // Check message count limit
    const messageCount = await prisma.message.count({
      where: {
        OR: [
          { userId: sanitizedData.userId }, // For logged-in users
          { mobile: sanitizedData.mobile }  // For guests
        ]
      }
    });

    if (messageCount >= 50) {
      return NextResponse.json(
        { error: 'لقد وصلت إلى الحد الأقصى لعدد الرسائل المسموح به' },
        { status: 429 }
      );
    }

    // Save to database
     await prisma.message.create({
      data: {
        name: sanitizedData.name,
        mobile: sanitizedData.mobile,
        content: sanitizedData.content,
        userId: sanitizedData.userId
      }
    });

    return NextResponse.json(
      { success: true, message: 'تم إرسال الرسالة بنجاح' },
      { 
        status: 200,
        headers: {
          'Content-Security-Policy': "default-src 'self'",
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
      }
    );

  } catch (error) {
    console.error('Message submission error:', error);
    return NextResponse.json(
      { error: 'فشل إرسال الرسالة، يرجى المحاولة لاحقاً' },
      { status: 500 }
    );
  }
}