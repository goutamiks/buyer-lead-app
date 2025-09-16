import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type BuyerCsvRow = {
  fullName: string;
  phone: string;
  email?: string;
  city: string;
  propertyType: string;
  bhk?: string;
  purpose: string;
  budgetMin?: string;
  budgetMax?: string;
  timeline: string;
  source: string;
  status?: string;
  notes?: string;
  tags?: string;
};

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  // Simple CSV parser supporting quoted fields and commas
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const rows: string[][] = [];
  for (const line of lines) {
    if (line.trim() === "") continue;
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === ',') {
          fields.push(current);
          current = "";
        } else if (ch === '"') {
          inQuotes = true;
        } else {
          current += ch;
        }
      }
    }
    fields.push(current);
    rows.push(fields.map(f => f.trim()));
  }
  const headers = rows.shift() || [];
  return { headers, rows };
}

function mapRowToBuyer(headers: string[], row: string[]): BuyerCsvRow {
  const obj: any = {};
  headers.forEach((h, idx) => {
    const key = h.trim();
    obj[key] = row[idx] ?? "";
  });
  return obj as BuyerCsvRow;
}

export async function POST(req: NextRequest) {
  try {
    const isDevBypass = process.env.NODE_ENV !== "production";
    let ownerId: string | null = null;
    if (!isDevBypass) {
      const session = await getServerSession(authOptions);
      const userId = (session as any)?.user?.id as string | undefined;
      if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      ownerId = userId;
    } else {
      ownerId = "dev-test-user";
    }

    const ctype = req.headers.get("content-type") || "";
    let text: string;
    if (ctype.includes("text/csv") || ctype.includes("application/csv") || ctype.includes("text/plain")) {
      text = await req.text();
    } else {
      // support JSON with { csv: string }
      const body = await req.json().catch(() => null);
      if (!body?.csv) return NextResponse.json({ error: "Expected CSV body" }, { status: 400 });
      text = String(body.csv);
    }

    const { headers, rows } = parseCsv(text);
    if (headers.length === 0) return NextResponse.json({ error: "Empty CSV" }, { status: 400 });

    const normalizedHeaders = headers.map(h => h.trim());
    const required = ["fullName", "phone", "city", "propertyType", "purpose", "timeline", "source"];
    const missing = required.filter(r => !normalizedHeaders.includes(r));
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing columns: ${missing.join(", ")}` }, { status: 400 });
    }

    const results: any[] = [];
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const obj = mapRowToBuyer(normalizedHeaders, row);
      // basic validations
      if (!obj.fullName || !obj.phone || !obj.city || !obj.propertyType || !obj.purpose || !obj.timeline || !obj.source) {
        errors.push({ row: i + 2, message: "Required fields missing" });
        continue;
      }
      const budgetMin = obj.budgetMin ? parseInt(obj.budgetMin, 10) : undefined;
      const budgetMax = obj.budgetMax ? parseInt(obj.budgetMax, 10) : undefined;

      results.push({
        fullName: obj.fullName,
        phone: obj.phone,
        email: obj.email || null,
        city: obj.city,
        propertyType: obj.propertyType,
        bhk: obj.bhk || null,
        purpose: obj.purpose,
        budgetMin: Number.isFinite(budgetMin as any) ? budgetMin! : null,
        budgetMax: Number.isFinite(budgetMax as any) ? budgetMax! : null,
        timeline: obj.timeline,
        source: obj.source,
        status: obj.status && obj.status.trim() ? obj.status : undefined,
        notes: obj.notes || null,
        tags: obj.tags || null,
      });
    }

    if (results.length === 0) {
      return NextResponse.json({ error: "No valid rows", errors }, { status: 400 });
    }

    const created = await prisma.$transaction(
      results.map((data) =>
        prisma.buyer.create({ data: { ...data, ownerId: ownerId! } })
      )
    );

    return NextResponse.json({ created: created.length, errors });
  } catch (error) {
    console.error("/api/buyers/import POST error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


