import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EditForm } from "./EditForm";
import { updateBuyerAction } from "./actions";

export default async function BuyerEditPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const buyer = await prisma.buyer.findUnique({ where: { id: p.id } });
  if (!buyer) {
    return <div className="p-6">Not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Edit Buyer</h1>
          <p className="text-sm text-zinc-400 mt-1">ID: {buyer.id} • Last updated {new Date(buyer.updatedAt as any).toLocaleString()}</p>
        </div>
        <div className="md:self-start">
          <Link href="/buyers" className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 text-zinc-200 text-sm">
            ← Back to list
          </Link>
        </div>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 md:p-6">
        <EditForm initial={{
        id: buyer.id,
        updatedAt: buyer.updatedAt.toISOString(),
        fullName: buyer.fullName,
        phone: buyer.phone,
        email: buyer.email,
        city: buyer.city,
        propertyType: buyer.propertyType,
        bhk: buyer.bhk,
        purpose: buyer.purpose,
        budgetMin: buyer.budgetMin,
        budgetMax: buyer.budgetMax,
        timeline: buyer.timeline,
        source: buyer.source,
        status: buyer.status,
        notes: buyer.notes,
        tags: buyer.tags,
      }} action={updateBuyerAction} />
      </div>
    </div>
  );
}


