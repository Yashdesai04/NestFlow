"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitNoticeToVacate(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) throw new Error("User record missing");

  const leaseId = formData.get("leaseId") as string;
  const vacateDateRaw = formData.get("vacateDate") as string;

  if (!leaseId || !vacateDateRaw) {
    throw new Error("Lease ID and planned checkout date required");
  }

  await db.lease.update({
    where: { id: leaseId, tenantId: user.id },
    data: {
      endDate: new Date(vacateDateRaw),
    },
  });

  revalidatePath("/dashboard/tenant/lease");
  revalidatePath("/dashboard/landlord/tenants");
}