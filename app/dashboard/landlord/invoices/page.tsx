import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { createInvoiceAction, markInvoicePaidAction } from "./actions";
import {
  ArrowLeft,
  Receipt,
  PlusCircle,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  User,
  Zap,
  Check,
  ShieldCheck,
  Send,
} from "lucide-react";

export default async function LandlordInvoicesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!landlord || landlord.role !== "LANDLORD") {
    redirect("/onboarding");
  }

  // 1. Fetch Active Leases for Invoice Target Selection
  const activeLeases = await db.lease.findMany({
    where: {
      property: { landlordId: landlord.id },
      status: "ACTIVE",
    },
    include: {
      tenant: true,
      property: true,
      room: true,
      bed: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch All Issued Invoices for Landlord's Properties
  const invoices = await db.payment.findMany({
    where: {
      lease: { property: { landlordId: landlord.id } },
    },
    include: {
      tenant: true,
      lease: {
        include: {
          property: true,
          room: true,
          bed: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate Metrics
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((i) => i.status === "PAID");
  const pendingInvoices = invoices.filter((i) => i.status === "PENDING");

  const totalCollected = paidInvoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalReceivables = pendingInvoices.reduce((acc, i) => acc + i.totalAmount, 0);

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient Theme Background Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0" />

      <main className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Header Banner */}
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/landlord/operations"
                className="p-2.5 rounded-2xl bg-white/80 dark:bg-white/10 border border-orange-200/60 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-rose-400 transition shadow-xs"
                title="Back to Landlord Operations"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-200/60 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                <Receipt className="w-3.5 h-3.5" />
                <span>Billing & Split Utilities</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Rent & Utility Invoicing
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-xl">
              Issue monthly rent invoices, split electricity/water charges, and record payments.
            </p>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Total Collected
            </span>
            <div className="text-2xl font-black text-slate-950 dark:text-white mt-1">
              {formatCurrency(totalCollected)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">
              {paidInvoices.length} settled payments
            </p>
          </div>

          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">
              Pending Receivables
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {formatCurrency(totalReceivables)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">
              {pendingInvoices.length} awaiting tenant checkout
            </p>
          </div>

          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-500">
              Active Tenants
            </span>
            <div className="text-2xl font-black text-slate-950 dark:text-white mt-1">
              {activeLeases.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">
              Residents eligible for billing
            </p>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Generate Invoice Form */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-2xl space-y-5 sticky top-28">
              <div className="flex items-center gap-2 border-b border-orange-100 dark:border-white/10 pb-4">
                <PlusCircle className="w-4 h-4 text-orange-500 dark:text-rose-400" />
                <h2 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider">
                  Issue Monthly Invoice
                </h2>
              </div>

              {activeLeases.length > 0 ? (
                <form action={createInvoiceAction} className="space-y-4 text-xs">
                  {/* Select Tenant Lease */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Select Resident *
                    </label>
                    <select
                      name="leaseId"
                      required
                      className="w-full bg-white/80 dark:bg-slate-900 border border-orange-200/60 dark:border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none font-medium cursor-pointer"
                    >
                      <option value="">-- Choose Resident --</option>
                      {activeLeases.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.tenant.fullName || l.tenant.email} ({l.property.title} · Room {l.room?.roomNumber || "-"})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Base Rent */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                      <span>Base Rent (₹) *</span>
                    </label>
                    <input
                      type="number"
                      name="rentAmount"
                      required
                      step="1"
                      placeholder="e.g. 8500"
                      className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none font-medium"
                    />
                  </div>

                  {/* Utility Charges */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Split Utilities / Electricity (₹)</span>
                    </label>
                    <input
                      type="number"
                      name="utilityAmount"
                      step="1"
                      defaultValue="0"
                      placeholder="e.g. 750"
                      className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none font-medium"
                    />
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-sky-500" />
                      <span>Payment Due Date *</span>
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      required
                      className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-3.5 py-2.5 text-xs font-medium cursor-pointer [color-scheme:light_dark]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold text-xs py-3 rounded-2xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Invoice to Resident</span>
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  <p>No active resident leases found to bill.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Invoices Feed */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-black text-slate-950 dark:text-white">
              Issued Invoices & Payments ({invoices.length})
            </h2>

            {invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.map((inv) => {
                  const isPaid = inv.status === "PAID";

                  return (
                    <div
                      key={inv.id}
                      className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-sm font-black text-slate-950 dark:text-white">
                            {inv.tenant.fullName || "Resident"}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            ({inv.lease.property.title} · Room {inv.lease.room?.roomNumber || "-"})
                          </span>
                          <span
                            className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                              isPaid
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/60"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/60"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                          <span>Rent: <strong>{formatCurrency(inv.rentAmount)}</strong></span>
                          <span>·</span>
                          <span>Utilities: <strong>{formatCurrency(inv.utilityAmount)}</strong></span>
                          {inv.dueDate && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                Due: {new Date(inv.dueDate).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right Action: Total & Mark Settled */}
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
                        <span className="text-base font-black text-slate-950 dark:text-white">
                          {formatCurrency(inv.totalAmount)}
                        </span>

                        {isPaid ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Payment Received</span>
                          </span>
                        ) : (
                          <form action={markInvoicePaidAction}>
                            <input type="hidden" name="paymentId" value={inv.id} />
                            <button
                              type="submit"
                              className="text-[10px] font-black bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>Mark Paid (Cash/UPI)</span>
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white/60 dark:bg-white/[0.03] border border-dashed border-orange-200/80 dark:border-white/15 rounded-3xl p-12 text-center">
                <Receipt className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h3 className="font-black text-slate-900 dark:text-white text-base">No Invoices Issued</h3>
                <p className="text-xs text-slate-500 mt-1">Use the form on the left to issue your first monthly invoice to a resident.</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}