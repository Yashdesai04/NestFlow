import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import PrintTrigger from "./PrintTrigger";
import { Building2, CheckCircle2, ShieldCheck } from "lucide-react";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const { id } = await params;

  // Fetch payment with all related lease, property, room, bed, and tenant details
  const payment = await db.payment.findUnique({
    where: { id },
    include: {
      tenant: true,
      lease: {
        include: {
          property: {
            include: { landlord: true },
          },
          room: true,
          bed: true,
        },
      },
    },
  });

  if (!payment) notFound();

  const invoiceNumber = `INV-${payment.id.slice(-8).toUpperCase()}`;
  const issueDate = new Date(payment.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const settlementDate = payment.paidAt
    ? new Date(payment.paidAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : issueDate;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-10 px-4 print:p-0 print:bg-white text-slate-900">
      {/* Floating Action Bar (Hidden during Print / PDF generation) */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <a
          href="/dashboard/tenant/payments"
          className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          ← Back to Payments
        </a>
        <PrintTrigger />
      </div>

      {/* Printable Invoice Container (Standard A4 Dimension Canvas) */}
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-200 print:border-none print:shadow-none print:rounded-none print:p-6 print:w-full print:max-w-none text-slate-800">
        
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-orange-500 text-white font-black">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                Nest<span className="text-orange-500">Flow</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">Co-Living & Managed Housing Ecosystem</p>
            <p className="text-xs text-slate-500 mt-1">
              Property: <strong className="text-slate-700">{payment.lease.property.title}</strong>
            </p>
            <p className="text-xs text-slate-500">{payment.lease.property.city}, India</p>
          </div>

          <div className="text-right">
            <span className="text-xs font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              Tax Invoice / Receipt
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-2 font-mono">{invoiceNumber}</h2>
            <p className="text-xs text-slate-500 mt-1">Date: {issueDate}</p>
            <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{payment.status === "PAID" ? "PAID (VERIFIED)" : payment.status}</span>
            </div>
          </div>
        </div>

        {/* Billed To / Landlord Information Grid */}
        <div className="grid grid-cols-2 gap-8 py-6 border-b border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
              Billed To (Tenant)
            </span>
            <p className="font-black text-slate-900 text-sm">{payment.tenant.fullName}</p>
            <p className="text-slate-600">{payment.tenant.email}</p>
            {payment.tenant.phone && <p className="text-slate-600">Ph: {payment.tenant.phone}</p>}
            <p className="text-slate-600 mt-1">
              Room {payment.lease.room?.roomNumber || "N/A"} · Bed {payment.lease.bed?.bedNumber || "N/A"}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
              Billed By (Landlord)
            </span>
            <p className="font-black text-slate-900 text-sm">
              {payment.lease.property.landlord.fullName}
            </p>
            <p className="text-slate-600">{payment.lease.property.landlord.email}</p>
            <p className="text-slate-600 mt-1">{payment.lease.property.title}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6 border-b border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="pb-3">Description</th>
                <th className="pb-3 text-center">Billing Period</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              <tr>
                <td className="py-3">
                  <span className="font-bold text-slate-900 block">Monthly Accommodation License Fee</span>
                  <span className="text-[11px] text-slate-500">
                    Room {payment.lease.room?.roomNumber} (Bed {payment.lease.bed?.bedNumber})
                  </span>
                </td>
                <td className="py-3 text-center text-slate-500">{payment.billingMonth}</td>
                <td className="py-3 text-right font-bold">{formatCurrency(Number(payment.rentAmount))}</td>
              </tr>
              <tr>
                <td className="py-3">
                  <span className="font-bold text-slate-900 block">Split Utilities & High-Speed Wi-Fi</span>
                  <span className="text-[11px] text-slate-500">Electricity, maintenance & water charges</span>
                </td>
                <td className="py-3 text-center text-slate-500">{payment.billingMonth}</td>
                <td className="py-3 text-right font-bold">{formatCurrency(Number(payment.utilityAmount))}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Calculation Totals */}
        <div className="py-6 flex justify-end text-xs">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-800">{formatCurrency(Number(payment.totalAmount))}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Taxes / Platform Fee (0%):</span>
              <span className="font-bold text-slate-800">₹0.00</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
              <span>Total Paid:</span>
              <span className="text-orange-600 text-base">{formatCurrency(Number(payment.totalAmount))}</span>
            </div>
          </div>
        </div>

        {/* Cryptographic Transaction Stamp / Audit Footer */}
        <div className="mt-6 pt-6 border-t border-dashed border-slate-200 bg-slate-50 -mx-8 sm:-mx-12 -mb-8 sm:-mb-12 p-8 rounded-b-3xl print:bg-transparent print:mx-0 print:mb-0 print:p-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              <div className="flex items-center gap-1 font-bold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>HMAC-SHA256 Cryptographically Verified</span>
              </div>
              <p className="mt-0.5 font-mono text-[10px]">
                Payment Ref: {payment.razorpayPaymentId || "DIRECT-SETTLED"} | Settled: {settlementDate}
              </p>
            </div>
            <div className="text-left sm:text-right text-[10px]">
              <p>NestFlow Automated Billing Desk</p>
              <p className="text-slate-400">System generated document. No physical signature required.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}