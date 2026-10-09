import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { approveApplicationAction, rejectApplicationAction } from "./actions";
import {
  ArrowLeft,
  FileCheck2,
  Building2,
  User,
  Phone,
  Mail,
  Calendar,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  ShieldCheck,
  Check,
  X,
  Bed,
} from "lucide-react";

export default async function LandlordApplicationsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!landlord || landlord.role !== "LANDLORD") {
    redirect("/onboarding");
  }

  // Fetch all applications across this landlord's properties
  const applications = await db.rentalApplication.findMany({
    where: {
      property: { landlordId: landlord.id },
    },
    include: {
      tenant: true,
      property: true,
      room: true,
      bed: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalApplications = applications.length;
  const pendingApplications = applications.filter((a) => a.status === "PENDING");
  const approvedApplications = applications.filter((a) => a.status === "APPROVED");

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0" />

      <main className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Navigation & Header */}
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-rose-500/15 border border-orange-200/60 dark:border-rose-500/30 text-orange-700 dark:text-rose-400 text-[11px] font-black uppercase tracking-wider">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Tenant Screening</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Tenancy Applications & Leases
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-xl">
              Screen incoming resident applications, approve accommodations, and generate binding lease agreements.
            </p>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">Pending Review</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingApplications.length} Awaiting</div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">Requires landlord verification</p>
          </div>

          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500">Approved & Leased</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{approvedApplications.length} Active</div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">Lease contracts created</p>
          </div>

          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Inquiries</span>
            <div className="text-2xl font-black text-slate-950 dark:text-white mt-1">{totalApplications}</div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">Across all your listings</p>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          <h2 className="text-base font-black text-slate-950 dark:text-white">
            Received Applications ({applications.length})
          </h2>

          {applications.length > 0 ? (
            <div className="space-y-6">
              {applications.map((app) => {
                const isPending = app.status === "PENDING";
                const isApproved = app.status === "APPROVED";
                const isRejected = app.status === "REJECTED";

                const defaultRent = app.bed?.priceMonthly || app.property.priceMonthly || 0;
                const defaultDeposit = defaultRent * 2;

                return (
                  <div
                    key={app.id}
                    className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-2xl space-y-6"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orange-100 dark:border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap mb-1">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                              isApproved
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/60"
                                : isRejected
                                ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200/60"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/60"
                            }`}
                          >
                            {app.status}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Applied: {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="text-base font-black text-slate-950 dark:text-white">
                          {app.property.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 font-medium">
                          <Bed className="w-3.5 h-3.5 text-orange-500" />
                          <span>
                            {app.room ? `Room ${app.room.roomNumber}` : "Room Unspecified"} · {app.bed ? `Bed ${app.bed.bedNumber}` : "Single Unit"}
                          </span>
                        </p>
                      </div>

                      {/* Applicant Profile Box */}
                      <div className="p-3.5 bg-white/60 dark:bg-white/[0.03] border border-orange-100/80 dark:border-white/10 rounded-2xl text-xs space-y-1.5 min-w-[220px]">
                        <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                          Applicant Details
                        </span>
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{app.tenant.fullName || "Prospective Tenant"}</span>
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{app.tenant.email}</span>
                        </p>
                        {app.tenant.phone && (
                          <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{app.tenant.phone}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Applicant Profile Specs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                        <span className="text-[10px] font-black uppercase text-slate-400 block">Move-in Date</span>
                        <span className="font-bold text-slate-900 dark:text-white mt-0.5 block flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-sky-500" />
                          {new Date(app.moveInDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                        <span className="text-[10px] font-black uppercase text-slate-400 block">Occupation</span>
                        <span className="font-bold text-slate-900 dark:text-white mt-0.5 block flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                          {app.occupation || "Working Professional"}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                        <span className="text-[10px] font-black uppercase text-slate-400 block">Monthly Income</span>
                        <span className="font-bold text-slate-900 dark:text-white mt-0.5 block flex items-center gap-1">
                          <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                          {app.monthlyIncome ? formatCurrency(app.monthlyIncome) : "Not Specified"}
                        </span>
                      </div>
                    </div>

                    {/* Action Panel for Pending Applications */}
                    {isPending && (
                      <div className="pt-2 border-t border-orange-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <form action={approveApplicationAction} className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                          <input type="hidden" name="applicationId" value={app.id} />
                          <div className="flex items-center gap-2">
                            <div>
                              <input
                                type="number"
                                name="rentAmount"
                                defaultValue={defaultRent}
                                placeholder="Monthly Rent"
                                className="w-32 bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-medium outline-none"
                              />
                            </div>
                            <div>
                              <input
                                type="number"
                                name="depositAmount"
                                defaultValue={defaultDeposit}
                                placeholder="Deposit"
                                className="w-32 bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-medium outline-none"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Generate Lease</span>
                          </button>
                        </form>

                        <form action={rejectApplicationAction}>
                          <input type="hidden" name="applicationId" value={app.id} />
                          <button
                            type="submit"
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </form>
                      </div>
                    )}

                    {isApproved && (
                      <div className="p-3 rounded-2xl bg-emerald-500/[0.06] border border-emerald-200/60 dark:border-emerald-500/20 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                        <span className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Lease Generated & Assigned. Awaiting tenant counter-signature.</span>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/60 dark:bg-white/[0.03] border border-dashed border-orange-200/80 dark:border-white/15 rounded-3xl p-12 text-center">
              <FileCheck2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="font-black text-slate-900 dark:text-white text-base">No Tenancy Inquiries Yet</h3>
              <p className="text-xs text-slate-500 mt-1">Incoming bed booking applications submitted by prospective tenants will show up here.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}