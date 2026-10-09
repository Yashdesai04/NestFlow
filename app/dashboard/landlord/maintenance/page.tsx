import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { updateTicketAssignment } from "./actions";
import {
  ArrowLeft,
  Wrench,
  Building2,
  User,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
  HardHat,
  IndianRupee,
  Check,
} from "lucide-react";

export default async function LandlordTicketsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!landlord || landlord.role !== "LANDLORD") {
    redirect("/onboarding");
  }

  // Fetch all maintenance tickets for landlord's properties
  const tickets = await db.maintenanceTicket.findMany({
    where: {
      property: { landlordId: landlord.id },
    },
    include: {
      property: true,
      tenant: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate ticket overview metrics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressTickets = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedTickets = tickets.filter((t) => t.status === "RESOLVED").length;

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0" />

      <main className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Navigation & Header Card */}
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 dark:bg-purple-400/10 border border-purple-200/60 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-[11px] font-black uppercase tracking-wider">
                <Wrench className="w-3.5 h-3.5" />
                <span>Property Operations</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Maintenance & Repair Tickets
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-xl">
              Assign staff/vendors to open repair tickets, track estimated costs, and update resolution states.
            </p>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Logged</span>
            <div className="text-2xl font-black text-slate-950 dark:text-white mt-1">{totalTickets}</div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">Across all your properties</p>
          </div>

          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">Awaiting Action</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{openTickets} Open</div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">Unassigned repair requests</p>
          </div>

          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-500">In Progress</span>
            <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">{inProgressTickets} Assigned</div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">Vendor actively working</p>
          </div>

          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500">Resolved</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{resolvedTickets} Closed</div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">Completed maintenance[cite: 1]</p>
          </div>
        </div>

        {/* Tickets Feed */}
        {tickets.length > 0 ? (
          <div className="space-y-6">
            {tickets.map((t) => {
              const isResolved = t.status === "RESOLVED";
              const isOpen = t.status === "OPEN";

              return (
                <div
                  key={t.id}
                  className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-2xl space-y-6"
                >
                  {/* Top Header Information */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orange-100 dark:border-white/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                            t.priority === "HIGH" || t.priority === "URGENT"
                              ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200/60"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/60"
                          }`}
                        >
                          {t.priority} Priority
                        </span>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                            isResolved
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/60"
                              : isOpen
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/60"
                              : "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200/60"
                          }`}
                        >
                          {t.status.replace("_", " ")}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-950 dark:text-white">
                        {t.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                        <span>{t.property.title} · {t.property.city}</span>
                      </p>
                    </div>

                    {/* Resident Info Badge */}
                    <div className="p-3 bg-white/60 dark:bg-white/[0.03] border border-orange-100/80 dark:border-white/10 rounded-2xl text-xs space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                        Reported By Resident
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.tenant.fullName || "Resident"}</span>
                      </p>
                      {t.tenant.phone && (
                        <a href={`tel:${t.tenant.phone}`} className="text-orange-600 dark:text-rose-400 hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{t.tenant.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Issue Description */}
                  {t.description && (
                    <div className="bg-slate-50/80 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Issue Details:</span>
                      <p className="leading-relaxed font-medium">{t.description}</p>
                    </div>
                  )}

                  {/* Staff Assignment & Resolution Form */}
                  <form action={updateTicketAssignment} className="pt-2 border-t border-orange-100 dark:border-white/10">
                    <input type="hidden" name="ticketId" value={t.id} />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {/* Assigned Staff Name */}
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                          <HardHat className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                          <span>Assigned Vendor / Staff[cite: 1]</span>
                        </label>
                        <input
                          type="text"
                          name="assignedStaff"
                          defaultValue={t.assignedStaff || ""}
                          placeholder="e.g. City Plumbers / Mohan"
                          className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Staff Contact */}
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                          <span>Staff Phone Number</span>
                        </label>
                        <input
                          type="tel"
                          name="staffPhone"
                          defaultValue={t.staffPhone || ""}
                          placeholder="+91 98765 00000"
                          className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Status Selector */}
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                          Ticket Status[cite: 1]
                        </label>
                        <select
                          name="status"
                          defaultValue={t.status}
                          className="w-full bg-white/80 dark:bg-slate-900 border border-orange-200/60 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
                        >
                          <option value="OPEN">Open (Awaiting)</option>
                          <option value="IN_PROGRESS">In Progress (Staff Assigned)</option>
                          <option value="RESOLVED">Resolved (Completed)[cite: 1]</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-3 items-end">
                      {/* Estimated Cost */}
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                          <IndianRupee className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                          <span>Repair Cost (₹)</span>
                        </label>
                        <input
                          type="number"
                          name="estimatedCost"
                          step="0.01"
                          defaultValue={t.estimatedCost || ""}
                          placeholder="e.g. 450"
                          className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Resolution Note */}
                      <div className="sm:col-span-1">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                          Resolution Summary
                        </label>
                        <input
                          type="text"
                          name="resolutionNote"
                          defaultValue={t.resolutionNote || ""}
                          placeholder="e.g. Replaced leaking faucet valve"
                          className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Save Changes Button */}
                      <div>
                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Update Ticket</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/70 dark:bg-white/[0.05] border border-dashed border-orange-200/80 dark:border-white/15 backdrop-blur-2xl rounded-3xl p-12 text-center">
            <Wrench className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="font-black text-slate-900 dark:text-white text-base">No Maintenance Requests</h3>
            <p className="text-xs text-slate-500 mt-1">All properties are currently operating with zero pending repair tickets[cite: 1].</p>
          </div>
        )}

      </main>
    </div>
  );
}