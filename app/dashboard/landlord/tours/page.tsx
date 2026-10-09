import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { updateTourStatusAction } from "./actions";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building2,
  User,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  X,
  Compass,
  MapPin,
  CalendarCheck,
} from "lucide-react";

export default async function LandlordToursPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!landlord || landlord.role !== "LANDLORD") {
    redirect("/onboarding");
  }

  // Fetch all tour requests across landlord's properties
  const tours = await db.propertyTour.findMany({
    where: {
      property: { landlordId: landlord.id },
    },
    include: {
      property: true,
    },
    orderBy: { tourDate: "asc" },
  });

  const totalTours = tours.length;
  const pendingTours = tours.filter((t) => t.status === "PENDING");
  const confirmedTours = tours.filter((t) => t.status === "CONFIRMED");
  const completedTours = tours.filter((t) => t.status === "COMPLETED");

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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-rose-500/15 border border-orange-200/60 dark:border-rose-500/30 text-orange-700 dark:text-rose-400 text-[11px] font-black uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>Visit Schedule</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Property Walkthroughs & Visits
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-xl">
              Review visit appointments booked by prospective residents, confirm tour slots, and record visit outcomes.
            </p>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">
              Pending Confirmation
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {pendingTours.length} Requests
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">Requires schedule approval</p>
          </div>

          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-500">
              Confirmed Walkthroughs
            </span>
            <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
              {confirmedTours.length} Scheduled
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">Upcoming property visits</p>
          </div>

          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Completed Visits
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {completedTours.length} Completed
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">Total conducted walkthroughs</p>
          </div>
        </div>

        {/* Tour Feed */}
        <div className="space-y-4">
          <h2 className="text-base font-black text-slate-950 dark:text-white">
            Scheduled Visits ({totalTours})
          </h2>

          {tours.length > 0 ? (
            <div className="space-y-5">
              {tours.map((t) => {
                const isPending = t.status === "PENDING";
                const isConfirmed = t.status === "CONFIRMED";
                const isCompleted = t.status === "COMPLETED";
                const isCancelled = t.status === "CANCELLED";

                return (
                  <div
                    key={t.id}
                    className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-2xl space-y-5"
                  >
                    {/* Top Row: Property & Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orange-100 dark:border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap mb-1">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                              isConfirmed
                                ? "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200/60"
                                : isCompleted
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/60"
                                : isCancelled
                                ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200/60"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/60"
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>

                        <h3 className="text-base font-black text-slate-950 dark:text-white">
                          {t.property.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                          <span>{t.property.address}, {t.property.city}</span>
                        </p>
                      </div>

                      {/* Visitor Details Card */}
                      <div className="p-3.5 bg-white/60 dark:bg-white/[0.03] border border-orange-100/80 dark:border-white/10 rounded-2xl text-xs space-y-1 min-w-[220px]">
                        <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                          Prospective Visitor
                        </span>
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{t.visitorName}</span>
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{t.email}</span>
                        </p>
                        {t.phone && (
                          <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <a href={`tel:${t.phone}`} className="hover:underline font-medium">
                              {t.phone}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Visit Schedule Specs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-lg">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-400 block">Requested Date</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {new Date(t.tourDate).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-400 block">Time Window</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {t.timeSlot || "Flexible Timing"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {t.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-white/[0.01] p-3 rounded-xl border border-slate-100 dark:border-white/5">
                        <strong className="text-slate-800 dark:text-slate-200">Visitor Note:</strong> {t.notes}
                      </p>
                    )}

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-orange-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                      {isPending && (
                        <div className="flex items-center gap-2">
                          <form action={updateTourStatusAction}>
                            <input type="hidden" name="tourId" value={t.id} />
                            <input type="hidden" name="status" value="CONFIRMED" />
                            <button
                              type="submit"
                              className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Confirm Appointment</span>
                            </button>
                          </form>

                          <form action={updateTourStatusAction}>
                            <input type="hidden" name="tourId" value={t.id} />
                            <input type="hidden" name="status" value="CANCELLED" />
                            <button
                              type="submit"
                              className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                          </form>
                        </div>
                      )}

                      {isConfirmed && (
                        <div className="flex items-center gap-2">
                          <form action={updateTourStatusAction}>
                            <input type="hidden" name="tourId" value={t.id} />
                            <input type="hidden" name="status" value="COMPLETED" />
                            <button
                              type="submit"
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Walkthrough Completed</span>
                            </button>
                          </form>

                          <form action={updateTourStatusAction}>
                            <input type="hidden" name="tourId" value={t.id} />
                            <input type="hidden" name="status" value="CANCELLED" />
                            <button
                              type="submit"
                              className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 px-3 py-2 rounded-xl transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          </form>
                        </div>
                      )}

                      {isCompleted && (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Walkthrough Conducted Successfully</span>
                        </span>
                      )}

                      {isCancelled && (
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" />
                          <span>Visit Cancelled</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/60 dark:bg-white/[0.03] border border-dashed border-orange-200/80 dark:border-white/15 rounded-3xl p-12 text-center">
              <Compass className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="font-black text-slate-900 dark:text-white text-base">No Visit Requests Yet</h3>
              <p className="text-xs text-slate-500 mt-1">Tour appointments submitted by prospective residents on your property pages will appear here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}