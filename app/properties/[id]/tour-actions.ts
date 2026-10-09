"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ScheduleTourState = {
  success?: boolean;
  message?: string;
  error?: string;
};

export async function schedulePropertyTour(
  prevState: ScheduleTourState,
  formData: FormData
): Promise<ScheduleTourState> {
  const propertyId = formData.get("propertyId") as string;
  const guestName = (formData.get("guestName") as string) || "";
  const guestEmail = (formData.get("guestEmail") as string) || "";
  const guestPhone = (formData.get("guestPhone") as string) || "";
  const tourDateRaw = formData.get("tourDate") as string;
  const timeSlot = formData.get("timeSlot") as string;
  const notes = (formData.get("notes") as string) || null;

  if (
    !propertyId ||
    !guestName.trim() ||
    !guestEmail.trim() ||
    !guestPhone.trim() ||
    !tourDateRaw ||
    !timeSlot
  ) {
    return { error: "Please complete all required fields." };
  }

  try {
    const tourDate = new Date(tourDateRaw);

    await db.propertyTour.create({
      data: {
        propertyId,
        visitorName: guestName.trim(),
        email: guestEmail.trim().toLowerCase(),
        phone: guestPhone.trim(),
        tourDate,
        timeSlot,
        notes: notes?.trim() || null,
        status: "PENDING",
      },
    });

    revalidatePath(`/properties/${propertyId}`);
    return {
      success: true,
      message: "Tour scheduled! The property owner will confirm your visit shortly.",
    };
  } catch (err) {
    console.error("Failed to schedule tour:", err);
    return { error: "Something went wrong while booking your visit. Please try again." };
  }
}