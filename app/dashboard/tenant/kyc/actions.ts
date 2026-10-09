"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitKycAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const documentUrl = (formData.get("documentUrl") as string)?.trim();
  const documentType = (formData.get("documentType") as string)?.trim();
  const idNumber = (formData.get("idNumber") as string)?.trim();

  if (!documentUrl) {
    throw new Error("Please provide a valid document URL or upload link.");
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) throw new Error("User record not found in database.");

  if (user.kycStatus === "APPROVED") {
    throw new Error("Your KYC is already approved and active.");
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      kycDocumentUrl: documentUrl,
      kycStatus: "PENDING",
      isVerified: false,
    },
  });

  revalidatePath("/dashboard/tenant");
  revalidatePath("/dashboard/tenant/kyc");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/kyc");
}