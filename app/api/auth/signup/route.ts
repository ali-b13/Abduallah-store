import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/database/prisma";
import { signUpSchema } from "@/lib/security/input-sanitizer";
import { revalidatePath } from "next/cache";
import { createLog } from "@/lib/logger";


export const POST = async (req: NextRequest) => {
  
  try {
    const { mobile, password, name,confirmPassword } = await req.json();
    const data = await signUpSchema.parseAsync({ mobile, password, name,confirmPassword });

    // Existing user check
    if(data.password !==data.confirmPassword){
      return NextResponse.json(
        { error: "كلمه المرور لاتطابق  التاكيد", success: false },
        { status: 403 }
      );
    }
    const userExists = await prisma.user.findFirst({ where: {mobile:data.mobile}});
    if (userExists) {
      return NextResponse.json(
        { error: "الرقم هاذا مستخدم سابقا", success: false },
        { status: 403 }
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
    catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json(
      { error: "Internal_Server_error", success: false },
      { status: 422 }
    );
  }
};