"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function checkInVisitorAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const passId = formData.get("passId") as string;
  if (!passId) throw new Error("Pass ID is required.");

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
  });
  if (!landlord || landlord.role !== "LANDLORD") {
    throw new Error("Unauthorized.");
  }

  const pass = await db.gatePass.findFirst({
    where: {
      id: passId,
      property: { landlordId: landlord.id },
    },
  });

  if (!pass) throw new Error("Gate pass not found or unauthorized.");

  await db.gatePass.update({
    where: { id: passId },
    data: {
      status: "CHECKED_IN",
      entryTime: new Date(),
    },
  });

  revalidatePath("/dashboard/landlord/gatepass");
  revalidatePath("/dashboard/tenant/gatepass");
}

export async function checkOutVisitorAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const passId = formData.get("passId") as string;
  if (!passId) throw new Error("Pass ID is required.");

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
  });
  if (!landlord || landlord.role !== "LANDLORD") {
    throw new Error("Unauthorized.");
  }

  const pass = await db.gatePass.findFirst({
    where: {
      id: passId,
      property: { landlordId: landlord.id },
    },
  });

  if (!pass) throw new Error("Gate pass not found or unauthorized.");

  await db.gatePass.update({
    where: { id: passId },
    data: {
      status: "CHECKED_OUT",
      exitTime: new Date(),
    },
  });

  revalidatePath("/dashboard/landlord/gatepass");
  revalidatePath("/dashboard/tenant/gatepass");
}

export async function revokePassAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const passId = formData.get("passId") as string;

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
  });
  if (!landlord || landlord.role !== "LANDLORD") {
    throw new Error("Unauthorized.");
  }

  await db.gatePass.update({
    where: { id: passId },
    data: {
      status: "REVOKED",
    },
  });

  revalidatePath("/dashboard/landlord/gatepass");
}