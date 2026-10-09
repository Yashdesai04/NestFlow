"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function signLeaseAgreement(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const leaseId = formData.get("leaseId") as string;
  const signatureData = formData.get("signatureData") as string;
  const termsAccepted = formData.get("termsAccepted") === "on";

  if (!leaseId || !signatureData || !termsAccepted) {
    throw new Error("You must accept all terms and provide your signature.");
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) throw new Error("Resident record not found.");

  // Verify lease belongs to authenticated tenant
  const lease = await db.lease.findFirst({
    where: { id: leaseId, tenantId: user.id },
  });

  if (!lease) throw new Error("Lease agreement not found.");

  await db.lease.update({
    where: { id: leaseId },
    data: {
      isSigned: true,
      tenantSignature: signatureData,
      signedAt: new Date(),
      termsAccepted: true,
    },
  });

  revalidatePath("/dashboard/tenant/lease");
  revalidatePath("/dashboard/tenant");
}