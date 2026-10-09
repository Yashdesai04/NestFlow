"use server";

import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface VerifyPaymentParams {
  paymentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export async function verifyPaymentAction({
  paymentId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: VerifyPaymentParams) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized.");

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw new Error("Server payment secret missing.");

  // Construct expected signature: order_id + "|" + payment_id
  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(payload)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new Error("Invalid payment signature verification failed.");
  }

  // Settle invoice record
  await db.payment.update({
    where: { id: paymentId },
    data: {
      status: "PAID",
    },
  });

  revalidatePath("/dashboard/tenant");
  revalidatePath("/dashboard/tenant/payments");
  return { success: true };
}