// lib/security/auth-helper.ts
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import prisma from "@/lib/database/prisma";

type AuthResult = {
  user?: {
    id: string;
    isAdmin:boolean
    // Add other user fields as needed
  };
  error?: {
    message: string;
    status: number;
  };
};

export const authenticateUser = async (req: NextRequest): Promise<AuthResult> => {
  try {
    // 1. Get JWT token
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET!,
    });

    // 2. Validate token
    if (!token?.sub) {
      return { 
        error: {
          message: "يرجى تسجيل الدخول أولاً",
          status: 401
        }
      };
    }

    // 3. Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      select: {
        id: true,
        isAdmin:true
        // Add other fields you need
        // name: true,
        // role: true,
      }
    });
    if (!user) {
      return {
        error: {
          message: "الحساب غير موجود",
          status: 404
        }
      };
    }

    return { user };

  } catch (error) {
    console.error("Authentication error:", error);
    return {
      error: {
        message: "خطأ في المصادقة",
        status: 500
      }
    };
  }
};