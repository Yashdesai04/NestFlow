"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function vacateResidentAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const leaseId = formData.get("leaseId") as string;
  if (!leaseId) throw new Error("Lease ID is required.");

  const caller = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!caller || (caller.role !== "LANDLORD" && caller.role !== "ADMIN")) {
    throw new Error("Only property owners or administrators can offboard residents.");
  }

  // Fetch the lease with ownership check (bypassed if super admin)
  const lease = await db.lease.findFirst({
    where: {
      id: leaseId,
      ...(caller.role === "LANDLORD"
        ? { property: { landlordId: caller.id } }
        : {}),
    },
    include: { bed: true },
  });

  if (!lease) throw new Error("Lease agreement not found or unauthorized.");

  // Transaction: Terminate lease, stamp checkout date, release bed occupancy
  await db.$transaction(async (tx) => {
    // 1. Mark agreement as TERMINATED
    await tx.lease.update({
      where: { id: leaseId },
      data: {
        status: "TERMINATED",
        endDate: new Date(),
      },
    });

    // 2. Free up the bed to VACANT
    if (lease.bedId) {
      await tx.bed.update({
        where: { id: lease.bedId },
        data: { status: "VACANT" },
      });
    }
  });

  // Revalidate both landlord and tenant dashboards
  revalidatePath("/dashboard/landlord/tenants");
  revalidatePath("/dashboard/landlord/bed-grid");
  revalidatePath("/dashboard/landlord/applications");
  revalidatePath("/dashboard/landlord");
  revalidatePath("/dashboard/tenant");
  revalidatePath("/dashboard/tenant/lease");
  revalidatePath("/properties");
}