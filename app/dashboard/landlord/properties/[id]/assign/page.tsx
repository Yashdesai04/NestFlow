import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { createLeaseAndAssignBed, terminateLease } from "./actions";
import {
  ArrowLeft,
  UserPlus,
  Bed as BedIcon,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Mail,
  UserCheck,
  XCircle,
  Users,
  Building2,
  ShieldCheck,
  Utensils,
  Wrench,
  Ban,
} from "lucide-react";

export default async function AssignBedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: propertyId } = await params;
  const { userId } = await auth();

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) redirect("/onboarding");

  // Fetch Property along with Rooms, Vacant Beds, and Active Leases
  const property = await db.property.findFirst({
    where: {
      id: propertyId,
      landlordId: user.id,
    },
    include: {
      rooms: {
        include: {
          beds: true,
        },
        orderBy: { roomNumber: "asc" },
      },
      leases: {
        where: { status: "ACTIVE" },
        include: {
          tenant: true,
          room: true,
          bed: true,
        },
        orderBy: { startDate: "desc" },
      },
    },
  });

  if (!property) redirect("/dashboard/landlord");

  const isPG = property.propertyType === "PG";

  // Extract all vacant beds across rooms
  const vacantBeds: { id: string; label: string; priceMonthly: number }[] = [];
  property.rooms.forEach((room) => {
    room.beds.forEach((bed) => {
      if (bed.status === "VACANT") {
        vacantBeds.push({
          id: bed.id,
          label: `Room ${room.roomNumber} - ${bed.bedNumber}`,
          priceMonthly: bed.priceMonthly || property.priceMonthly || 0,
        });
      }
    });
  });

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Background Ambient Theme Backdrop Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0" />

      <main className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-4 sm:p-6 shadow-sm dark:shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/landlord/properties/${property.id}`}
              className="p-2.5 rounded-2xl bg-white/80 dark:bg-white/10 border border-orange-200/60 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-rose-400 transition shadow-xs"
              title="Back to Property Management"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/10 dark:bg-purple-400/10 border border-purple-200/60 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider mb-1">
                <UserCheck className="w-3.5 h-3.5" /> Resident Onboarding
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                {property.title}
              </h1>
            </div>
          </div>

          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/10 border border-orange-200/60 dark:border-white/15 px-4 py-2 rounded-2xl shadow-xs self-start sm:self-auto">
            <span className="text-emerald-600 dark:text-emerald-400 font-black">{vacantBeds.length}</span> Vacant Beds Available
          </div>
        </div>

        {/* Owner Management Quick Toolbar */}
        <div className="bg-slate-900/90 dark:bg-white/[0.08] border border-orange-200/50 dark:border-white/15 text-white p-5 rounded-3xl shadow-lg backdrop-blur-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              Owner Dashboard
            </span>
            <span className="text-xs text-slate-300 font-medium">
              You are managing resident assignments for this property.
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Link
              href={`/dashboard/landlord/properties/${property.id}`}
              className="bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-1.5 shrink-0 transition"
            >
              <BedIcon className="w-3.5 h-3.5" /> Rooms & Beds
            </Link>
            <Link
              href={`/dashboard/landlord/properties/${property.id}/assign`}
              className="bg-white/20 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition border border-white/30"
            >
              <UserPlus className="w-3.5 h-3.5 text-sky-400" /> Assign Residents
            </Link>
            {isPG && (
              <Link
                href={`/dashboard/landlord/properties/${property.id}/mess`}
                className="bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-1.5 shrink-0 transition"
              >
                <Utensils className="w-3.5 h-3.5 text-amber-400" /> Mess Schedule
              </Link>
            )}
            <Link
              href="/dashboard/landlord/tickets"
              className="bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-1.5 shrink-0 transition"
            >
              <Wrench className="w-3.5 h-3.5 text-purple-400" /> Tickets
            </Link>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Column: Assign Tenant */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-2xl sticky top-28 space-y-5">
              <div className="flex items-center gap-2 border-b border-orange-100 dark:border-white/10 pb-4">
                <div className="p-2 rounded-xl bg-sky-500/10 dark:bg-sky-400/15 text-sky-600 dark:text-sky-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h2 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider">
                  Assign Bed & Lease
                </h2>
              </div>

              {vacantBeds.length > 0 ? (
                <form action={createLeaseAndAssignBed} className="space-y-4">
                  <input type="hidden" name="propertyId" value={property.id} />

                  {/* Bed Selection Dropdown */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Select Vacant Bed *
                    </label>
                    <select
                      name="bedId"
                      required
                      className="w-full bg-white/80 dark:bg-slate-900 border border-orange-200/60 dark:border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-orange-500 dark:focus:border-rose-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-rose-500/20 transition cursor-pointer font-medium"
                    >
                      {vacantBeds.map((bed) => (
                        <option
                          key={bed.id}
                          value={bed.id}
                          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          {bed.label} ({formatCurrency(bed.priceMonthly)}/mo)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tenant Email Address Input */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Tenant Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        name="tenantEmail"
                        required
                        placeholder="resident@example.com"
                        className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:border-orange-500 dark:focus:border-rose-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-rose-500/20 transition font-medium"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      Tenant must have a registered account on NestFlow with this email.
                    </p>
                  </div>

                  {/* Monthly Rent Amount */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Monthly Rent Amount (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-bold text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        name="rentAmount"
                        required
                        defaultValue={property.priceMonthly || 8000}
                        className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl pl-8 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-orange-500 dark:focus:border-rose-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-rose-500/20 transition font-medium"
                      />
                    </div>
                  </div>

                  {/* Move-in & End Date */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Move-in Date *
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        required
                        defaultValue={new Date().toISOString().split("T")[0]}
                        className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-orange-500 dark:focus:border-rose-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-rose-500/20 transition font-medium [color-scheme:light_dark]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-orange-500 dark:focus:border-rose-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-rose-500/20 transition font-medium [color-scheme:light_dark]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold text-xs py-3 rounded-2xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] mt-2"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Confirm Lease & Occupy Bed</span>
                  </button>
                </form>
              ) : (
                <div className="bg-amber-500/[0.08] dark:bg-amber-400/[0.08] border border-amber-200/60 dark:border-amber-400/20 rounded-2xl p-5 text-center">
                  <BedIcon className="w-7 h-7 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                  <h3 className="font-black text-amber-900 dark:text-amber-300 text-xs">
                    No Vacant Beds Available
                  </h3>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 font-medium leading-relaxed">
                    All beds in this property are currently occupied. Add new rooms or beds to onboard more residents.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Active Residents List Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-orange-100 dark:border-white/10 pb-4">
                <h2 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500 dark:text-rose-400" />
                  <span>Active Property Residents ({property.leases.length})</span>
                </h2>
              </div>

              {property.leases.length > 0 ? (
                <div className="space-y-4">
                  {property.leases.map((lease) => (
                    <div
                      key={lease.id}
                      className="p-4 sm:p-5 rounded-2xl border border-orange-100/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:shadow-xs"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-black text-slate-950 dark:text-white text-sm">
                            {lease.tenant.fullName || lease.tenant.email}
                          </span>
                          <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/30 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Active Resident
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 font-medium">
                          <p className="flex items-center gap-1.5">
                            <BedIcon className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400 shrink-0" />
                            <span>Room {lease.room?.roomNumber || "N/A"} · Bed {lease.bed?.bedNumber || "N/A"}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{lease.tenant.email}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Moved in: {new Date(lease.startDate).toLocaleDateString("en-IN")}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:flex-col sm:items-end justify-between pt-3 sm:pt-0 border-t sm:border-0 border-orange-100 dark:border-white/10">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block">
                            Monthly Rent
                          </span>
                          <span className="font-black text-slate-950 dark:text-white text-sm">
                            {formatCurrency(lease.rentAmount)}
                          </span>
                        </div>

                        <form
                          action={async () => {
                            "use server";
                            await terminateLease(property.id, lease.id, lease.bedId);
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-extrabold bg-rose-500/10 dark:bg-rose-500/15 hover:bg-rose-500/20 border border-rose-200/60 dark:border-rose-500/30 px-3.5 py-1.5 rounded-xl transition cursor-pointer active:scale-95 flex items-center gap-1"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Terminate & Vacate Bed</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/60 dark:bg-white/[0.03] rounded-2xl border border-dashed border-orange-200/80 dark:border-white/15">
                  <Users className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                  <h3 className="font-black text-slate-950 dark:text-white text-sm">
                    No Active Residents Assigned
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto font-medium">
                    Use the form on the left to assign registered tenants to vacant beds in this property.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}