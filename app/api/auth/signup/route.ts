import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/database/prisma";
import { signUpSchema } from "@/lib/security/input-sanitizer";
import { sendOtpToMobile,verifyOtpService } from "@/lib/security/otp";
import { revalidatePath } from "next/cache";
import { createLog } from "@/lib/logger";


export const POST = async (req: NextRequest) => {
  
  try {
    const { mobile, password, name, otp } = await req.json();
    const data = await signUpSchema.parseAsync({ mobile, password, name });

    // Existing user check
    const userExists = await prisma.user.findFirst({ where: { mobile: data.mobile } });
    if (userExists) {
      return NextResponse.json(
        { error: "User already exists", success: false },
        { status: 403 }
      );
    }

    // OTP Verification
    if (otp) {
      if (!verifyOtpService(data.mobile, otp)) {
        return NextResponse.json(
          { error: "Invalid or expired OTP", success: false },
          { status: 401 }
        );
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await prisma.user.create({
        data: { mobile: data.mobile, password: hashedPassword, name: data.name }
      });
        await createLog({
              actionType: 'CREATE',
              entityType: 'USER',
              entityId: user.id,
              userId: user.id,
              details: `  مستخدم جديد انضم: ${user.name}`
            });
      revalidatePath("/")
      return NextResponse.json(
        { message: "User created successfully", success: true, user },
        { status: 201 }
      );
    }

    // Generate and send OTP
      try {
         await sendOtpToMobile(data.mobile)
      } catch (error) {
         return NextResponse.json(
            { error: "فشل في ارسال التحقق من الرقم , اعد المحاولة",errorMsg:error, success: false },
            { status: 500 }
          );
      }

    return NextResponse.json(
      { message: "OTP sent to email", success: true, requiresOTP: true },
      { status: 200 }
    );

  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json(
      { error: "Internal_Server_error", success: false },
      { status: 422 }
    );
  }
};