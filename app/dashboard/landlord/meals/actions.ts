"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateDayMenuAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const propertyId = formData.get("propertyId") as string;
  const dayOfWeek = formData.get("dayOfWeek") as any;
  const breakfast = (formData.get("breakfast") as string) || "";
  const lunch = (formData.get("lunch") as string) || "";
  const dinner = (formData.get("dinner") as string) || "";

  if (!propertyId || !dayOfWeek) {
    throw new Error("Property ID and Day of Week are required.");
  }

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!landlord || landlord.role !== "LANDLORD") {
    throw new Error("Only property owners can edit mess schedules.");
  }

  // Verify property ownership
  const property = await db.property.findFirst({
    where: { id: propertyId, landlordId: landlord.id },
  });

  if (!property) throw new Error("Property not found or unauthorized.");

  // Atomic upsert for day menu
  await db.messMenu.upsert({
    where: {
      propertyId_dayOfWeek: {
        propertyId,
        dayOfWeek,
      },
    },
    update: {
      breakfast: breakfast.trim(),
      lunch: lunch.trim(),
      dinner: dinner.trim(),
    },
    create: {
      propertyId,
      dayOfWeek,
      breakfast: breakfast.trim(),
      lunch: lunch.trim(),
      dinner: dinner.trim(),
    },
  });

  revalidatePath("/dashboard/landlord/meals");
  revalidatePath("/dashboard/tenant");
  revalidatePath("/dashboard/tenant/meals");
}