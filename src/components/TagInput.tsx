"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TagInputProps = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  id?: string;
  name?: string; // optional, if consumer wants a hidden input elsewhere
};

function normalizeTag(raw: string): string | null {
  const t = raw.trim().replace(/\s+/g, " ");
  if (!t) return null;
  return t;
}

export default function TagInput({ value, onChange, placeholder = "Add tag", id }: TagInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const existingSet = useMemo(() => new Set(value.map(v => v.toLowerCase())), [value]);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    const q = query.trim();
    if (q.length === 0) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/tags?q=${encodeURIComponent(q)}`, { signal: controller.signal, credentials: "include" });
        if (!res.ok) return;
        const data: { tags: string[] } = await res.json();
        if (ignore) return;
        const filtered = data.tags.filter(t => !existingSet.has(t.toLowerCase()));
        setSuggestions(filtered.slice(0, 8));
        setOpen(filtered.length > 0);
      } catch {
        /* noop */
      }
    })();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [query, existingSet]);

  function addTag(raw: string) {
    const t = normalizeTag(raw);
    if (!t) return;
    if (existingSet.has(t.toLowerCase())) return;
    onChange([...value, t]);
    setQuery("");
    setOpen(false);
  }

  function removeTag(idx: number) {
    const next = value.slice();
    next.splice(idx, 1);
    onChange(next);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === ",") {
      e.preventDefault();
      addTag(query);
    } else if (e.key === "Enter") {
      e.preventDefault();
      addTag(query);
    } else if (e.key === "Backspace" && query.length === 0 && value.length > 0) {
      e.preventDefault();
      removeTag(value.length - 1);
    }
  }

  return (
    <div className="w-full border rounded px-2 py-1 focus-within:ring-2 focus-within:ring-blue-500 bg-white/10 border-white/20">
      <div className="flex flex-wrap gap-1">
        {value.map((t, i) => (
          <span key={`${t}-${i}`} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => removeTag(i)} className="hover:text-red-300">×</button>
          </span>
        ))}
        <input
          id={id}
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder={placeholder}
          className="flex-1 min-w-[10ch] bg-transparent outline-none px-1 py-1"
        />
      </div>
      {open && suggestions.length > 0 && (
        <div className="mt-1 max-h-40 overflow-auto rounded border border-white/10 bg-zinc-950 text-sm shadow-lg">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="block w-full text-left px-3 py-2 hover:bg-zinc-800"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addTag(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


