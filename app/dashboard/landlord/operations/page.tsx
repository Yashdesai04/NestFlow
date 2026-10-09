import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  FileCheck2,
  Users,
  Wrench,
  Receipt,
  Utensils,
  Compass,
  QrCode,
  BarChart3,
  Plus,
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  CircleDot,
  Activity,
} from "lucide-react";

export default async function LandlordOperationsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      properties: {
        include: {
          maintenance: { where: { status: { not: "RESOLVED" } } },
          leases: { where: { status: "ACTIVE" } },
        },
      },
    },
  });

  if (!landlord || landlord.role !== "LANDLORD") {
    redirect("/onboarding");
  }

  const landlordPropertyIds = landlord.properties.map((p) => p.id);

  // Parallel live telemetry counts
  const [
    pendingApplicationsCount,
    pendingToursCount,
    pendingInvoicesCount,
    activeGuestsCount,
  ] = await Promise.all([
    db.rentalApplication.count({
      where: { propertyId: { in: landlordPropertyIds }, status: "PENDING" },
    }),
    db.propertyTour.count({
      where: { propertyId: { in: landlordPropertyIds }, status: "PENDING" },
    }),
    db.payment.count({
      where: { lease: { propertyId: { in: landlordPropertyIds } }, status: "PENDING" },
    }),
    db.gatePass.count({
      where: { propertyId: { in: landlordPropertyIds }, status: "CHECKED_IN" },
    }),
  ]);

  let activeTenantsCount = 0;
  let openTicketsCount = 0;

  landlord.properties.forEach((p) => {
    activeTenantsCount += p.leases.length;
    openTicketsCount += p.maintenance.length;
  });

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-28 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Theme Ambient Glow & Refraction Lights */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[750px] h-[750px] bg-gradient-to-tr from-orange-400/20 via-amber-300/20 to-sky-400/20 dark:from-rose-600/20 dark:via-purple-600/15 dark:to-indigo-600/20 rounded-full blur-[170px] pointer-events-none -z-0" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-gradient-to-br from-purple-400/15 to-pink-400/15 dark:from-indigo-600/10 dark:to-rose-600/10 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-gradient-to-bl from-sky-400/15 to-emerald-400/15 dark:from-purple-600/10 dark:to-sky-600/10 rounded-full blur-[140px] pointer-events-none -z-0" />

      <main className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* ========================================================
            MASTER LIQUID GLASS SLAB (Theme-Adaptive)
           ======================================================== */}
        <div className="relative rounded-[40px] sm:rounded-[48px] bg-white/70 dark:bg-white/[0.04] backdrop-blur-3xl border border-orange-200/60 dark:border-white/15 p-6 sm:p-10 shadow-[0_30px_90px_-20px_rgba(249,115,22,0.12),0_15px_35px_-10px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,0.95)] dark:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.15)] space-y-8 sm:space-y-10">

          {/* Top Liquid Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-orange-100 dark:border-white/[0.08] pb-6 sm:pb-8">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/landlord"
                  className="p-2.5 rounded-full bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-orange-200/60 dark:border-white/20 text-slate-700 dark:text-slate-200 shadow-[0_6px_16px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] transition-all cursor-pointer active:scale-90"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-500/10 dark:bg-rose-500/15 border border-orange-200/60 dark:border-rose-500/30 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.02),inset_0_1px_2px_rgba(255,255,255,0.8)] text-orange-700 dark:text-rose-400 text-[11px] font-black tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Operations Console</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight pt-1">
                Property Control Suite
              </h1>
            </div>

            {/* Action Capsule Row */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/dashboard/landlord/properties/new"
                className="group relative overflow-hidden bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold text-xs px-5 py-3 rounded-full shadow-[0_12px_28px_rgba(249,115,22,0.3),inset_0_2px_3px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.2)] hover:opacity-95 transition-all duration-300 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>New Property</span>
              </Link>

              {/* Glowing Pulse Radar */}
              <div className="relative p-2.5 rounded-full bg-white/80 dark:bg-white/10 border border-orange-200/60 dark:border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
              </div>
            </div>
          </div>

          {/* ========================================================
              TOP SECTION: LIQUID CAPSULES & CHROMATIC SEARCH WIDGET
             ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Col (4 Cols): Glossy Floating Pills */}
            <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
              
              {/* Violet / Rose Liquid Pill */}
              <Link
                href="/dashboard/landlord/applications"
                className="group relative block w-full p-4 rounded-[26px] bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 dark:from-rose-600 dark:via-purple-600 dark:to-indigo-600 text-white shadow-[0_18px_36px_rgba(147,51,234,0.32),inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-2px_6px_rgba(0,0,0,0.2)] hover:scale-[1.02] transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/35 to-transparent rounded-t-[26px] pointer-events-none" />
                <div className="relative flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <FileCheck2 className="w-5 h-5 drop-shadow-sm" />
                    <span className="font-black text-sm tracking-tight drop-shadow-sm">
                      Applications
                    </span>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/25 backdrop-blur-md shadow-inner">
                    {pendingApplicationsCount > 0 ? `${pendingApplicationsCount} Pending` : "Queue Clear"}
                  </span>
                </div>
              </Link>

              {/* Cyan / Teal Liquid Pill */}
              <Link
                href="/dashboard/landlord/tenants"
                className="group relative block w-full p-4 rounded-[26px] bg-gradient-to-r from-teal-500 via-emerald-500 to-sky-500 text-white shadow-[0_18px_36px_rgba(20,184,166,0.32),inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-2px_6px_rgba(0,0,0,0.2)] hover:scale-[1.02] transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/35 to-transparent rounded-t-[26px] pointer-events-none" />
                <div className="relative flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 drop-shadow-sm" />
                    <span className="font-black text-sm tracking-tight drop-shadow-sm">
                      Resident Directory
                    </span>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/25 backdrop-blur-md shadow-inner">
                    {activeTenantsCount} Occupants
                  </span>
                </div>
              </Link>

              {/* Liquid Status Pill */}
              <div className="p-3.5 rounded-[26px] bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl border border-orange-200/60 dark:border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.9)] flex items-center justify-between">
                <div className="flex items-center gap-2.5 pl-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                    Live Occupancy
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {activeTenantsCount} signed leases
                  </span>
                  <div className="p-1.5 rounded-full bg-orange-500/10 dark:bg-rose-500/15 text-orange-600 dark:text-rose-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col (8 Cols): Chromatic Frosted Glass Search & Telemetry */}
            <div className="lg:col-span-8 rounded-[36px] bg-gradient-to-br from-orange-400/10 via-white/70 to-sky-400/10 dark:from-rose-950/20 dark:via-white/[0.03] dark:to-indigo-950/20 backdrop-blur-3xl border border-orange-200/60 dark:border-white/15 p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(249,115,22,0.15),inset_0_2px_5px_rgba(255,255,255,0.95)] flex flex-col justify-between space-y-6">
              
              {/* Header inside Chromatic Container */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-white/80 dark:bg-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)] text-orange-600 dark:text-rose-400 border border-orange-200/60 dark:border-white/10">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-950 dark:text-white">
                      Operations Search & Quick Dispatch
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      Instant access across rent, security, kitchen, and vendor tickets
                    </p>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:to-indigo-600 p-0.5 shadow-[0_10px_25px_rgba(249,115,22,0.3)] flex items-center justify-center">
                  <div className="w-full h-full bg-white dark:bg-slate-950 rounded-full flex items-center justify-center">
                    <CircleDot className="w-4 h-4 text-orange-600 dark:text-rose-400" />
                  </div>
                </div>
              </div>

              {/* Capsule Search Bar */}
              <div className="relative flex items-center bg-white/90 dark:bg-white/10 backdrop-blur-2xl rounded-full border border-orange-200/60 dark:border-white/20 p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)]">
                <Search className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
                <input
                  type="text"
                  placeholder="Search tenant names, room numbers, repair tickets..."
                  className="w-full bg-transparent px-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
                />
                <Link
                  href="/dashboard/landlord/properties/new"
                  className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:to-indigo-600 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(249,115,22,0.35),inset_0_1px_2px_rgba(255,255,255,0.6)] hover:scale-105 active:scale-95 transition cursor-pointer shrink-0 mr-0.5"
                  title="Create listing"
                >
                  <Plus className="w-4 h-4" />
                </Link>
              </div>

              {/* Quick Status Tags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-white/[0.05] border border-orange-100 dark:border-white/10 shadow-xs flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-300 text-[11px]">Unpaid Dues</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-black">
                    {pendingInvoicesCount}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-white/[0.05] border border-orange-100 dark:border-white/10 shadow-xs flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-300 text-[11px]">Open Repairs</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 text-[10px] font-black">
                    {openTicketsCount}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-white/[0.05] border border-orange-100 dark:border-white/10 shadow-xs flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-300 text-[11px]">Pending Visits</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 text-[10px] font-black">
                    {pendingToursCount}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-white/[0.05] border border-orange-100 dark:border-white/10 shadow-xs flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-300 text-[11px]">Active Guests</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                    {activeGuestsCount}
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* ========================================================
              OPERATIONAL TOOL MODULES (The 8 Liquid Glass Modules)
             ======================================================== */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Active Operational Modules
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                8 Integrated Consoles
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* MODULE 1: Applications */}
              <Link
                href="/dashboard/landlord/applications"
                className="group relative overflow-hidden p-6 rounded-[32px] bg-white/70 dark:bg-white/[0.04] backdrop-blur-2xl border border-orange-200/60 dark:border-white/15 shadow-[0_18px_38px_-10px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)] hover:shadow-[0_24px_48px_-10px_rgba(245,158,11,0.25)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_8px_18px_rgba(245,158,11,0.35),inset_0_1px_2px_rgba(255,255,255,0.6)]">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-500/30">
                      Screening
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-base text-slate-950 dark:text-white group-hover:text-orange-600 dark:group-hover:text-rose-400 transition">
                      Applications
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">
                      Screen incoming tenant requests, verify income, and issue e-leases.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-orange-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-orange-600 dark:group-hover:text-rose-400 transition">
                  <span>Open Screening</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* MODULE 2: Resident Directory */}
              <Link
                href="/dashboard/landlord/tenants"
                className="group relative overflow-hidden p-6 rounded-[32px] bg-white/70 dark:bg-white/[0.04] backdrop-blur-2xl border border-orange-200/60 dark:border-white/15 shadow-[0_18px_38px_-10px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)] hover:shadow-[0_24px_48px_-10px_rgba(14,165,233,0.25)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-[0_8px_18px_rgba(14,165,233,0.35),inset_0_1px_2px_rgba(255,255,255,0.6)]">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-500/30">
                      {activeTenantsCount} Occupants
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-base text-slate-950 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                      Resident Directory
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">
                      Occupant room-bed spots, signed agreements, and move-out vacate flow.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-orange-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-sky-600 transition">
                  <span>Manage Roster</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* MODULE 3: Maintenance */}
              <Link
                href="/dashboard/landlord/maintenance"
                className="group relative overflow-hidden p-6 rounded-[32px] bg-white/70 dark:bg-white/[0.04] backdrop-blur-2xl border border-orange-200/60 dark:border-white/15 shadow-[0_18px_38px_-10px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)] hover:shadow-[0_24px_48px_-10px_rgba(168,85,247,0.25)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-[0_8px_18px_rgba(168,85,247,0.35),inset_0_1px_2px_rgba(255,255,255,0.6)]">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-500/30">
                      {openTicketsCount} Open
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-base text-slate-950 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                      Maintenance
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">
                      Assign repair technicians, estimate costs, and track fix completion.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-orange-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-purple-600 transition">
                  <span>Assign Staff</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* MODULE 4: Rent & Invoices */}
              <Link
                href="/dashboard/landlord/invoices"
                className="group relative overflow-hidden p-6 rounded-[32px] bg-white/70 dark:bg-white/[0.04] backdrop-blur-2xl border border-orange-200/60 dark:border-white/15 shadow-[0_18px_38px_-10px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)] hover:shadow-[0_24px_48px_-10px_rgba(16,185,129,0.25)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-[0_8px_18px_rgba(16,185,129,0.35),inset_0_1px_2px_rgba(255,255,255,0.6)]">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/30">
                      Billing
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-base text-slate-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                      Rent & Invoicing
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">
                      Generate monthly invoices, split electricity bills, and log payments.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-orange-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 transition">
                  <span>Open Ledger</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* MODULE 5: Mess Planner */}
              <Link
                href="/dashboard/landlord/meals"
                className="group relative overflow-hidden p-6 rounded-[32px] bg-white/70 dark:bg-white/[0.04] backdrop-blur-2xl border border-orange-200/60 dark:border-white/15 shadow-[0_18px_38px_-10px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)] hover:shadow-[0_24px_48px_-10px_rgba(244,63,94,0.25)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 text-white shadow-[0_8px_18px_rgba(244,63,94,0.35),inset_0_1px_2px_rgba(255,255,255,0.6)]">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-500/30">
                      Kitchen
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-base text-slate-950 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition">
                      Mess Planner
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">
                      7-day weekly food menu and real-time kitchen plate counts from opt-outs.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-orange-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-rose-600 transition">
                  <span>Manage Menu</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* MODULE 6: Property Tours */}
              <Link
                href="/dashboard/landlord/tours"
                className="group relative overflow-hidden p-6 rounded-[32px] bg-white/70 dark:bg-white/[0.04] backdrop-blur-2xl border border-orange-200/60 dark:border-white/15 shadow-[0_18px_38px_-10px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)] hover:shadow-[0_24px_48px_-10px_rgba(59,130,246,0.25)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-[0_8px_18px_rgba(59,130,246,0.35),inset_0_1px_2px_rgba(255,255,255,0.6)]">
                      <Compass className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-500/30">
                      Visits
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-base text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      Walkthroughs
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">
                      Schedule and confirm prospective resident property visit appointments.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-orange-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-blue-600 transition">
                  <span>View Schedule</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* MODULE 7: Gate Passes */}
              <Link
                href="/dashboard/landlord/gatepass"
                className="group relative overflow-hidden p-6 rounded-[32px] bg-white/70 dark:bg-white/[0.04] backdrop-blur-2xl border border-orange-200/60 dark:border-white/15 shadow-[0_18px_38px_-10px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)] hover:shadow-[0_24px_48px_-10px_rgba(20,184,166,0.25)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-[0_8px_18px_rgba(20,184,166,0.35),inset_0_1px_2px_rgba(255,255,255,0.6)]">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-500/30">
                      Security
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-base text-slate-950 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                      Gate Passes
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">
                      Validate guest entry tokens, log check-in/out times, and revoke passes.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-orange-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-teal-600 transition">
                  <span>Security Console</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* MODULE 8: Analytics & P&L */}
              <Link
                href="/dashboard/landlord/reports"
                className="group relative overflow-hidden p-6 rounded-[32px] bg-gradient-to-tr from-orange-400/20 via-amber-300/15 to-purple-400/20 dark:from-rose-950/25 dark:via-purple-950/20 dark:to-cyan-950/25 backdrop-blur-3xl border border-orange-200/60 dark:border-white/20 shadow-[0_20px_45px_-10px_rgba(249,115,22,0.25),inset_0_2px_4px_rgba(255,255,255,0.95)] hover:shadow-[0_26px_56px_-10px_rgba(249,115,22,0.35)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-rose-600 text-white shadow-[0_8px_18px_rgba(249,115,22,0.4),inset_0_1px_2px_rgba(255,255,255,0.6)]">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/70 dark:bg-white/10 text-orange-950 dark:text-orange-200 border border-orange-200/60 shadow-xs">
                      P&L Statement
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-base text-slate-950 dark:text-white group-hover:text-orange-600 dark:group-hover:text-rose-400 transition">
                      Financial Reports
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1 leading-snug">
                      Net operating income, cash flows, and one-click CSV / PDF downloads.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-orange-200/60 dark:border-white/10 flex items-center justify-between text-xs font-bold text-orange-900 dark:text-orange-200 group-hover:translate-x-0.5 transition">
                  <span>Export Reports</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

            </div>
          </div>

          {/* Reference Bottom Switch / Pill Indicator */}
          <div className="pt-4 border-t border-orange-100 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 p-1.5 rounded-full bg-white/80 dark:bg-white/10 border border-orange-200/60 dark:border-white/15 shadow-[0_6px_16px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)]">
              <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 dark:from-rose-500 dark:to-purple-600 text-white text-xs font-black shadow-sm">
                Operations
              </span>
              <Link
                href="/dashboard/landlord"
                className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white text-xs font-bold transition"
              >
                Dashboard
              </Link>
            </div>

            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span>Real-time DB synced with PostgreSQL</span>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}