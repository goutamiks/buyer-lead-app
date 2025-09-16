import { describe, expect, it } from "vitest";
import { buyerCreateSchema } from "./buyer";

describe("buyerCreateSchema", () => {
  it("accepts valid minimal payload", () => {
    const parsed = buyerCreateSchema.parse({
      fullName: "John Doe",
      phone: "+1 234567890",
      email: "",
      city: "Bengaluru",
      propertyType: "Apartment",
      bhk: "",
      purpose: "End use",
      budgetMin: 100,
      budgetMax: 200,
      timeline: "1 month",
      source: "Facebook",
      status: "New",
      notes: "",
      tags: "hot, budget",
    });
    expect(parsed.fullName).toBe("John Doe");
  });

  it("rejects missing fullName", () => {
    const result = buyerCreateSchema.safeParse({
      fullName: "",
      phone: "1234567",
      email: "",
      city: "C",
      propertyType: "P",
      purpose: "U",
      timeline: "T",
      source: "S",
    } as any);
    expect(result.success).toBe(false);
  });
});


