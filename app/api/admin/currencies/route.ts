// app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";


export async function GET(req: NextRequest ) {
  const session = await authenticateUser(req);
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
    try {
        const currencies =await prisma.currency.findMany()
        return NextResponse.json({currencies})
    } catch (error) {
      console.log(error)
        return NextResponse.json({error:"Not Vaild Call"},{status:404})

    }
}