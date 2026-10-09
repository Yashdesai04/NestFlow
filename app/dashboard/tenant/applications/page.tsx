import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import {
  ArrowLeft,
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  Bed,
  Calendar,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default async function TenantApplicationsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) redirect("/onboarding");

  // Fetch all applications submitted by this tenant
  const applications = await db.rentalApplication.findMany({
    where: { tenantId: user.id },
    include: {
      property: true,
      room: true,
      bed: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-28 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Lighting Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[750px] h-[750px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[170px] pointer-events-none -z-0" />

      <main className="max-w-4xl mx-auto relative z-10 space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/tenant"
            className="p-2.5 rounded-2xl bg-white/80 dark:bg-white/10 border border-orange-200/60 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-rose-400 transition shadow-xs flex items-center gap-2 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-rose-500/15 border border-orange-200/60 dark:border-rose-500/30 text-orange-700 dark:text-rose-400 text-[11px] font-black uppercase tracking-wider">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Applications Tracker</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            My Rental Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            Monitor the status of your property applications and proceed to sign lease agreements once approved.
          </p>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="p-12 text-center rounded-[36px] bg-white/70 dark:bg-white/[0.04] backdrop-blur-2xl border border-orange-200/60 dark:border-white/10 shadow-sm space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-500/10 dark:bg-rose-500/15 text-orange-600 dark:text-rose-400 flex items-center justify-center border border-orange-200/60 dark:border-rose-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-950 dark:text-white">
                No Applications Submitted Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
                Explore available co-living spaces, hostels, or apartments and submit an application to reserve your spot.
              </p>
            </div>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 text-white text-xs font-black shadow-md hover:opacity-95 transition"
            >
              <span>Browse Properties</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const isApproved = app.status === "APPROVED";
              const isPending = app.status === "PENDING";
              const isRejected = app.status === "REJECTED";

              return (
                <div
                  key={app.id}
                  className="p-6 rounded-[32px] bg-white/70 dark:bg-white/[0.04] backdrop-blur-2xl border border-orange-200/60 dark:border-white/10 shadow-sm space-y-4 hover:shadow-md transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-100 dark:border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Applied on {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                      <h2 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                        {app.property.title}
                      </h2>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                        <span>
                          {app.property.address}, {app.property.city}
                        </span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border self-start sm:self-auto flex items-center gap-1.5 shadow-xs ${
                        isApproved
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30"
                          : isPending
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30"
                          : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30"
                      }`}
                    >
                      {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isPending && <Clock className="w-3.5 h-3.5 animate-pulse" />}
                      {isRejected && <XCircle className="w-3.5 h-3.5" />}
                      <span>{app.status}</span>
                    </span>
                  </div>

                  {/* Allocation Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                      <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">
                        Move-In Date
                      </span>
                      <div className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-orange-500" />
                        <span>{new Date(app.moveInDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                      <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">
                        Allocated Room / Bed
                      </span>
                      <div className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                        <Bed className="w-3.5 h-3.5 text-sky-500" />
                        <span>
                          {app.room?.roomNumber
                            ? `Room ${app.room.roomNumber} ${
                                app.bed?.bedNumber ? `• Bed ${app.bed.bedNumber}` : ""
                              }`
                            : "Awaiting Landlord Assignment"}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                      <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">
                        Base Rent
                      </span>
                      <span className="font-black text-slate-900 dark:text-white">
                        ₹{app.bed?.priceMonthly || app.property.priceMonthly || 0}/mo
                      </span>
                    </div>
                  </div>

                  {/* Call To Action when Approved */}
                  {isApproved && (
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-500/5 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                      <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <span>Application approved! Your agreement is ready for signature.</span>
                      </div>
                      <Link
                        href="/dashboard/tenant/lease"
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 shrink-0"
                      >
                        <span>Sign Lease Agreement</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}

                  {isRejected && (
                    <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">
                      This application was declined by the property owner. You may explore and apply for other listings.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}