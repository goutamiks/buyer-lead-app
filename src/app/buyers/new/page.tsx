"use client";

import { useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { buyerCreateSchema } from "@/schemas/buyer";
import TagInput from "@/components/TagInput";

const buyerSchema = buyerCreateSchema;

type BuyerFormData = z.infer<typeof buyerSchema>;

export default function NewBuyerPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    mode: "onTouched",
  });

  const tagsString = watch("tags") || "";
  const tagsArray = useMemo(() => tagsString.split(",").map(t => t.trim()).filter(Boolean), [tagsString]);
  function onTagsChange(next: string[]) {
    setValue("tags", next.join(", "));
  }

  const onSubmit = async (data: BuyerFormData) => {
    setServerError(null);
    setSuccess(null);
    const res = await fetch("/api/buyers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setSuccess("Buyer lead created successfully.");
      reset();
    } else {
      const err = await res.json().catch(() => null);
      setServerError(err?.error || "Failed to create lead");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white/5 border border-white/10 rounded-xl shadow-sm">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-lg font-semibold">New Buyer Lead</h1>
          <p className="text-sm text-gray-400 mt-1">Fill the details below to create a lead.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {success && (
            <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              {success}
            </div>
          )}
          {serverError && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {serverError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input aria-invalid={!!errors.fullName} className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" {...register("fullName")} placeholder="John Doe" />
              {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input aria-invalid={!!errors.phone} className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" {...register("phone")} placeholder="+91 90000 00000" />
              {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input aria-invalid={!!errors.email} className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" {...register("email")} placeholder="name@example.com" />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input aria-invalid={!!errors.city} className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" {...register("city")} placeholder="Bengaluru" />
              {errors.city && <p className="mt-1 text-xs text-red-400">{errors.city.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Property Type</label>
              <input aria-invalid={!!errors.propertyType} className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" {...register("propertyType")} placeholder="Apartment / Villa" />
              {errors.propertyType && <p className="mt-1 text-xs text-red-400">{errors.propertyType.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">BHK (optional)</label>
              <input className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" {...register("bhk")} placeholder="2 / 3 / 4" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Purpose</label>
              <input aria-invalid={!!errors.purpose} className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" {...register("purpose")} placeholder="Investment / End use" />
              {errors.purpose && <p className="mt-1 text-xs text-red-400">{errors.purpose.message as string}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Budget Min</label>
                <input type="number" className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" {...register("budgetMin", { valueAsNumber: true })} placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Budget Max</label>
                <input type="number" className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" {...register("budgetMax", { valueAsNumber: true })} placeholder="10000000" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Timeline</label>
              <input aria-invalid={!!errors.timeline} className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" {...register("timeline")} placeholder="1 month" />
              {errors.timeline && <p className="mt-1 text-xs text-red-400">{errors.timeline.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Source</label>
              <input aria-invalid={!!errors.source} className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" {...register("source")} placeholder="Facebook / Referral" />
              {errors.source && <p className="mt-1 text-xs text-red-400">{errors.source.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select aria-invalid={!!errors.status} className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" {...register("status")}> 
                <option value="">Select status</option>
                <option>New</option>
                <option>Contacted</option>
                <option>Qualified</option>
                <option>Won</option>
                <option>Lost</option>
              </select>
              {errors.status && <p className="mt-1 text-xs text-red-400">{errors.status.message as string}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea rows={4} className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" {...register("notes")} placeholder="Additional details" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Tags</label>
              <input type="hidden" {...register("tags")} />
              <TagInput value={tagsArray} onChange={onTagsChange} placeholder="Add tag and press Enter" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button disabled={isSubmitting} type="submit" className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
