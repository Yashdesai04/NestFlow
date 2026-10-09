"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Helper to verify landlord property access
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

// 1. Assign Tenant to Bed & Create Lease
export async function createLeaseAndAssignBed(formData: FormData) {
  const propertyId = formData.get("propertyId") as string;
  const bedId = formData.get("bedId") as string;
  const tenantEmail = (formData.get("tenantEmail") as string)?.trim().toLowerCase();
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const rentAmount = parseFloat(formData.get("rentAmount") as string) || 0;

  await verifyPropertyOwner(propertyId);

  // Find tenant by email in PostgreSQL
  const tenant = await db.user.findUnique({
    where: { email: tenantEmail },
  });

  if (!tenant) {
    throw new Error(`No registered account found with email "${tenantEmail}". Please ask the tenant to sign up on NestFlow first.`);
  }

  // Find target bed and ensure it belongs to this property and is VACANT
  const bed = await db.bed.findUnique({
    where: { id: bedId },
    include: { room: true },
  });

  if (!bed || bed.room.propertyId !== propertyId) {
    throw new Error("Invalid bed selected.");
  }

  if (bed.status === "OCCUPIED") {
    throw new Error("Selected bed is already occupied.");
  }

  // Execute Lease creation and Bed status update in a database transaction
  await db.$transaction([
    db.lease.create({
      data: {
        propertyId,
        tenantId: tenant.id,
        roomId: bed.roomId,
        bedId: bed.id,
        startDate: startDateStr ? new Date(startDateStr) : new Date(),
        endDate: endDateStr ? new Date(endDateStr) : null,
        rentAmount,
        status: "ACTIVE",
      },
    }),
    db.bed.update({
      where: { id: bed.id },
      data: { status: "OCCUPIED" },
    }),
  ]);

  revalidatePath(`/dashboard/landlord/properties/${propertyId}/assign`);
  revalidatePath(`/dashboard/landlord/properties/${propertyId}`);
}

// 2. Terminate Lease & Reclaim Bed
export async function terminateLease(propertyId: string, leaseId: string, bedId: string | null) {
  await verifyPropertyOwner(propertyId);

  await db.$transaction([
    db.lease.update({
      where: { id: leaseId },
      data: { status: "TERMINATED" },
    }),
    ...(bedId
      ? [
          db.bed.update({
            where: { id: bedId },
            data: { status: "VACANT" },
          }),
        ]
      : []),
  ]);

  revalidatePath(`/dashboard/landlord/properties/${propertyId}/assign`);
  revalidatePath(`/dashboard/landlord/properties/${propertyId}`);
}