import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  Users,
  Wrench,
  IndianRupee,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Bed,
  MapPin,
  FileCheck2,
  Layers,
  Sparkles,
} from "lucide-react";

export default async function LandlordDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      properties: {
        include: {
          rooms: {
            include: { beds: true },
          },
          leases: {
            where: { status: "ACTIVE" },
          },
          maintenance: {
            where: { status: { not: "RESOLVED" } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!landlord || landlord.role !== "LANDLORD") {
    redirect("/onboarding");
  }

  // Fetch pending applications count
  const pendingApplicationsCount = await db.rentalApplication.count({
    where: {
      property: { landlordId: landlord.id },
      status: "PENDING",
    },
  });

  // Aggregate Metrics
  const properties = landlord.properties;
  const totalProperties = properties.length;

  let totalBeds = 0;
  let occupiedBeds = 0;
  let totalMonthlyRevenue = 0;
  let totalOpenTickets = 0;

  properties.forEach((p) => {
    totalOpenTickets += p.maintenance?.length || 0;

    p.rooms.forEach((r) => {
      totalBeds += r.beds.length;
      r.beds.forEach((b) => {
        if (b.status === "OCCUPIED") occupiedBeds++;
      });
    });

    p.leases.forEach((l) => {
      totalMonthlyRevenue += l.rentAmount || 0;
    });
  });

  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient Theme Background Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Header Banner */}
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-rose-500/15 border border-orange-200/60 dark:border-rose-500/30 text-orange-700 dark:text-rose-400 text-[11px] font-black uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Owner Management Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Welcome, {landlord.fullName?.split(" ")[0] || "Property Owner"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Monitor PG occupancy, verify pending tenant applications, and manage property assets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/landlord/operations"
              className="bg-white/80 dark:bg-white/10 border border-orange-200/60 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-rose-400 font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-orange-500" />
              <span>Operations Hub</span>
            </Link>

            <Link
              href="/dashboard/landlord/properties/new"
              className="bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md hover:opacity-95 transition flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Property</span>
            </Link>
          </div>
        </div>

        {/* Analytics Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm dark:shadow-xl hover:translate-y-[-2px] transition duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Managed Properties
              </span>
              <div className="p-2.5 bg-sky-500/10 dark:bg-sky-400/15 text-sky-600 dark:text-sky-400 rounded-2xl border border-sky-200/50 dark:border-sky-400/20">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
              {totalProperties}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-semibold">
              {totalBeds} total inventory beds
            </p>
          </div>

          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm dark:shadow-xl hover:translate-y-[-2px] transition duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Occupancy Rate
              </span>
              <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200/50 dark:border-emerald-400/20">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
              {occupancyRate}%
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              {occupiedBeds} of {totalBeds} beds occupied
            </p>
          </div>

          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm dark:shadow-xl hover:translate-y-[-2px] transition duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Monthly Rent Flow
              </span>
              <div className="p-2.5 bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-200/50 dark:border-amber-400/20">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
              {formatCurrency(totalMonthlyRevenue)}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-semibold">
              From active signed leases
            </p>
          </div>

          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm dark:shadow-xl hover:translate-y-[-2px] transition duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Repair Tickets
              </span>
              <div className="p-2.5 bg-purple-500/10 dark:bg-purple-400/15 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-200/50 dark:border-purple-400/20">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
              {totalOpenTickets} Open
            </div>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-bold mt-1">
              <Link href="/dashboard/landlord/maintenance" className="hover:underline">
                View & Assign Staff →
              </Link>
            </p>
          </div>
        </div>

        {/* Essential 2 Actions Showcase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-950 dark:text-white tracking-tight">
              Core Daily Operations
            </h2>
            <Link
              href="/dashboard/landlord/operations"
              className="text-xs font-bold text-orange-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <span>View All 8 Management Modules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Essential Card 1: Applications */}
            <Link
              href="/dashboard/landlord/applications"
              className="group relative overflow-hidden bg-white/75 dark:bg-white/[0.04] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-orange-400 dark:hover:border-rose-500/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/30">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  {pendingApplicationsCount > 0 ? (
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200/60 animate-pulse">
                      {pendingApplicationsCount} Awaiting Review
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                      All Processed
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-950 dark:text-white group-hover:text-orange-600 dark:group-hover:text-rose-400 transition">
                    Tenancy Inquiries & Applications
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                    Screen applicant background, verify proposed move-in dates, approve bed allocations, and generate digital legal lease contracts.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-orange-100/80 dark:border-white/10 flex items-center justify-between text-xs font-bold text-orange-600 dark:text-rose-400">
                <span>Open Screening Queue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Essential Card 2: Resident Directory */}
            <Link
              href="/dashboard/landlord/tenants"
              className="group relative overflow-hidden bg-white/75 dark:bg-white/[0.04] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-orange-400 dark:hover:border-rose-500/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-500/30">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200/60">
                    {occupiedBeds} Active Residents
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-950 dark:text-white group-hover:text-orange-600 dark:group-hover:text-rose-400 transition">
                    Resident Directory & Leases
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                    View assigned room/bed spots, track counter-signed agreements, verify payment balances, and manage offboarding/move-out vacancy releases.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-orange-100/80 dark:border-white/10 flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400">
                <span>Manage Resident Roster</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Managed Properties Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950 dark:text-white tracking-tight">
              Your Managed Properties ({totalProperties})
            </h2>
            <Link
              href="/dashboard/landlord/properties/new"
              className="text-xs font-bold text-orange-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Listing</span>
            </Link>
          </div>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => {
                let pBeds = 0;
                let pOccupied = 0;
                p.rooms.forEach((r) => {
                  pBeds += r.beds.length;
                  r.beds.forEach((b) => {
                    if (b.status === "OCCUPIED") pOccupied++;
                  });
                });

                return (
                  <div
                    key={p.id}
                    className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-700 dark:text-rose-400 border border-orange-200/60 dark:border-rose-500/30">
                          {p.propertyType}
                        </span>
                        <span className="text-xs font-black text-slate-950 dark:text-white">
                          {formatCurrency(p.priceMonthly || 0)} / mo
                        </span>
                      </div>

                      <h3 className="font-black text-base text-slate-950 dark:text-white">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                        <span>{p.address}, {p.city}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-orange-100 dark:border-white/10 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Bed className="w-4 h-4 text-sky-500" />
                        <span>{pOccupied} / {pBeds} Beds Booked</span>
                      </span>
                      <Link
                        href={`/properties/${p.id}`}
                        className="text-orange-600 dark:text-rose-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/60 dark:bg-white/[0.03] border border-dashed border-orange-200/80 dark:border-white/15 rounded-3xl p-12 text-center">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="font-black text-slate-900 dark:text-white text-base">No Properties Listed Yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">Start by adding your first PG, hostel, or residential rental listing.</p>
              <Link
                href="/dashboard/landlord/properties/new"
                className="bg-gradient-to-r from-orange-400 to-sky-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md inline-block"
              >
                Create Listing
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}