import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import {
  checkInVisitorAction,
  checkOutVisitorAction,
  revokePassAction,
} from "./actions";
import {
  ArrowLeft,
  QrCode,
  ShieldCheck,
  Building2,
  User,
  Phone,
  Clock,
  Calendar,
  CheckCircle2,
  LogOut,
  LogIn,
  AlertTriangle,
  Ban,
  UserCheck,
  Search,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{ query?: string; propertyId?: string }>;
}

export default async function LandlordGatePassPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      properties: true,
    },
  });

  if (!landlord || landlord.role !== "LANDLORD") {
    redirect("/onboarding");
  }

  const { query, propertyId } = await searchParams;

  // Build filter conditions
  const whereClause: any = {
    property: { landlordId: landlord.id },
  };

  if (propertyId) {
    whereClause.propertyId = propertyId;
  }

  if (query) {
    whereClause.OR = [
      { visitorName: { contains: query, mode: "insensitive" } },
      { passCode: { contains: query, mode: "insensitive" } },
      { visitorPhone: { contains: query, mode: "insensitive" } },
    ];
  }

  // Fetch all Gate Passes for landlord's properties
  const passes = await db.gatePass.findMany({
    where: whereClause,
    include: {
      property: true,
      tenant: {
        include: {
          leases: {
            where: { status: "ACTIVE" },
            include: { room: true, bed: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalPasses = passes.length;
  const insidePremisesCount = passes.filter((p) => p.status === "CHECKED_IN").length;
  const expectedTodayCount = passes.filter((p) => p.status === "APPROVED").length;
  const completedVisitsCount = passes.filter((p) => p.status === "CHECKED_OUT").length;

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-200/60 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Security Console</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Visitor Gate Pass & Entry Logs
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-xl">
              Verify pre-approved tenant visitor passes, monitor currently on-premise guests, and log gate check-outs.
            </p>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Inside Premises Now
            </span>
            <div className="text-2xl font-black text-slate-950 dark:text-white mt-1">
              {insidePremisesCount} Active Guests
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">Currently on-site</p>
          </div>

          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">
              Expected Arrivals
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {expectedTodayCount} Pre-Approved
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">Awaiting security check-in</p>
          </div>

          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-500">
              Completed Visits
            </span>
            <div className="text-2xl font-black text-slate-950 dark:text-white mt-1">
              {completedVisitsCount} Logged
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">Out of {totalPasses} total generated</p>
          </div>
        </div>

        {/* Search & Property Filter Bar */}
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center gap-3">
          <form method="GET" className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="query"
                defaultValue={query || ""}
                placeholder="Search visitor name, phone, or token code..."
                className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:border-orange-500"
              />
            </div>
            <button
              type="submit"
              className="bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl transition cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Visitor Passes Feed */}
        <div className="space-y-4">
          <h2 className="text-base font-black text-slate-950 dark:text-white">
            Security Gate Logs ({passes.length})
          </h2>

          {passes.length > 0 ? (
            <div className="space-y-4">
              {passes.map((pass) => {
                const isApproved = pass.status === "APPROVED";
                const isCheckedIn = pass.status === "CHECKED_IN";
                const isCheckedOut = pass.status === "CHECKED_OUT";
                const isRevoked = pass.status === "REVOKED";

                const activeLease = pass.tenant.leases?.[0];

                return (
                  <div
                    key={pass.id}
                    className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    {/* Left Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-black text-slate-950 dark:text-white">
                          {pass.visitorName}
                        </span>

                        <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-md uppercase">
                          Pass: {pass.passCode.slice(-6).toUpperCase()}
                        </span>

                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                            isCheckedIn
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/60"
                              : isApproved
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/60"
                              : isCheckedOut
                              ? "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200/60"
                              : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200/60"
                          }`}
                        >
                          {pass.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Detail Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span>
                            Host: <strong className="text-slate-900 dark:text-white">{pass.tenant.fullName || "Resident"}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span>
                            {pass.property.title} {activeLease?.room && `(Room ${activeLease.room.roomNumber})`}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            Valid: {new Date(pass.validDate).toLocaleDateString()}
                          </span>
                        </div>

                        {pass.visitorPhone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <a href={`tel:${pass.visitorPhone}`} className="hover:underline">
                              {pass.visitorPhone}
                            </a>
                          </div>
                        )}

                        {pass.entryTime && (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                            <LogIn className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              In: {new Date(pass.entryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        )}

                        {pass.exitTime && (
                          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                            <LogOut className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              Out: {new Date(pass.exitTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        )}
                      </div>

                      {pass.purpose && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-semibold">Purpose:</span> {pass.purpose}
                        </p>
                      )}
                    </div>

                    {/* Right Action Buttons */}
                    <div className="pt-3 lg:pt-0 border-t lg:border-t-0 border-orange-100 dark:border-white/10 flex items-center gap-2 shrink-0">
                      {isApproved && (
                        <>
                          <form action={checkInVisitorAction}>
                            <input type="hidden" name="passId" value={pass.id} />
                            <button
                              type="submit"
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <LogIn className="w-3.5 h-3.5" />
                              <span>Log Check-In</span>
                            </button>
                          </form>

                          <form action={revokePassAction}>
                            <input type="hidden" name="passId" value={pass.id} />
                            <button
                              type="submit"
                              className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 p-2 rounded-xl transition cursor-pointer"
                              title="Revoke entry pass"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </form>
                        </>
                      )}

                      {isCheckedIn && (
                        <form action={checkOutVisitorAction}>
                          <input type="hidden" name="passId" value={pass.id} />
                          <button
                            type="submit"
                            className="bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <LogOut className="w-3.5 h-3.5 text-amber-400" />
                            <span>Log Check-Out</span>
                          </button>
                        </form>
                      )}

                      {isCheckedOut && (
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Visit Ended</span>
                        </span>
                      )}

                      {isRevoked && (
                        <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                          <Ban className="w-3.5 h-3.5" />
                          <span>Pass Revoked</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/60 dark:bg-white/[0.03] border border-dashed border-orange-200/80 dark:border-white/15 rounded-3xl p-12 text-center">
              <QrCode className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="font-black text-slate-900 dark:text-white text-base">No Visitor Passes Found</h3>
              <p className="text-xs text-slate-500 mt-1">Pre-approved visitor passes generated by your tenants will be logged here for security verification.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}