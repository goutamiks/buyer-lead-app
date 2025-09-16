import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { buyerCreateSchema } from "@/schemas/buyer";

const buyerSchema = buyerCreateSchema;

export async function POST(req: NextRequest) {
  try {
    // Development-only: allow unauthenticated submissions to verify flow
    // In production, authentication is required
    const isDevBypass = process.env.NODE_ENV !== "production";
    let ownerId: string | null = null;

    if (!isDevBypass) {
      const session = await getServerSession(authOptions);
      const userId = (session as any)?.user?.id as string | undefined;
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      ownerId = userId;
    }

    const json = await req.json();
    const parsed = buyerSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { tags, status, ...rest } = parsed.data;

    // Resolve ownerId. If dev bypass, use a stable placeholder
    if (isDevBypass) {
      ownerId = "dev-test-user";
    }
    const newBuyer = await prisma.buyer.create({
      data: {
        ...rest,
        tags: tags && tags.length > 0 ? tags : null,
        ...(status && status.trim() ? { status } : {}),
        ownerId: ownerId!,
      },
    });

    return NextResponse.json(newBuyer, { status: 201 });
  } catch (error: any) {
    console.error("/api/buyers POST error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const isDevBypass = process.env.NODE_ENV !== "production";

    let ownerIdFilter: string | undefined = undefined;
    if (!isDevBypass) {
      const session = await getServerSession(authOptions);
      const userId = (session as any)?.user?.id as string | undefined;
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      ownerIdFilter = userId;
    } else {
      // In dev, allow optional ownerId filter for testing
      const ownerIdParam = req.nextUrl.searchParams.get("ownerId");
      ownerIdFilter = ownerIdParam ?? undefined;
    }

    const params = req.nextUrl.searchParams;
    const page = Math.max(parseInt(params.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(params.get("limit") || "20", 10), 1), 100);
    const skip = (page - 1) * limit;

    const search = params.get("search") || undefined;
    const city = params.get("city") || undefined;
    const status = params.get("status") || undefined;
    const propertyType = params.get("propertyType") || undefined;
    const purpose = params.get("purpose") || undefined;
    const timeline = params.get("timeline") || undefined;
    const source = params.get("source") || undefined;
    const bhk = params.get("bhk") || undefined;
    const minBudget = params.get("minBudget");
    const maxBudget = params.get("maxBudget");

    const where: any = {};
    if (ownerIdFilter) where.ownerId = ownerIdFilter;
    if (city) where.city = city;
    if (status) where.status = status;
    if (propertyType) where.propertyType = propertyType;
    if (purpose) where.purpose = purpose;
    if (timeline) where.timeline = timeline;
    if (source) where.source = source;
    if (bhk) where.bhk = bhk;

    if (minBudget || maxBudget) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            minBudget ? { budgetMax: { gte: parseInt(minBudget!, 10) } } : {},
            maxBudget ? { budgetMin: { lte: parseInt(maxBudget!, 10) } } : {},
          ],
        },
      ];
    }

    if (search) {
      const s = search.trim();
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { fullName: { contains: s } },
            { email: { contains: s } },
            { phone: { contains: s } },
            { city: { contains: s } },
            { tags: { contains: s } },
            { notes: { contains: s } },
          ],
        },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.buyer.count({ where }),
      prisma.buyer.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({ data, page, limit, total });
  } catch (error) {
    console.error("/api/buyers GET error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
