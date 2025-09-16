import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().min(1).optional(),
  propertyType: z.string().min(1).optional(),
  bhk: z.string().optional().or(z.literal("")),
  purpose: z.string().min(1).optional(),
  budgetMin: z.number().int().optional().nullable(),
  budgetMax: z.number().int().optional().nullable(),
  timeline: z.string().min(1).optional(),
  source: z.string().min(1).optional(),
  status: z.string().optional(),
  notes: z.string().optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
  // optimistic concurrency token from client
  updatedAt: z.string().datetime(),
});

async function resolveOwnerIdForRequest() {
  const isDevBypass = process.env.NODE_ENV !== "production";
  if (isDevBypass) {
    return "dev-test-user";
  }
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return null;
  return userId;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ownerId = await resolveOwnerIdForRequest();
    if (ownerId === null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const buyer = await prisma.buyer.findFirst({ where: { id: params.id, ownerId } });
    if (!buyer) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(buyer);
  } catch (error) {
    console.error("/api/buyers/[id] GET error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ownerId = await resolveOwnerIdForRequest();
    if (ownerId === null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = updateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { tags, updatedAt, ...rest } = parsed.data;

    // Ensure record exists and belongs to owner, and updatedAt matches
    const whereClause: any = { id: params.id, ownerId, updatedAt: new Date(updatedAt) };

    const updateResult = await prisma.buyer.updateMany({
      where: whereClause,
      data: {
        ...rest,
        tags: tags && tags.length > 0 ? tags : null,
      },
    });

    if (updateResult.count === 0) {
      // Conflicting update or not found with provided token
      return NextResponse.json({ error: "Record has changed. Please reload." }, { status: 409 });
    }

    const refreshed = await prisma.buyer.findUnique({ where: { id: params.id } });
    return NextResponse.json(refreshed);
  } catch (error) {
    console.error("/api/buyers/[id] PUT error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ownerId = await resolveOwnerIdForRequest();
    if (ownerId === null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await prisma.buyer.deleteMany({ where: { id: params.id, ownerId } });
    if (result.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("/api/buyers/[id] DELETE error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


