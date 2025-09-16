import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
    },
  });

  console.log("User created:", user);

  // Create a test Buyer (Lead)
  const buyer = await prisma.buyer.create({
    data: {
      fullName: "John Doe",
      phone: "9876543210",
      city: "Chandigarh",
      propertyType: "Apartment",
      purpose: "Buy",
      timeline: "0-3m",
      source: "Website",
      tags: JSON.stringify(["vip", "urgent"]),  // Store as string
      ownerId: user.id,
    },
  });

  console.log("Buyer Lead created:", buyer);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
