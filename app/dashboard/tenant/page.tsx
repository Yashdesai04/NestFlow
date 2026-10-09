import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import TenantRotaryHub from "./TenantRotaryHub";
import { createMaintenanceTicket } from "./actions";
import {
  Home,
  Bed as BedIcon,
  Utensils,
  Wrench,
  IndianRupee,
  Calendar,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Coffee,
  FileCheck2,
  Sun,
  Moon,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Receipt,
  QrCode,
  ArrowRight,
  FileText,
} from "lucide-react";

export default async function TenantDashboardPage() {
  // 1. Authenticate user session
  const { userId } = await auth();
  if (!userId) redirect("/login");

  // 2. Fetch Tenant Record from DB
  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) redirect("/onboarding");

  // 3. Fetch active Lease, Property, Room, Bed, Landlord, and Mess Menus
  const lease = await db.lease.findFirst({
    where: {
      tenantId: user.id,
    },
    include: {
      property: {
        include: {
          landlord: true,
          messMenus: true,
        },
      },
      room: true,
      bed: true,
    },
    orderBy: { startDate: "desc" },
  });

  // 4. Fetch Tenant's Maintenance Tickets
  const tickets = await db.maintenanceTicket.findMany({
    where: { tenantId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Determine today's day of week
  const daysOfWeek = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  const todayName = daysOfWeek[new Date().getDay()];

  // Find today's mess menu if property exists
  const todayMessMenu = lease?.property?.messMenus.find(
    (m) => m.dayOfWeek === todayName
  );

  const activeTicketsCount = tickets.filter((t) => t.status !== "RESOLVED").length;

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient Theme Backdrop Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Top Header Banner Card */}
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-sky-400/10 border border-blue-200/60 dark:border-sky-400/20 text-blue-700 dark:text-sky-300 text-[11px] font-extrabold uppercase tracking-wider mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Resident Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Welcome back, {user.fullName?.split(" ")[0] || "Resident"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Manage your room assignment, daily meals, rent status, and support requests.
            </p>
          </div>

          {lease?.property && (
            <div className="flex items-center gap-2.5 bg-white/80 dark:bg-white/[0.06] border border-orange-200/50 dark:border-white/10 px-4 py-2.5 rounded-2xl shadow-xs self-start sm:self-auto">
              <div className="p-1.5 rounded-xl bg-orange-500/10 dark:bg-rose-500/15 text-orange-600 dark:text-rose-400">
                <Home className="w-4 h-4 shrink-0" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Current Property
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {lease.property.title}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Analytics Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Assigned Bed */}
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm dark:shadow-xl hover:translate-y-[-2px] transition duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Assigned Bed
              </span>
              <div className="p-2.5 bg-sky-500/10 dark:bg-sky-400/15 text-sky-600 dark:text-sky-400 rounded-2xl border border-sky-200/50 dark:border-sky-400/20">
                <BedIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-950 dark:text-white tracking-tight">
              {lease ? `Room ${lease.room?.roomNumber} · Bed ${lease.bed?.bedNumber}` : "Unassigned"}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-semibold">
              {lease?.room?.roomType || "Active Residency Space"}
            </p>
          </div>

          {/* Monthly Rent */}
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm dark:shadow-xl hover:translate-y-[-2px] transition duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Monthly Rent
              </span>
              <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200/50 dark:border-emerald-400/20">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-950 dark:text-white tracking-tight">
              {lease ? formatCurrency(lease.rentAmount || lease.bed?.priceMonthly || 0) : "₹0"}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Due on 1st of every month
            </p>
          </div>

          {/* Today's Mess Schedule */}
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm dark:shadow-xl hover:translate-y-[-2px] transition duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Today's Mess
              </span>
              <div className="p-2.5 bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-200/50 dark:border-amber-400/20">
                <Utensils className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-950 dark:text-white tracking-tight capitalize">
              {todayName.toLowerCase()}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-semibold">
              {todayMessMenu ? "3 Meals Configured" : "No Menu Set Today"}
            </p>
          </div>

          {/* Maintenance Requests */}
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm dark:shadow-xl hover:translate-y-[-2px] transition duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Maintenance
              </span>
              <div className="p-2.5 bg-purple-500/10 dark:bg-purple-400/15 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-200/50 dark:border-purple-400/20">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-950 dark:text-white tracking-tight">
              {activeTicketsCount} Active
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-semibold">
              {tickets.length} total logged requests
            </p>
          </div>
        </div>

        {/* Quick Resident Services Action Hub */}
        {/* Interactive Rotary Command Hub */}
        <TenantRotaryHub
          user={{
            fullName: user.fullName,
            kycStatus: user.kycStatus,
          }}
          lease={
            lease
              ? {
                  isSigned: lease.isSigned,
                  rentAmount: lease.rentAmount,
                  room: lease.room
                    ? {
                        roomNumber: lease.room.roomNumber,
                        roomType: lease.room.roomType || "Standard",
                      }
                    : null,
                  bed: lease.bed,
                }
              : null
          }
          activeTicketsCount={activeTicketsCount}
        />

        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Active Lease & Today's Mess Menu */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Lease Container */}
            {lease ? (
              <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-orange-100 dark:border-white/10 pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-200/50 dark:border-emerald-400/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" /> Active Lease Agreement
                    </span>
                    <h2 className="text-lg font-black text-slate-950 dark:text-white mt-1.5 tracking-tight">
                      {lease.property?.title}
                    </h2>
                  </div>
                  <div className="p-2 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-400/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white/60 dark:bg-white/[0.03] p-4 rounded-2xl border border-orange-100/80 dark:border-white/[0.06]">
                    <span className="text-slate-400 dark:text-slate-500 uppercase font-black text-[10px] tracking-wider block">
                      Property Address
                    </span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400 shrink-0 mt-0.5" />
                      <span>
                        {lease.property?.address}, {lease.property?.city}
                      </span>
                    </p>
                  </div>

                  <div className="bg-white/60 dark:bg-white/[0.03] p-4 rounded-2xl border border-orange-100/80 dark:border-white/[0.06]">
                    <span className="text-slate-400 dark:text-slate-500 uppercase font-black text-[10px] tracking-wider block">
                      Allocated Accommodation
                    </span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                      <BedIcon className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 shrink-0" />
                      <span>
                        Room {lease.room?.roomNumber} · Bed {lease.bed?.bedNumber} ({lease.room?.roomType || "Standard"})
                      </span>
                    </p>
                  </div>
                </div>

                {/* Landlord Contact Box */}
                {lease.property?.landlord && (
                  <div className="pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-orange-500/[0.06] dark:bg-white/[0.03] border border-orange-200/50 dark:border-white/10 p-4 rounded-2xl">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-rose-400 block">
                          Landlord / Property Manager
                        </span>
                        <span className="font-black text-slate-950 dark:text-white text-sm">
                          {lease.property.landlord.fullName || "Property Manager"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-bold">
                        {lease.property.landlord.phone && (
                          <a
                            href={`tel:${lease.property.landlord.phone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/10 border border-orange-200/60 dark:border-white/15 text-slate-800 dark:text-slate-200 hover:text-orange-600 dark:hover:text-rose-400 transition shadow-xs"
                          >
                            <Phone className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                            <span>{lease.property.landlord.phone}</span>
                          </a>
                        )}
                        <a
                          href={`mailto:${lease.property.landlord.email}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/10 border border-orange-200/60 dark:border-white/15 text-slate-800 dark:text-slate-200 hover:text-orange-600 dark:hover:text-rose-400 transition shadow-xs"
                        >
                          <Mail className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                          <span>Email</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/70 dark:bg-white/[0.05] border border-dashed border-orange-200/80 dark:border-white/15 backdrop-blur-2xl rounded-3xl p-8 text-center">
                <div className="p-3.5 bg-orange-500/10 dark:bg-rose-500/15 text-orange-600 dark:text-rose-400 rounded-full inline-block mb-3">
                  <Home className="w-7 h-7" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  No Active Lease Agreement
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-5 font-medium">
                  Browse public PG listings and apply for an available bed to start your residency.
                </p>
                <Link
                  href="/properties"
                  className="bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold text-xs px-6 py-2.5 rounded-full shadow-md hover:opacity-95 transition inline-block"
                >
                  Explore Properties
                </Link>
              </div>
            )}

            {/* Today's Mess Schedule Card */}
            <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-orange-100 dark:border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-200/50 dark:border-amber-400/20">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-950 dark:text-white tracking-tight">
                      Today's Mess Schedule ({todayName.toLowerCase()})
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Freshly prepared meals served daily
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard/tenant/meals"
                  className="text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/30 px-3 py-1.5 rounded-xl hover:bg-amber-500/20 transition flex items-center gap-1"
                >
                  <span>Opt-Out Meals</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {todayMessMenu ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Breakfast */}
                  <div className="bg-amber-500/[0.06] dark:bg-amber-400/[0.04] border border-amber-200/60 dark:border-amber-400/15 rounded-2xl p-4">
                    <span className="text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                      <Coffee className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> 
                      Breakfast (8:00 AM)
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {todayMessMenu.breakfast || "Standard Breakfast"}
                    </p>
                  </div>

                  {/* Lunch */}
                  <div className="bg-amber-500/[0.06] dark:bg-amber-400/[0.04] border border-amber-200/60 dark:border-amber-400/15 rounded-2xl p-4">
                    <span className="text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                      <Sun className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> 
                      Lunch (1:00 PM)
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {todayMessMenu.lunch || "Standard Lunch"}
                    </p>
                  </div>

                  {/* Dinner */}
                  <div className="bg-amber-500/[0.06] dark:bg-amber-400/[0.04] border border-amber-200/60 dark:border-amber-400/15 rounded-2xl p-4">
                    <span className="text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                      <Moon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> 
                      Dinner (8:30 PM)
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {todayMessMenu.dinner || "Standard Dinner"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/60 dark:bg-white/[0.03] border border-orange-100/80 dark:border-white/[0.06] p-5 rounded-2xl text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    The property manager has not configured a meal schedule for today yet.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Ticket Submission & Recent Activity */}
          <div className="space-y-8">
            
            {/* Quick Log Ticket Form */}
            {lease?.property && (
              <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-sm dark:shadow-2xl">
                <div className="flex items-center gap-2 mb-4 border-b border-orange-100 dark:border-white/10 pb-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 dark:bg-purple-400/15 text-purple-600 dark:text-purple-400">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider">
                    Log Maintenance Ticket
                  </h3>
                </div>

                <form action={createMaintenanceTicket} className="space-y-3.5">
                  <input type="hidden" name="propertyId" value={lease.property.id} />

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Issue Summary *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      placeholder="e.g. Tap leaking in Washroom 2"
                      className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:border-orange-500 dark:focus:border-rose-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-rose-500/20 transition font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Priority Level
                    </label>
                    <select
                      name="priority"
                      className="w-full bg-white/80 dark:bg-slate-900 border border-orange-200/60 dark:border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-orange-500 dark:focus:border-rose-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-rose-500/20 transition cursor-pointer font-medium"
                    >
                      <option value="LOW" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        Low (Minor repair)
                      </option>
                      <option value="MEDIUM" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        Medium (General repair)
                      </option>
                      <option value="HIGH" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        High (Urgent / Electrical / Plumbing)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Details & Preferred Timing
                    </label>
                    <textarea
                      name="description"
                      rows={2}
                      placeholder="Provide additional details or convenient time for inspection."
                      className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:border-orange-500 dark:focus:border-rose-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-rose-500/20 transition resize-none font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold text-xs py-3 rounded-2xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Submit Request</span>
                  </button>
                </form>
              </div>
            )}

            {/* Raised Tickets Feed */}
            <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-sm dark:shadow-2xl">
              <div className="flex items-center gap-2 mb-4 border-b border-orange-100 dark:border-white/10 pb-3">
                <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-sky-400/15 text-blue-600 dark:text-sky-400">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider">
                  Recent Requests
                </h3>
              </div>

              {tickets.length > 0 ? (
                <div className="space-y-3">
                  {tickets.map((ticket) => {
                    const isResolved = ticket.status === "RESOLVED";

                    return (
                      <div
                        key={ticket.id}
                        className="p-3.5 rounded-2xl border border-orange-100/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-950 dark:text-white text-xs truncate">
                            {ticket.title}
                          </span>
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 border ${
                              isResolved
                                ? "bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-400/20"
                                : "bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-400/20"
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </div>
                        {ticket.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {ticket.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white/60 dark:bg-white/[0.03] p-5 rounded-2xl border border-orange-100/80 dark:border-white/[0.06] text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    No maintenance tickets raised yet.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}