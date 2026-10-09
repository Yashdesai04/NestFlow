"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateTicketAssignment(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const ticketId = formData.get("ticketId") as string;
  const status = formData.get("status") as any;
  const assignedStaff = (formData.get("assignedStaff") as string) || null;
  const staffPhone = (formData.get("staffPhone") as string) || null;
  const estimatedCostRaw = formData.get("estimatedCost") as string;
  const resolutionNote = (formData.get("resolutionNote") as string) || null;

  if (!ticketId) throw new Error("Ticket ID is required.");

  const landlordUser = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!landlordUser) throw new Error("Landlord record not found.");

  // Verify that the ticket belongs to one of the landlord's properties
  const ticket = await db.maintenanceTicket.findFirst({
    where: {
      id: ticketId,
      property: { landlordId: landlordUser.id },
    },
  });

  if (!ticket) throw new Error("Ticket not found or unauthorized.");

  const estimatedCost = estimatedCostRaw ? parseFloat(estimatedCostRaw) : null;

  await db.maintenanceTicket.update({
    where: { id: ticketId },
    data: {
      status,
      assignedStaff: assignedStaff?.trim(),
      staffPhone: staffPhone?.trim(),
      estimatedCost,
      resolutionNote: resolutionNote?.trim(),
    },
  });

  revalidatePath("/dashboard/landlord/maintenance");
  revalidatePath("/dashboard/tenant");
}