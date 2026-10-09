"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Landlord Finalizes Checkout & Releases Bed
export async function finalizeMoveOutAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!landlord || landlord.role !== "LANDLORD") {
    throw new Error("Only property managers can finalize lease terminations.");
  }

  const leaseId = formData.get("leaseId") as string;
  if (!leaseId) throw new Error("Lease ID is required.");

  const lease = await db.lease.findUnique({
    where: { id: leaseId },
    include: { property: true },
  });

  if (!lease || lease.property.landlordId !== landlord.id) {
    throw new Error("Lease record not found or unauthorized.");
  }

  // Atomic release: Terminate lease and set bed to VACANT
  await db.$transaction(async (tx) => {
    await tx.lease.update({
      where: { id: lease.id },
      data: {
        status: "TERMINATED",
        endDate: new Date(),
      },
    });

    if (lease.bedId) {
      await tx.bed.update({
        where: { id: lease.bedId },
        data: {
          status: "VACANT",
        },
      });
    }
  });

  revalidatePath("/dashboard/landlord");
  revalidatePath("/dashboard/landlord/operations");
  revalidatePath("/dashboard/tenant");
  revalidatePath("/dashboard/tenant/lease");
  revalidatePath("/properties");
}

// 2. Tenant Submits 30-Day Move-Out Request
export async function submitMoveOutNoticeAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const tenant = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!tenant) throw new Error("Tenant not found.");

  const leaseId = formData.get("leaseId") as string;
  const reason = (formData.get("reason") as string)?.trim() || "Relocation";

  const lease = await db.lease.findFirst({
    where: { id: leaseId, tenantId: tenant.id, status: "ACTIVE" },
  });

  if (!lease) throw new Error("Active lease not found.");

  // Log as maintenance/operational request for landlord review
  await db.maintenanceTicket.create({
    data: {
      propertyId: lease.propertyId,
      tenantId: tenant.id,
      title: "Move-Out Notice (30-Day Checkout)",
      description: `Tenant initiated formal move-out notice. Stated reason: ${reason}. Awaiting checkout inspection.`,
      priority: "HIGH",
      status: "OPEN",
    },
  });

  revalidatePath("/dashboard/tenant");
  revalidatePath("/dashboard/tenant/lease");
  revalidatePath("/dashboard/landlord/operations");
}