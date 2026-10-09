import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId } = await req.json();
    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
    }

    // Verify invoice belongs to the authenticated user and is pending
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: { tenant: true },
    });

    if (!payment || payment.tenant.clerkId !== clerkId) {
      return NextResponse.json({ error: "Invoice not found or forbidden" }, { status: 404 });
    }

    if (payment.status === "PAID") {
      return NextResponse.json({ error: "This invoice has already been settled" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay credentials not configured" }, { status: 500 });
    }

    // Razorpay requires amounts in the smallest currency sub-unit (paise for INR)
    const amountInPaise = Math.round(payment.totalAmount * 100);
    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: `inv_${payment.id.slice(-10)}`,
        notes: {
          paymentId: payment.id,
          leaseId: payment.leaseId,
          tenantId: payment.tenantId,
        },
      }),
    });

    const order = await response.json();

    if (!response.ok) {
      console.error("[RAZORPAY_ORDER_CREATION_FAILED]:", order);
      return NextResponse.json(
        { error: order.error?.description || "Order creation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error: any) {
    console.error("[CHECKOUT_ROUTE_ERROR]:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}