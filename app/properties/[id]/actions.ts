"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function bookPropertyTourAction(formData: FormData) {
  const propertyId = formData.get("propertyId") as string;
  const visitorName = (formData.get("visitorName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const tourDateStr = formData.get("tourDate") as string;
  const timeSlot = (formData.get("timeSlot") as string) || "10:00 AM - 12:00 PM";
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!propertyId || !visitorName || !email || !tourDateStr) {
    throw new Error("Please provide your name, email, and preferred visit date.");
  }

  const tourDate = new Date(tourDateStr);

  await db.propertyTour.create({
    data: {
      propertyId,
      visitorName,
      email,
      phone,
      tourDate,
      timeSlot,
      notes,
      status: "PENDING",
    },
  });

  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/dashboard/landlord/tours");
}

export async function submitBedApplicationAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Please sign in or create an account to apply.");
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    throw new Error("User record not found. Please complete onboarding first.");
  }

  const propertyId = formData.get("propertyId") as string;
  const roomId = (formData.get("roomId") as string) || null;
  const bedId = (formData.get("bedId") as string) || null;
  const moveInDateStr = formData.get("moveInDate") as string;
  const monthlyIncomeRaw = formData.get("monthlyIncome") as string;
  const occupation = (formData.get("occupation") as string)?.trim() || null;
  const emergencyPhone = (formData.get("emergencyPhone") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!propertyId || !moveInDateStr) {
    throw new Error("Move-in date is required.");
  }

  // Check if bed is already occupied
  if (bedId) {
    const bed = await db.bed.findUnique({ where: { id: bedId } });
        if (!bed) {
      throw new Error("Requested bed was not found.");
    }

    if (bed.status === "OCCUPIED") {
      throw new Error("This bed is already occupied.");
    }
  }

  const moveInDate = new Date(moveInDateStr);
  const monthlyIncome = monthlyIncomeRaw ? parseFloat(monthlyIncomeRaw) : null;

  await db.rentalApplication.create({
    data: {
      propertyId,
      tenantId: user.id,
      roomId,
      bedId,
      moveInDate,
      monthlyIncome,
      occupation,
      emergencyPhone,
      notes,
      status: "PENDING",
    },
  });

  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/dashboard/landlord/applications");
  revalidatePath("/dashboard/tenant");
}