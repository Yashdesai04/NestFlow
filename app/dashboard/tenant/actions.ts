"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { TicketPriority } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createMaintenanceTicket(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) throw new Error("User record not found");

  const propertyId = formData.get("propertyId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priorityRaw = formData.get("priority") as string;
  const priority: TicketPriority = 
    priorityRaw === "HIGH" || priorityRaw === "LOW" ? priorityRaw : "MEDIUM";

  if (!propertyId || !title) {
    throw new Error("Property and title are required.");
  }

  await db.maintenanceTicket.create({
    data: {
      tenantId: user.id,
      propertyId,
      title,
      description,
      priority,
      status: "OPEN",
    },
  });

  revalidatePath("/dashboard/tenant");
}