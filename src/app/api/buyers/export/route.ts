import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  let str = String(value);
  if (str.includes('"')) str = str.replace(/"/g, '""');
  if (str.search(/[",\n\r]/) !== -1) str = `"${str}"`;
  return str;
}

export async function GET(req: NextRequest) {
  try {
    const isDevBypass = process.env.NODE_ENV !== "production";
    let ownerIdFilter: string | undefined = undefined;
    if (!isDevBypass) {
      const session = await getServerSession(authOptions);
      const userId = (session as any)?.user?.id as string | undefined;
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
      ownerIdFilter = userId;
    } else {
      const ownerIdParam = req.nextUrl.searchParams.get("ownerId");
      ownerIdFilter = ownerIdParam ?? undefined;
    }

    const params = req.nextUrl.searchParams;
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

    const data = await prisma.buyer.findMany({ where, orderBy: { updatedAt: "desc" } });

    const headers = [
      "fullName",
      "phone",
      "email",
      "city",
      "propertyType",
      "bhk",
      "purpose",
      "budgetMin",
      "budgetMax",
      "timeline",
      "source",
      "status",
      "notes",
      "tags",
      "updatedAt",
    ];

    const lines: string[] = [];
    lines.push(headers.join(","));
    for (const b of data) {
      const row = [
        escapeCsv(b.fullName),
        escapeCsv(b.phone),
        escapeCsv(b.email ?? ""),
        escapeCsv(b.city),
        escapeCsv(b.propertyType),
        escapeCsv(b.bhk ?? ""),
        escapeCsv(b.purpose),
        escapeCsv(b.budgetMin ?? ""),
        escapeCsv(b.budgetMax ?? ""),
        escapeCsv(b.timeline),
        escapeCsv(b.source),
        escapeCsv(b.status),
        escapeCsv(b.notes ?? ""),
        escapeCsv(b.tags ?? ""),
        escapeCsv(b.updatedAt.toISOString()),
      ];
      lines.push(row.join(","));
    }

    const csv = lines.join("\n");
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=buyers_export_${Date.now()}.csv`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("/api/buyers/export GET error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}


