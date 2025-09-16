"use client";

import { useState, useTransition } from "react";

type Props = {
  id: string;
  status: string;
  updatedAt: string;
};

const options = ["New", "Contacted", "Qualified", "Won", "Lost"] as const;

export default function StatusQuickEdit({ id, status, updatedAt }: Props) {
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(next: string) {
    setError(null);
    const res = await fetch(`/api/buyers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: next, updatedAt }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      setError(err?.error || "Failed");
      throw new Error("Failed");
    }
    const json = await res.json();
    setCurrent(json.status);
  }

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setCurrent(next);
    startTransition(() => {
      updateStatus(next).catch(() => {});
    });
  }

  const cls =
    current === "Won" ? "bg-green-600/20 text-green-300 border-green-700/50" :
    current === "Lost" ? "bg-red-600/20 text-red-300 border-red-700/50" :
    current === "Qualified" ? "bg-emerald-600/20 text-emerald-300 border-emerald-700/50" :
    current === "Contacted" ? "bg-blue-600/20 text-blue-300 border-blue-700/50" :
    "bg-zinc-700/30 text-zinc-200 border-zinc-700/60";

  return (
    <div className="flex flex-col">
      <select value={current} onChange={onChange} disabled={isPending}
        className={`inline-flex items-center px-2 py-1 rounded text-xs border ${cls}`}>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {error && <span className="text-[10px] text-red-400 mt-1">{error}</span>}
    </div>
  );
}


