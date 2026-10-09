"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function verifyAdminAccess() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user || user.role !== "ADMIN") {
    throw new Error("Forbidden: Super Admin privileges required.");
  }

  return user;
}

// 1. Approve KYC
export async function approveKycAction(formData: FormData) {
  await verifyAdminAccess();
  const targetUserId = formData.get("userId") as string;
  if (!targetUserId) throw new Error("User ID is required.");

  await db.user.update({
    where: { id: targetUserId },
    data: {
      kycStatus: "APPROVED",
      isVerified: true,
    },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/kyc");
}

// 2. Reject KYC
export async function rejectKycAction(formData: FormData) {
  await verifyAdminAccess();
  const targetUserId = formData.get("userId") as string;
  if (!targetUserId) throw new Error("User ID is required.");

  await db.user.update({
    where: { id: targetUserId },
    data: {
      kycStatus: "REJECTED",
      isVerified: false,
    },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/kyc");
}

// 3. Property Moderation (Approve / Revoke)
export async function togglePropertyVerificationAction(formData: FormData) {
  await verifyAdminAccess();
  const propertyId = formData.get("propertyId") as string;
  const isVerified = formData.get("isVerified") === "true";

  if (!propertyId) throw new Error("Property ID is required.");

  await db.property.update({
    where: { id: propertyId },
    data: { isVerified },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/properties");
  revalidatePath("/properties");
}

// 4. Delete / Unlist Property
export async function deletePropertyAction(formData: FormData) {
  await verifyAdminAccess();
  const propertyId = formData.get("propertyId") as string;
  if (!propertyId) throw new Error("Property ID is required.");

  await db.property.delete({
    where: { id: propertyId },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/properties");
  revalidatePath("/properties");
}

// 5. Update User Role
export async function updateUserRoleAction(formData: FormData) {
  await verifyAdminAccess();
  const targetUserId = formData.get("userId") as string;
  const role = formData.get("role") as any;

  if (!targetUserId || !role) throw new Error("Missing parameters.");

  await db.user.update({
    where: { id: targetUserId },
    data: { role },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/users");
}