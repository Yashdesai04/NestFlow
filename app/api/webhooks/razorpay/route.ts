import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[RAZORPAY_WEBHOOK_ERROR]: Missing RAZORPAY_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  // 1. Read signature header
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing x-razorpay-signature header" },
      { status: 400 }
    );
  }

  // 2. Read raw request text for cryptographic verification
  const rawBody = await req.text();

  // 3. Compute expected HMAC SHA-256 signature
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) {
    console.error("[RAZORPAY_WEBHOOK_INVALID_SIGNATURE]");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 4. Parse verified payload
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const event = payload.event;

  // 5. Process Successful Payment Events
  if (event === "payment.captured" || event === "order.paid") {
    const paymentEntity = payload.payload.payment.entity;

    // Retrieve database payment record ID passed during order creation notes
    const paymentRecordId =
      paymentEntity.notes?.paymentId ||
      paymentEntity.notes?.invoiceId ||
      payload.payload.order?.entity?.notes?.paymentId;

    if (!paymentRecordId) {
      console.warn(
        `[RAZORPAY_WEBHOOK]: No paymentId note found for transaction ${paymentEntity.id}`
      );
      return NextResponse.json(
        { received: true, warning: "No internal payment ID mapped" },
        { status: 200 }
      );
    }

    try {
      const existingPayment = await db.payment.findUnique({
        where: { id: paymentRecordId },
      });

      if (!existingPayment) {
        console.error(
          `[RAZORPAY_WEBHOOK]: Payment record ${paymentRecordId} not found`
        );
        return NextResponse.json(
          { error: "Payment record not found" },
          { status: 404 }
        );
      }

      // Transition to PAID
      await db.payment.update({
        where: { id: paymentRecordId },
        data: {
          status: "PAID",
        },
      });

      console.log(
        `[RAZORPAY_WEBHOOK]: Payment ${paymentRecordId} settled via ${paymentEntity.id}`
      );
    } catch (dbErr: any) {
      console.error("[RAZORPAY_WEBHOOK_DB_UPDATE_FAILED]:", dbErr);
      return NextResponse.json(
        { error: "Failed to update payment status" },
        { status: 500 }
      );
    }
  }

  // Always return 200 OK to acknowledge receipt to Razorpay
  return NextResponse.json({ received: true }, { status: 200 });
}