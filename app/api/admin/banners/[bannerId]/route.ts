// app/api/admin/banners/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";
import { createLog } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  context:{ params:Promise<{ bannerId: string }>}
) {
    const { params } =   context;
  const session = await authenticateUser(req);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const banner = await prisma.heroAd.findUnique({ where: { id: (await params).bannerId } });
    if (!banner) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ banner });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not fetch banner" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ bannerId: string }> }
) {
  const { params } = context;
  const session = await authenticateUser(req);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const bannerId = (await params).bannerId;
    const { title, categoryId, image, isAdvertising } = await req.json();

    // Validate required fields
    if (!image) {
      return NextResponse.json({ error: "الصورة مطلوبة" }, { status: 400 });
    }

    if (!isAdvertising && (!title || !categoryId)) {
      return NextResponse.json({ error: "العنوان والرابط مطلوبين" }, { status: 400 });
    }

    // Validate image URL format
    if (typeof image !== "string" || !image.startsWith("http")) {
      return NextResponse.json({ error: "صورة غير صالحة" }, { status: 400 });
    }

    // Fetch existing banner
    const existingBanner = await prisma.heroAd.findUnique({
      where: { id: bannerId }
    });

    if (!existingBanner) {
      return NextResponse.json({ error: "البانر غير موجود" }, { status: 404 });
    }

   
    // For non-advertising banners, verify category exists
    let category = null;
    if (!isAdvertising) {
      category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return NextResponse.json({ error: "الفئة غير موجودة" }, { status: 404 });
      }
    }

    // Prepare update data
    const updateData = {
      image,
      isAdvertising,
      title: isAdvertising ? '' : title,
      categoryId: isAdvertising ? null : categoryId,
      link: isAdvertising ? null : `/categories/${category?.type}`
    };

    // Update banner
    const updatedBanner = await prisma.heroAd.update({
      where: { id: bannerId },
      data: updateData
    });

    // Create audit log
    await createLog({
      actionType: 'UPDATE',
      entityType: 'BANNER',
      entityId: updatedBanner.id,
      userId: session.user.id,
      details: `تم تعديل ${isAdvertising ? 'إعلان' : `بانر: ${title}`}`
    });

    return NextResponse.json({ banner: updatedBanner }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "فشل في تحديث البانر" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context:{ params:Promise<{ bannerId: string }>}
) {
    const { params } =   context;

  const session = await authenticateUser(req);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    // delete file from disk
    const existing = await prisma.heroAd.findUnique({ where: { id: (await params).bannerId } });
    if(!existing){
      return NextResponse.json({ error: "Could not delete banner" }, { status: 404 });
    }
    
    await prisma.heroAd.delete({ where: { id: (await params).bannerId } });
    await createLog({
      actionType: 'UPDATE',
      entityType: 'BANNER',
      entityId: existing.id,
      userId: session.user.id,
      details: ` تم حذف البانر : ${existing.title}`
    });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not delete banner" }, { status: 500 });
  }
}
