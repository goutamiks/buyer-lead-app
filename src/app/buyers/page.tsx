import Link from "next/link";
import prisma from "@/lib/db";
import dynamic from "next/dynamic";
import StatusQuickEditWrapper from "@/components/StatusQuickEditWrapper";


// const StatusQuickEdit = dynamic(() => import("@/components/StatusQuickEdit"), { ssr: false });

type SearchParams = { [key: string]: string | string[] | undefined };

function parseIntSafe(value: string | null | undefined, fallback: number): number {
  const n = value ? parseInt(value, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function toQueryString(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") q.set(k, String(v));
  });
  return `?${q.toString()}`;
}

export default async function BuyersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = parseIntSafe(Array.isArray(params.page) ? params.page[0] : (params.page as string), 1);
  const limit = Math.min(parseIntSafe(Array.isArray(params.limit) ? params.limit[0] : (params.limit as string), 20), 100);
  const skip = (page - 1) * limit;

  const city = Array.isArray(params.city) ? params.city[0] : (params.city as string | undefined);
  const status = Array.isArray(params.status) ? params.status[0] : (params.status as string | undefined);
  const propertyType = Array.isArray(params.propertyType) ? params.propertyType[0] : (params.propertyType as string | undefined);
  const purpose = Array.isArray(params.purpose) ? params.purpose[0] : (params.purpose as string | undefined);
  const timeline = Array.isArray(params.timeline) ? params.timeline[0] : (params.timeline as string | undefined);
  const source = Array.isArray(params.source) ? params.source[0] : (params.source as string | undefined);
  const bhk = Array.isArray(params.bhk) ? params.bhk[0] : (params.bhk as string | undefined);
  const search = Array.isArray(params.search) ? params.search[0] : (params.search as string | undefined);
  const minBudgetStr = Array.isArray(params.minBudget) ? params.minBudget[0] : (params.minBudget as string | undefined);
  const maxBudgetStr = Array.isArray(params.maxBudget) ? params.maxBudget[0] : (params.maxBudget as string | undefined);

  const where: any = {};
  if (city) where.city = city;
  if (status) where.status = status;
  if (propertyType) where.propertyType = propertyType;
  if (purpose) where.purpose = purpose;
  if (timeline) where.timeline = timeline;
  if (source) where.source = source;
  if (bhk) where.bhk = bhk;

  if (minBudgetStr || maxBudgetStr) {
    const minBudget = minBudgetStr ? parseInt(minBudgetStr, 10) : undefined;
    const maxBudget = maxBudgetStr ? parseInt(maxBudgetStr, 10) : undefined;
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          minBudget !== undefined ? { budgetMax: { gte: minBudget } } : {},
          maxBudget !== undefined ? { budgetMin: { lte: maxBudget } } : {},
        ],
      },
    ];
  }

  if (search && search.trim().length > 0) {
    const s = search.trim();
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { fullName: { contains: s } },
          { email: { contains: s } },
          { phone: { contains: s } },
        ],
      },
    ];
  }

  const [total, buyers] = await Promise.all([
    prisma.buyer.count({ where }),
    prisma.buyer.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take: limit }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const baseParams = { city, status, propertyType, purpose, timeline, source, bhk, search, minBudget: minBudgetStr, maxBudget: maxBudgetStr, limit } as Record<string, string | number | undefined>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-100">Buyers</h1>
        <div className="flex items-center gap-2">
          <Link href={{ pathname: "/api/buyers/export", query: { ...baseParams } }} className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 rounded-md">Export CSV</Link>
          <Link href="/buyers/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md">New Lead</Link>
          <Link href="/buyers/import" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md">Import CSV</Link>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <form className="grid grid-cols-1 md:grid-cols-4 gap-3" method="get">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Search</label>
            <input name="search" placeholder="name, email, phone" defaultValue={search || ""} className="w-full rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">City</label>
            <input name="city" placeholder="City" defaultValue={city || ""} className="w-full rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Status</label>
            <input name="status" placeholder="Status" defaultValue={status || ""} className="w-full rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Property Type</label>
            <input name="propertyType" placeholder="Property Type" defaultValue={propertyType || ""} className="w-full rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">BHK</label>
            <input name="bhk" placeholder="BHK" defaultValue={bhk || ""} className="w-full rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Min Budget</label>
            <input name="minBudget" placeholder="Min" defaultValue={minBudgetStr || ""} className="w-full rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Max Budget</label>
            <input name="maxBudget" placeholder="Max" defaultValue={maxBudgetStr || ""} className="w-full rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 px-3 py-2" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md">Apply</button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60">
        <table className="min-w-full text-sm text-zinc-200">
          <thead className="bg-zinc-900 text-zinc-400 sticky top-0">
            <tr>
              <th className="text-left p-3 border-b border-zinc-800">Name</th>
              <th className="text-left p-3 border-b border-zinc-800">Phone</th>
              <th className="text-left p-3 border-b border-zinc-800">Email</th>
              <th className="text-left p-3 border-b border-zinc-800">City</th>
              <th className="text-left p-3 border-b border-zinc-800">Property</th>
              <th className="text-left p-3 border-b border-zinc-800">Status</th>
              <th className="text-left p-3 border-b border-zinc-800">Updated</th>
            </tr>
          </thead>
          <tbody>
            {buyers.map((b: any, i: number) => (
              <tr key={b.id} className={`border-b border-zinc-800 hover:bg-zinc-900 ${i % 2 === 0 ? "bg-transparent" : "bg-zinc-900/40"}`}>
                <td className="p-3">
                  <Link href={`/buyers/${b.id}`} className="text-blue-400 hover:text-blue-300 hover:underline">
                    {b.fullName}
                  </Link>
                </td>
                <td className="p-3">{b.phone}</td>
                <td className="p-3">{b.email || "—"}</td>
                <td className="p-3">{b.city}</td>
                <td className="p-3">{b.propertyType}</td>
                <td className="p-3">
                  <StatusQuickEditWrapper id={b.id} status={b.status} updatedAt={(b.updatedAt as any as Date).toString()} />
                </td>
                <td className="p-3">{new Date(b.updatedAt as any).toLocaleString()}</td>
              </tr>
            ))}
            {buyers.length === 0 && (
              <tr>
                <td className="p-6 text-center text-zinc-400" colSpan={7}>No results</td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-400">
        <div>
          Page {page} of {totalPages} • {total} results
        </div>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={toQueryString({ ...baseParams, page: page - 1 })} className="px-3 py-2 border border-zinc-800 rounded-md hover:bg-zinc-900">Prev</Link>
          )}
          {page < totalPages && (
            <Link href={toQueryString({ ...baseParams, page: page + 1 })} className="px-3 py-2 border border-zinc-800 rounded-md hover:bg-zinc-900">Next</Link>
          )}
        </div>
      </div>
    </div>
  );
}


