"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createInvoiceAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const leaseId = formData.get("leaseId") as string;
  const rentAmount = parseFloat(formData.get("rentAmount") as string) || 0;
  const utilityAmount = parseFloat(formData.get("utilityAmount") as string) || 0;
  const dueDateStr = formData.get("dueDate") as string;

  if (!leaseId) throw new Error("Please select an active resident lease.");

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
  });
  if (!landlord) throw new Error("Landlord record not found.");

  // Verify the lease belongs to one of this landlord's properties
  const lease = await db.lease.findFirst({
    where: {
      id: leaseId,
      property: { landlordId: landlord.id },
    },
    include: { tenant: true },
  });

  if (!lease) throw new Error("Unauthorized or lease not found.");

  const totalAmount = rentAmount + utilityAmount;
  const dueDate = dueDateStr ? new Date(dueDateStr) : new Date();

  await db.payment.create({
    data: {
      leaseId: lease.id,
      tenantId: lease.tenantId,
      rentAmount,
      utilityAmount,
      totalAmount,
      dueDate,
      status: "PENDING",
    },
  });

  revalidatePath("/dashboard/landlord/invoices");
  revalidatePath("/dashboard/tenant/payments");
  revalidatePath("/dashboard/tenant");
}

export async function markInvoicePaidAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const paymentId = formData.get("paymentId") as string;
  if (!paymentId) throw new Error("Payment ID is required.");

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
  });
  if (!landlord) throw new Error("Landlord record not found.");

  const payment = await db.payment.findFirst({
    where: {
      id: paymentId,
      lease: { property: { landlordId: landlord.id } },
    },
  });

  if (!payment) throw new Error("Invoice not found or unauthorized.");

  await db.payment.update({
    where: { id: paymentId },
    data: { status: "PAID" },
  });

  revalidatePath("/dashboard/landlord/invoices");
  revalidatePath("/dashboard/tenant/payments");
  revalidatePath("/dashboard/tenant");
}