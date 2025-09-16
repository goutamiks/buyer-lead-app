import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const q = (req.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
    const rows = await prisma.buyer.findMany({ select: { tags: true }, take: 500 });
    const set = new Set<string>();
    for (const r of rows) {
      if (!r.tags) continue;
      for (const t of r.tags.split(",")) {
        const n = t.trim();
        if (!n) continue;
        set.add(n);
      }
    }
    let tags = Array.from(set);
    if (q) {
      tags = tags.filter(t => t.toLowerCase().includes(q));
    }
    tags.sort((a, b) => a.localeCompare(b));
    return NextResponse.json({ tags: tags.slice(0, 50) });
  } catch (e) {
    return NextResponse.json({ tags: [] });
  }
}


