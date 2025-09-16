"use client";

import { useEffect, useMemo, useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { UpdateBuyerState } from "./actions";
import TagInput from "@/components/TagInput";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export function EditForm({ initial, action }: { initial: any; action: (prevState: UpdateBuyerState | undefined, formData: FormData) => Promise<UpdateBuyerState> }) {
  const [state, formAction] = useActionState(action, undefined);

  useEffect(() => {
    // no-op side effect placeholder; could be used for toast triggers
  }, [state?.ok, state?.message]);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4">
      <input type="hidden" name="id" defaultValue={initial.id} />
      <input type="hidden" name="updatedAt" defaultValue={initial.updatedAt} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="block text-sm mb-1">Full name<span className="text-red-500">*</span></label>
          <input id="fullName" name="fullName" defaultValue={initial.fullName} placeholder="Full name" className="border rounded px-3 py-2 w-full" required aria-describedby="fullName-hint" />
          <p id="fullName-hint" className="text-xs text-gray-500 mt-1">Required. Buyer’s full name.</p>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm mb-1">Email</label>
          <input id="email" name="email" defaultValue={initial.email || ""} placeholder="Email" className="border rounded px-3 py-2 w-full" type="email" aria-describedby="email-hint" />
          <p id="email-hint" className="text-xs text-gray-500 mt-1">Optional. Must be a valid email if provided.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm mb-1">Phone<span className="text-red-500">*</span></label>
          <input id="phone" name="phone" defaultValue={initial.phone} placeholder="Phone" className="border rounded px-3 py-2 w-full" type="tel" pattern="[0-9+()\-\s]{6,}" title="Enter a valid phone number" required aria-describedby="phone-hint" />
          <p id="phone-hint" className="text-xs text-gray-500 mt-1">Required. Digits and symbols (()+-).</p>
        </div>
        <div>
          <label htmlFor="city" className="block text-sm mb-1">City<span className="text-red-500">*</span></label>
          <input id="city" name="city" defaultValue={initial.city} placeholder="City" className="border rounded px-3 py-2 w-full" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="propertyType" className="block text-sm mb-1">Property type<span className="text-red-500">*</span></label>
          <select id="propertyType" name="propertyType" defaultValue={initial.propertyType} className="border rounded px-3 py-2 w-full" required>
            <option value="">Select property type</option>
            <option>Apartment</option>
            <option>Villa</option>
            <option>Plot</option>
            <option>Independent House</option>
            <option>Commercial</option>
            <option>Other</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="bhk" className="block text-sm mb-1">BHK</label>
            <input id="bhk" name="bhk" defaultValue={initial.bhk || ""} placeholder="BHK" className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label htmlFor="purpose" className="block text-sm mb-1">Purpose</label>
            <input id="purpose" name="purpose" defaultValue={initial.purpose} placeholder="Purpose" className="border rounded px-3 py-2 w-full" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="timeline" className="block text-sm mb-1">Timeline</label>
          <input id="timeline" name="timeline" defaultValue={initial.timeline} placeholder="Timeline" className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label htmlFor="source" className="block text-sm mb-1">Source</label>
          <input id="source" name="source" defaultValue={initial.source} placeholder="Source" className="border rounded px-3 py-2 w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm mb-1">Status<span className="text-red-500">*</span></label>
          <select id="status" name="status" defaultValue={initial.status} className="border rounded px-3 py-2 w-full" required>
            <option value="">Select status</option>
            <option>New</option>
            <option>Contacted</option>
            <option>Qualified</option>
            <option>Won</option>
            <option>Lost</option>
          </select>
        </div>
        <fieldset className="grid grid-cols-2 gap-4">
          <legend className="block text-sm mb-1">Budget (min / max)</legend>
          <div>
            <label htmlFor="minBudget" className="sr-only">Min budget</label>
            <input id="minBudget" name="minBudget" defaultValue={initial.budgetMin ?? ""} placeholder="Min" className="border rounded px-3 py-2 w-full" type="number" min={0} />
          </div>
          <div>
            <label htmlFor="maxBudget" className="sr-only">Max budget</label>
            <input id="maxBudget" name="maxBudget" defaultValue={initial.budgetMax ?? ""} placeholder="Max" className="border rounded px-3 py-2 w-full" type="number" min={0} />
          </div>
        </fieldset>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm mb-1">Tags</label>
        <input id="tags" name="tags" type="hidden" defaultValue={initial.tags || ""} />
        <EditTagsBridge initial={initial.tags || ""} />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm mb-1">Notes</label>
        <textarea id="notes" name="notes" defaultValue={initial.notes || ""} placeholder="Notes" className="border rounded px-3 py-2 min-h-24 w-full" />
      </div>

      {state?.message && !state?.ok && (
        <div role="alert" aria-live="assertive" className="p-3 bg-yellow-100 border border-yellow-300 text-yellow-900 rounded">
          {state.message}
        </div>
      )}
      {state?.ok && (
        <div role="status" aria-live="polite" className="p-3 bg-green-100 border border-green-300 text-green-900 rounded">
          Saved successfully.
        </div>
      )}

      <div className="flex items-center gap-3">
        <SubmitButton />
      </div>
    </form>
  );
}


function EditTagsBridge({ initial }: { initial: string }) {
  const [tags, setTags] = useState<string[]>(() => initial.split(",").map(t => t.trim()).filter(Boolean));
  useEffect(() => {
    const input = document.getElementById("tags") as HTMLInputElement | null;
    if (input) input.value = tags.join(", ");
  }, [tags]);
  return (
    <TagInput value={tags} onChange={setTags} placeholder="Add tag and press Enter" />
  );
}


