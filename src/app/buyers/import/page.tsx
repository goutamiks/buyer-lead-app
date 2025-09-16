"use client";

import { useState } from "react";

export default function ImportBuyersPage() {
  const [text, setText] = useState<string>("fullName,phone,email,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,status,notes,tags\n");
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/buyers/import", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: text,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setError(j?.error || "Failed to import");
      } else {
        const j = await res.json();
        setResult(j);
      }
    } catch (err: any) {
      setError("Failed to import");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-100">Import Buyers from CSV</h1>
        <a href="/api/buyers/export" className="text-sm text-blue-400 hover:text-blue-300">Download sample</a>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-4">
        <p className="text-sm text-zinc-400">Paste CSV below. Required columns: fullName, phone, city, propertyType, purpose, timeline, source.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            rows={12}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 px-3 py-2 font-mono text-sm"
            placeholder="CSV content"
          />
          <div className="flex items-center gap-3">
            <button disabled={isSubmitting} type="submit" className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 disabled:opacity-50">
              {isSubmitting ? "Importing..." : "Import"}
            </button>
          </div>
        </form>

        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
        )}
        {result && (
          <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            Imported {result.created} rows. {result.errors?.length ? `${result.errors.length} rows skipped.` : ""}
          </div>
        )}
      </div>
    </div>
  );
}


