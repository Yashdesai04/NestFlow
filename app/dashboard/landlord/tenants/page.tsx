import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import VacateButton from "./VacateButton";
import {
  ArrowLeft,
  Users,
  Building2,
  Bed,
  Phone,
  Mail,
  Calendar,
  FileCheck2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  LogOut,
  AlertCircle,
  IndianRupee,
  Search,
} from "lucide-react";

export default async function LandlordTenantsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!landlord || landlord.role !== "LANDLORD") {
    redirect("/onboarding");
  }

  // Fetch all leases across landlord's properties
  const leases = await db.lease.findMany({
    where: {
      property: { landlordId: landlord.id },
    },
    include: {
      tenant: true,
      property: true,
      room: true,
      bed: true,
      payments: {
        where: { status: "PENDING" },
      },
    },
    orderBy: { startDate: "desc" },
  });

  const activeLeases = leases.filter((l) => l.status === "ACTIVE");
  const pastLeases = leases.filter((l) => l.status !== "ACTIVE");
  const signedLeasesCount = activeLeases.filter((l) => l.isSigned).length;
  const pendingSignaturesCount = activeLeases.length - signedLeasesCount;

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0" />

      <main className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Navigation & Header Banner */}
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 dark:bg-sky-400/10 border border-sky-200/60 dark:border-sky-500/30 text-sky-700 dark:text-sky-300 text-[11px] font-black uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" />
                <span>Tenancy Directory</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Resident Directory & Leases
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-xl">
              Track active occupants, monitor signed legal contracts, and manage offboarding/move-outs.
            </p>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Residents
            </span>
            <div className="text-2xl font-black text-slate-950 dark:text-white mt-1">
              {activeLeases.length} Occupants
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">Across all your listings</p>
          </div>

          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              E-Signed Leases
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {signedLeasesCount} / {activeLeases.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">
              {pendingSignaturesCount > 0 ? `${pendingSignaturesCount} signature(s) pending` : "All leases counter-signed"}
            </p>
          </div>

          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Historical Tenants
            </span>
            <div className="text-2xl font-black text-slate-950 dark:text-white mt-1">
              {pastLeases.length} Offboarded
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">Past vacated residents</p>
          </div>
        </div>

        {/* Active Residents Feed */}
        <div className="space-y-4">
          <h2 className="text-base font-black text-slate-950 dark:text-white flex items-center justify-between">
            <span>Currently Active Residents ({activeLeases.length})</span>
          </h2>

          {activeLeases.length > 0 ? (
            <div className="space-y-4">
              {activeLeases.map((l) => {
                const pendingDues = l.payments.reduce((acc, p) => acc + p.totalAmount, 0);

                return (
                  <div
                    key={l.id}
                    className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    {/* Left Info: Resident & Property Assignment */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-base font-black text-slate-950 dark:text-white">
                          {l.tenant.fullName || "Resident"}
                        </h3>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border flex items-center gap-1 ${
                            l.isSigned
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/60"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/60"
                          }`}
                        >
                          {l.isSigned ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{l.isSigned ? "Lease E-Signed" : "Signature Pending"}</span>
                        </span>

                        {pendingDues > 0 && (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200/60">
                            ₹{pendingDues} Unpaid Dues
                          </span>
                        )}
                      </div>

                      {/* Contact & Accommodation details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400 shrink-0" />
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {l.property.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Bed className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span>
                            {l.room ? `Room ${l.room.roomNumber}` : "Room -"} · {l.bed ? `Bed ${l.bed.bedNumber}` : "Single"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            Started: {new Date(l.startDate).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{l.tenant.email}</span>
                        </div>

                        {l.tenant.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <a href={`tel:${l.tenant.phone}`} className="hover:text-orange-600 underline font-medium">
                              {l.tenant.phone}
                            </a>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5">
                          <IndianRupee className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>
                            Rent: <strong>{formatCurrency(l.rentAmount)}</strong> / mo
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Actions: Vacate Resident */}
                    <div className="pt-4 lg:pt-0 border-t lg:border-t-0 border-orange-100 dark:border-white/10 flex items-center justify-end shrink-0">
                      <VacateButton
                        leaseId={l.id}
                        tenantName={l.tenant.fullName || l.tenant.email}
                        roomNumber={l.room?.roomNumber}
                        bedNumber={l.bed?.bedNumber}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/60 dark:bg-white/[0.03] border border-dashed border-orange-200/80 dark:border-white/15 rounded-3xl p-12 text-center">
              <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="font-black text-slate-900 dark:text-white text-base">No Active Residents</h3>
              <p className="text-xs text-slate-500 mt-1">Approve pending applications to onboard new tenants and assign beds.</p>
            </div>
          )}
        </div>

        {/* Past Offboarded Tenants Accordion / List */}
        {pastLeases.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-orange-100 dark:border-white/10">
            <h2 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Past Tenants History ({pastLeases.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastLeases.map((l) => (
                <div
                  key={l.id}
                  className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 text-xs flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {l.tenant.fullName || l.tenant.email}
                    </h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {l.property.title} · Vacated on {l.endDate ? new Date(l.endDate).toLocaleDateString() : "Terminated"}
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}