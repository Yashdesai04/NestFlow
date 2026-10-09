"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Helper to check landlord authorization
async function verifyPropertyOwner(propertyId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) throw new Error("User record not found");

  const property = await db.property.findFirst({
    where: { id: propertyId, landlordId: user.id },
  });

  if (!property) throw new Error("Property not found or access denied");
  return { user, property };
}

// Save or Update a single day's 3-meal schedule
export async function updateDayMenu(formData: FormData) {
  const propertyId = formData.get("propertyId") as string;
  const dayOfWeek = formData.get("dayOfWeek") as string;
  const breakfast = (formData.get("breakfast") as string) || "";
  const lunch = (formData.get("lunch") as string) || "";
  const dinner = (formData.get("dinner") as string) || "";

  await verifyPropertyOwner(propertyId);

  // Upsert the 3-meal schedule for this specific day
  await db.messMenu.upsert({
    where: {
      propertyId_dayOfWeek: {
        propertyId,
        dayOfWeek,
      },
    },
    update: {
      breakfast,
      lunch,
      dinner,
    },
    create: {
      propertyId,
      dayOfWeek,
      breakfast,
      lunch,
      dinner,
    },
  });

  // Revalidate views to reflect live menu updates across the platform
  revalidatePath(`/dashboard/landlord/properties/${propertyId}/mess`);
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath(`/dashboard/tenant`);
}