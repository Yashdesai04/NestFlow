import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(req: Request) {
  // 1. Authenticate Request via Bearer Token
  const authHeader = req.headers.get("authorization");
  const expectedSecret = `Bearer ${process.env.CRON_SECRET}`;

  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== expectedSecret
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Define calendar boundaries for the current billing cycle
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

  // Set standard rent due date (5th of the current month)
  const dueDate = new Date(currentYear, currentMonth, 5, 23, 59, 59);

  try {
    // 2. Fetch all active and legally signed agreements
    const activeLeases = await db.lease.findMany({
      where: {
        status: "ACTIVE",
        isSigned: true,
      },
      include: {
        payments: {
          where: {
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        },
      },
    });

    let generatedCount = 0;
    let skippedCount = 0;

    // 3. Process Invoices Idempotently
    for (const lease of activeLeases) {
      // Skip if an invoice has already been generated for this month
      if (lease.payments.length > 0) {
        skippedCount++;
        continue;
      }

      await db.payment.create({
        data: {
          leaseId: lease.id,
          tenantId: lease.tenantId,
          rentAmount: lease.rentAmount,
          utilityAmount: 0.0,
          totalAmount: lease.rentAmount,
          dueDate,
          status: "PENDING",
        },
      });

      generatedCount++;
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      cycle: `${now.toLocaleString("default", { month: "long" })} ${currentYear}`,
      activeLeasesEvaluated: activeLeases.length,
      invoicesCreated: generatedCount,
      alreadyInvoiced: skippedCount,
    });
  } catch (error: any) {
    console.error("[CRON_INVOICE_GENERATION_FAILED]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}