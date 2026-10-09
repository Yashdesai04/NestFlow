"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function approveApplicationAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const applicationId = formData.get("applicationId") as string;
  const rentAmountRaw = formData.get("rentAmount") as string;
  const depositAmountRaw = formData.get("depositAmount") as string;

  if (!applicationId) throw new Error("Application ID is required.");

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
  });
  if (!landlord || landlord.role !== "LANDLORD") {
    throw new Error("Only property owners can approve applications.");
  }

  // Fetch application and verify landlord ownership
  const application = await db.rentalApplication.findFirst({
    where: {
      id: applicationId,
      property: { landlordId: landlord.id },
    },
    include: {
      property: true,
      room: true,
      bed: true,
    },
  });

  if (!application) throw new Error("Application not found or unauthorized.");
  if (application.status === "APPROVED") throw new Error("Application is already approved.");

  const rentAmount = rentAmountRaw ? parseFloat(rentAmountRaw) : (application.bed?.priceMonthly || application.property.priceMonthly || 0);
  const depositAmount = depositAmountRaw ? parseFloat(depositAmountRaw) : rentAmount * 2;

  // Transaction: Update application status, create lease, mark bed occupied
  await db.$transaction(async (tx) => {
    // 1. Update application status
    await tx.rentalApplication.update({
      where: { id: applicationId },
      data: { status: "APPROVED" },
    });

    // 2. Generate active Lease agreement awaiting resident E-Signature
    await tx.lease.create({
      data: {
        tenantId: application.tenantId,
        propertyId: application.propertyId,
        roomId: application.roomId,
        bedId: application.bedId,
        startDate: application.moveInDate,
        rentAmount,
        depositAmount,
        status: "ACTIVE",
        isSigned: false,
      },
    });

    // 3. Mark the allocated bed as occupied
      if (application.bedId) {
        await tx.bed.update({
          where: { id: application.bedId },
          data: { status: "OCCUPIED" },
        });
      }
  });

  revalidatePath("/dashboard/landlord/applications");
  revalidatePath("/dashboard/landlord");
  revalidatePath("/dashboard/tenant");
}

export async function rejectApplicationAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const applicationId = formData.get("applicationId") as string;

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
  });
  if (!landlord || landlord.role !== "LANDLORD") {
    throw new Error("Unauthorized.");
  }

  const application = await db.rentalApplication.findFirst({
    where: {
      id: applicationId,
      property: { landlordId: landlord.id },
    },
  });

  if (!application) throw new Error("Application not found.");

  await db.rentalApplication.update({
    where: { id: applicationId },
    data: { status: "REJECTED" },
  });

  revalidatePath("/dashboard/landlord/applications");
}