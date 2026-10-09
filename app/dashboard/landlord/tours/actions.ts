"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateTourStatusAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const tourId = formData.get("tourId") as string;
  const status = formData.get("status") as any;
  const notes = (formData.get("notes") as string) || null;

  if (!tourId || !status) {
    throw new Error("Tour ID and target status are required.");
  }

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!landlord || landlord.role !== "LANDLORD") {
    throw new Error("Only property owners can manage visit requests.");
  }

  // Verify tour belongs to one of the landlord's properties
  const tour = await db.propertyTour.findFirst({
    where: {
      id: tourId,
      property: { landlordId: landlord.id },
    },
  });

  if (!tour) throw new Error("Tour request not found or unauthorized.");

  await db.propertyTour.update({
    where: { id: tourId },
    data: {
      status,
      notes: notes ? notes.trim() : tour.notes,
    },
  });

  revalidatePath("/dashboard/landlord/tours");
  revalidatePath("/dashboard/landlord");
}