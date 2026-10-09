import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  ArrowLeft,
  QrCode,
  ShieldCheck,
  Calendar,
  Clock,
  Send,
  Users,
  User,
  Phone,
  MessageSquare,
} from "lucide-react";

export default async function TenantVisitorPassPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      leases: {
        where: { status: "ACTIVE" },
        include: { property: true, room: true, bed: true },
      },
    },
  });

  if (!user) redirect("/onboarding");
  const activeLease = user.leases[0];

  // Fetch recent visitor passes
  const visitorPasses = await db.gatePass.findMany({
    where: { tenantId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Action to generate new visitor gate pass
  async function createVisitorPassAction(formData: FormData) {
    "use server";
    const visitorName = (formData.get("visitorName") as string) || "";
    const visitorPhone = (formData.get("visitorPhone") as string) || "";
    const inTimeStr = formData.get("expectedInTime") as string;
    const outTimeStr = formData.get("expectedOutTime") as string;
    const reason = (formData.get("reason") as string) || "";

    const entryTime = inTimeStr ? new Date(inTimeStr) : new Date();
    const exitTime = outTimeStr ? new Date(outTimeStr) : null;

    // Generate unique security pass code (e.g. VP-7492)
    const passCode = `VP-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.gatePass.create({
  data: {
    tenantId: user!.id,
    propertyId: activeLease?.propertyId || "",
    visitorName: visitorName.trim(),
    visitorPhone: visitorPhone.trim(),
    entryTime,
    exitTime,
    purpose: reason.trim(),
    passCode,
    validDate: entryTime, // Required by GatePass schema
    status: "APPROVED",
  },
});

    revalidatePath("/dashboard/tenant/gatepass");
  }

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Theme Backdrop Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0" />

      <main className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* Navigation & Header */}
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/tenant"
                className="p-2.5 rounded-2xl bg-white/80 dark:bg-white/10 border border-orange-200/60 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-rose-400 transition shadow-xs"
                title="Back to Resident Portal"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 dark:bg-sky-400/10 border border-sky-200/60 dark:border-sky-500/30 text-sky-700 dark:text-sky-300 text-[11px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Visitor Security Check</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Visitor Gate Pass
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Pre-approve visiting guests, friends, or family members and generate security entry tokens.
            </p>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-2xl space-y-5 sticky top-28">
              <div className="flex items-center gap-2 border-b border-orange-100 dark:border-white/10 pb-4">
                <Users className="w-4 h-4 text-orange-500 dark:text-rose-400" />
                <h2 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider">
                  Issue Visitor Pass
                </h2>
              </div>

              <form action={createVisitorPassAction} className="space-y-4 text-xs">
                {/* Visitor Full Name */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                    <span>Visitor Full Name *</span>
                  </label>
                  <input
                    type="text"
                    name="visitorName"
                    required
                    placeholder="e.g. Alex Johnson"
                    className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:border-orange-500 dark:focus:border-rose-500 font-medium"
                  />
                </div>

                {/* Visitor Phone Number */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                    <span>Visitor Phone Number *</span>
                  </label>
                  <input
                    type="tel"
                    name="visitorPhone"
                    required
                    placeholder="+91 98765 43210"
                    className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:border-orange-500 dark:focus:border-rose-500 font-medium"
                  />
                </div>

                {/* Expected Arrival Time */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                    <span>Expected Arrival Time *</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="expectedInTime"
                    required
                    className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-3.5 py-2.5 text-xs font-medium [color-scheme:light_dark] cursor-pointer"
                  />
                </div>

                {/* Expected Departure Time */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                    <span>Expected Departure (Optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="expectedOutTime"
                    className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-3.5 py-2.5 text-xs font-medium [color-scheme:light_dark] cursor-pointer"
                  />
                </div>

                {/* Purpose of Visit */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                    <span>Purpose of Visit *</span>
                  </label>
                  <textarea
                    name="reason"
                    required
                    rows={2}
                    placeholder="e.g. Group study session / Family visit"
                    className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl p-3.5 text-xs font-medium resize-none outline-none focus:border-orange-500 dark:focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold text-xs py-3 rounded-2xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Generate Visitor Pass</span>
                </button>
              </form>
            </div>
          </div>

          {/* Passes Feed Column */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-black text-slate-950 dark:text-white">
              Issued Visitor Passes ({visitorPasses.length})
            </h2>

            {visitorPasses.length > 0 ? (
              <div className="space-y-4">
                {visitorPasses.map((pass) => (
                  <div
                    key={pass.id}
                    className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm font-black text-slate-950 dark:text-white">
                          {pass.visitorName}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          ({pass.visitorPhone})
                        </span>
                        <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/30 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {pass.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {pass.purpose || "General Visit"}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                          <span className="text-xs font-semibold">
                            {pass.entryTime
                              ? new Date(pass.entryTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Flexible"}
                          </span>
                        </span>
                        {pass.exitTime && (
                          <>
                            <span>·</span>
                            <span>
                              Exit:{" "}
                              {new Date(pass.exitTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Security Pass Code Box */}
                    <div className="bg-white/80 dark:bg-white/[0.06] border border-orange-200/60 dark:border-white/15 p-4 rounded-2xl text-center shrink-0 min-w-[130px]">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        Security Token
                      </span>
                      <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500 dark:from-rose-400 dark:to-purple-300 tracking-wider">
                        {pass.passCode}
                      </span>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                        Verified Pass
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/60 dark:bg-white/[0.03] border border-dashed border-orange-200/80 dark:border-white/15 rounded-3xl p-12 text-center">
                <QrCode className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h3 className="font-black text-slate-900 dark:text-white text-sm">
                  No Visitor Passes Issued
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Fill out the form on the left to issue a gate entry code for your guests.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}