import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import PayRentButton from "./PayRentButton";
import {
  ArrowLeft,
  Receipt,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

export default async function TenantPaymentsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) redirect("/onboarding");

  // Fetch Tenant Payments with Property, Room, and Bed Details
  const payments = await db.payment.findMany({
    where: { tenantId: user.id },
    include: {
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

  const totalInvoices = payments.length;
  const pendingPayments = payments.filter((p) => p.status === "PENDING");
  const totalPendingAmount = pendingPayments.reduce(
    (acc, p) => acc + Number(p.totalAmount),
    0
  );
  const paidPaymentsCount = payments.filter((p) => p.status === "PAID").length;

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0" />

      <main className="max-w-5xl mx-auto relative z-10 space-y-8">
        
        {/* Navigation Breadcrumb & Header */}
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/tenant"
                className="p-2.5 rounded-2xl bg-white/80 dark:bg-white/10 border border-orange-200/60 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-rose-400 transition shadow-xs"
                title="Back to Resident Portal"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-200/60 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                <Receipt className="w-3.5 h-3.5" />
                <span>Online Payment Gateway</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Rent & Utility Invoices
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-xl">
              Pay monthly rent, split electricity, and settle amenity charges securely online via Razorpay.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-orange-200/60 dark:border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-xs flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-orange-500 dark:text-rose-400" />
              <span>
                <span className="text-slate-950 dark:text-white font-black">{totalInvoices}</span> Invoices
              </span>
            </span>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Outstanding Due */}
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm dark:shadow-xl hover:translate-y-[-2px] transition duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Outstanding Due
              </span>
              <div className="p-2.5 bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-200/50 dark:border-amber-400/20">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {formatCurrency(totalPendingAmount)}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-semibold">
              {pendingPayments.length} pending {pendingPayments.length === 1 ? "invoice" : "invoices"}
            </p>
          </div>

          {/* Settled Invoices */}
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm dark:shadow-xl hover:translate-y-[-2px] transition duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Settled Invoices
              </span>
              <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200/50 dark:border-emerald-400/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
              {paidPaymentsCount} Paid
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Direct settlement
            </p>
          </div>

          {/* Billing Cycle */}
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm dark:shadow-xl hover:translate-y-[-2px] transition duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Billing Cycle
              </span>
              <div className="p-2.5 bg-sky-500/10 dark:bg-sky-400/15 text-sky-600 dark:text-sky-400 rounded-2xl border border-sky-200/50 dark:border-sky-400/20">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
              Monthly
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-semibold">
              Due on 1st of every month
            </p>
          </div>
        </div>

        {/* Invoice Ledger Feed */}
        {payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((p) => {
              return (
                <div
                  key={p.id}
                  className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-2xl hover:shadow-lg dark:hover:shadow-rose-500/10 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  {/* Left Column: Property & Fee Breakdowns */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="p-2 rounded-xl bg-orange-500/10 dark:bg-rose-500/15 text-orange-600 dark:text-rose-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-slate-950 dark:text-white text-base">
                        {p.lease.property.title}
                      </h3>
                      {p.lease.room && p.lease.bed && (
                        <span className="text-[10px] font-black bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                          Room {p.lease.room.roomNumber} · Bed {p.lease.bed.bedNumber}
                        </span>
                      )}
                    </div>

                    {/* Breakdown Tag Pills */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="bg-white/60 dark:bg-white/[0.03] px-3 py-1.5 rounded-xl border border-orange-100/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 font-medium">
                        <span className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase mr-1">
                          Base Rent:
                        </span>
                        <span className="font-bold">{formatCurrency(Number(p.rentAmount))}</span>
                      </div>

                      <div className="bg-white/60 dark:bg-white/[0.03] px-3 py-1.5 rounded-xl border border-orange-100/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 font-medium">
                        <span className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase mr-1">
                          Split Utilities:
                        </span>
                        <span className="font-bold">{formatCurrency(Number(p.utilityAmount))}</span>
                      </div>

                      {p.dueDate && (
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            Due:{" "}
                            {new Date(p.dueDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Amount & Interactive Razorpay Action Button */}
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-orange-100 dark:border-white/10 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block">
                        Total Payable
                      </span>
                      <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500 dark:from-rose-400 dark:to-purple-300 text-xl tracking-tight">
                        {formatCurrency(Number(p.totalAmount))}
                      </span>
                    </div>

                    <PayRentButton
                      payment={{
                        id: p.id,
                        totalAmount: Number(p.totalAmount),
                        status: p.status,
                      }}
                      user={{
                        fullName: user.fullName,
                        email: user.email,
                        phone: user.phone,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/70 dark:bg-white/[0.05] border border-dashed border-orange-200/80 dark:border-white/15 backdrop-blur-2xl rounded-3xl p-12 sm:p-16 text-center max-w-xl mx-auto my-8 shadow-sm dark:shadow-xl">
            <div className="w-14 h-14 bg-orange-500/10 dark:bg-rose-500/15 border border-orange-200/60 dark:border-rose-500/20 text-orange-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-7 h-7" />
            </div>

            <h3 className="font-black text-slate-950 dark:text-white text-lg">
              No Invoices Generated Yet
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
              You are all settled! Once your landlord issues monthly split utility bills or rent invoices, they will appear here.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}