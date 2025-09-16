"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type UpdateBuyerState = { ok: boolean; message?: string; updatedAt?: string };

export async function updateBuyerAction(prevState: UpdateBuyerState | undefined, formData: FormData): Promise<UpdateBuyerState> {
  try {
    const isDevBypass = process.env.NODE_ENV !== "production";
    let ownerId: string | null = null;
    if (!isDevBypass) {
      const session = await getServerSession(authOptions);
      const userEmail = session?.user?.email ?? undefined;
      if (!userEmail) return { ok: false, message: "Unauthorized" };
      const owner = await prisma.user.findUnique({ where: { email: userEmail } });
      if (!owner) return { ok: false, message: "User not found" };
      ownerId = owner.id;
    } else {
      ownerId = "dev-test-user";
    }

    const id = String(formData.get("id"));
    const updatedAtStr = String(formData.get("updatedAt"));
    const payload: any = {
      fullName: formData.get("fullName")?.toString() || undefined,
      phone: formData.get("phone")?.toString() || undefined,
      email: formData.get("email")?.toString() || undefined,
      city: formData.get("city")?.toString() || undefined,
      propertyType: formData.get("propertyType")?.toString() || undefined,
      bhk: formData.get("bhk")?.toString() || undefined,
      purpose: formData.get("purpose")?.toString() || undefined,
      timeline: formData.get("timeline")?.toString() || undefined,
      source: formData.get("source")?.toString() || undefined,
      status: formData.get("status")?.toString() || undefined,
      notes: formData.get("notes")?.toString() || undefined,
      tags: formData.get("tags")?.toString() || undefined,
    };
    const minBudgetRaw = formData.get("minBudget")?.toString() ?? "";
    const maxBudgetRaw = formData.get("maxBudget")?.toString() ?? "";
    payload.budgetMin = minBudgetRaw === "" ? null : Number(minBudgetRaw);
    payload.budgetMax = maxBudgetRaw === "" ? null : Number(maxBudgetRaw);

    const where: any = { id, updatedAt: new Date(updatedAtStr) };
    if (ownerId) where.ownerId = ownerId;

    const result = await prisma.buyer.updateMany({ where, data: { ...payload, tags: payload.tags && payload.tags.length > 0 ? payload.tags : null } });
    if (result.count === 0) {
      return { ok: false, message: "Record has changed. Please reload." };
    }
    const refreshed = await prisma.buyer.findUnique({ where: { id } });
    revalidatePath(`/buyers/${id}`);
    revalidatePath(`/buyers`);
    return { ok: true, updatedAt: refreshed?.updatedAt.toISOString() };
  } catch (e: any) {
    return { ok: false, message: "Failed to save" };
  }
}


