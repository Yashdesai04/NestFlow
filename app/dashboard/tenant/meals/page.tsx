import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  ArrowLeft,
  Utensils,
  Coffee,
  Sun,
  Moon,
  CheckCircle2,
  XCircle,
  Calendar,
  Info,
  ShieldCheck,
} from "lucide-react";

// Format local YYYY-MM-DD
function getLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function TenantMealOptOutPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  // 1. Fetch user with active lease
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      leases: {
        where: { status: "ACTIVE" },
        include: { property: true },
      },
    },
  });

  if (!user) redirect("/onboarding");

  const activeLease = user.leases[0];

  if (!activeLease || !activeLease.property) {
    return (
      <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden flex items-center justify-center">
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0" />
        <div className="relative z-10 bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-4">
          <div className="p-3 bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 rounded-2xl inline-block">
            <Utensils className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-950 dark:text-white">
            No Active PG Lease Found
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            You must be assigned to an active PG or Co-Living property to manage daily mess meal opt-outs.
          </p>
          <Link
            href="/properties"
            className="bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-md inline-block hover:opacity-95 transition"
          >
            Explore Available Listings
          </Link>
        </div>
      </div>
    );
  }

  // 2. Generate local calendar dates for the next 7 days
  const now = new Date();
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const dateKey = getLocalDateString(d);
    return {
      dateObj: d,
      dateKey,
      startOfDay: new Date(`${dateKey}T00:00:00.000Z`),
      endOfDay: new Date(`${dateKey}T23:59:59.999Z`),
    };
  });

  // 3. Fetch all upcoming meal opt-outs for this resident
  const earliestDate = next7Days[0].startOfDay;
  const existingOptOuts = await db.mealOptOut.findMany({
    where: {
      tenantId: user.id,
      date: { gte: earliestDate },
    },
    orderBy: { date: "asc" },
  });

  // 4. Server Action with 24-hour day-window matching and duplicate cleanup
  async function toggleMealAction(formData: FormData) {
    "use server";
    const { userId: authUserId } = await auth();
    if (!authUserId) throw new Error("Unauthorized.");

    const currentUser = await db.user.findUnique({
      where: { clerkId: authUserId },
    });
    if (!currentUser) throw new Error("User record not found.");

    const dateStr = formData.get("date") as string;
    const mealType = formData.get("mealType") as "breakfast" | "lunch" | "dinner";
    const currentValue = formData.get("currentValue") === "true";
    const propertyId = formData.get("propertyId") as string;

    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
    const newStatus = !currentValue;

    // Search within the 24-hour window to catch any timezone-drifted records
    const existingRecords = await db.mealOptOut.findMany({
      where: {
        tenantId: currentUser.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingRecords.length > 0) {
      const primary = existingRecords[0];
      await db.mealOptOut.update({
        where: { id: primary.id },
        data: {
          [mealType]: newStatus,
          date: startOfDay, // Normalize timestamp
        },
      });

      // Clean up any stale duplicate rows for the same date
      if (existingRecords.length > 1) {
        const duplicateIds = existingRecords.slice(1).map((r) => r.id);
        await db.mealOptOut.deleteMany({
          where: { id: { in: duplicateIds } },
        });
      }
    } else {
      await db.mealOptOut.create({
        data: {
          tenantId: currentUser.id,
          propertyId: propertyId || activeLease.propertyId,
          date: startOfDay,
          breakfast: mealType === "breakfast" ? newStatus : false,
          lunch: mealType === "lunch" ? newStatus : false,
          dinner: mealType === "dinner" ? newStatus : false,
        },
      });
    }

    revalidatePath("/dashboard/tenant/meals");
  }

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Theme Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0" />

      <main className="max-w-4xl mx-auto relative z-10 space-y-8">
        
        {/* Header Card */}
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-200/60 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider">
                <Utensils className="w-3.5 h-3.5" />
                <span>Mess Management</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Daily Meal Opt-Out
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-xl">
              Mark meals you plan to skip over the next 7 days so the kitchen staff can adjust preparations accurately.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-white/[0.06] border border-orange-200/60 dark:border-white/10 px-4 py-2.5 rounded-2xl shadow-xs self-start sm:self-auto text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-orange-500 dark:text-rose-400" />
            <span>{activeLease.property.title}</span>
          </div>
        </div>

        {/* Info Notice */}
        <div className="bg-amber-500/[0.06] dark:bg-amber-400/[0.04] border border-amber-200/60 dark:border-amber-400/15 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 font-medium">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p>
            Tapping a meal switches your status to <strong>Skipping</strong> (red badge with <XCircle className="w-3 h-3 inline text-rose-500 mx-0.5" />). Tapping again reverts it back to <strong>Eating</strong> (<CheckCircle2 className="w-3 h-3 inline text-emerald-500 mx-0.5" />).
          </p>
        </div>

        {/* 7 Days List */}
        <div className="space-y-4">
          {next7Days.map(({ dateObj, dateKey, startOfDay, endOfDay }, idx) => {
            const isToday = idx === 0;

            // Find matching opt-out record within the day's timestamp window
            const dayRecord = existingOptOuts.find((item) => {
              const itemTime = new Date(item.date).getTime();
              return itemTime >= startOfDay.getTime() && itemTime <= endOfDay.getTime();
            });

            const isSkippingBreakfast = Boolean(dayRecord?.breakfast);
            const isSkippingLunch = Boolean(dayRecord?.lunch);
            const isSkippingDinner = Boolean(dayRecord?.dinner);

            return (
              <div
                key={dateKey}
                className={`bg-white/70 dark:bg-white/[0.05] border backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isToday
                    ? "border-orange-500/80 dark:border-rose-500/60 ring-2 ring-orange-500/10"
                    : "border-orange-200/60 dark:border-white/10"
                }`}
              >
                {/* Date Badge */}
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-white/80 dark:bg-white/10 rounded-2xl border border-orange-100 dark:border-white/10 text-center min-w-[64px]">
                    <span className="block text-[10px] font-black uppercase text-orange-600 dark:text-rose-400">
                      {dateObj.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span className="block text-lg font-black text-slate-950 dark:text-white leading-tight">
                      {dateObj.getDate()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-950 dark:text-white text-sm flex items-center gap-2">
                      <span>{dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                      {isToday && (
                        <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-rose-400 px-2 py-0.5 rounded-md font-extrabold uppercase">
                          Today
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Select which meal you will not be attending:
                    </p>
                  </div>
                </div>

                {/* Meal Toggles */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  
                  {/* Breakfast */}
                  <form action={toggleMealAction}>
                    <input type="hidden" name="date" value={dateKey} />
                    <input type="hidden" name="mealType" value="breakfast" />
                    <input type="hidden" name="currentValue" value={isSkippingBreakfast ? "true" : "false"} />
                    <input type="hidden" name="propertyId" value={activeLease.propertyId} />
                    <button
                      type="submit"
                      className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer border active:scale-95 ${
                        isSkippingBreakfast
                          ? "bg-rose-500/10 border-rose-200 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-xs"
                          : "bg-white/80 dark:bg-white/[0.05] border-orange-200/60 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-orange-400"
                      }`}
                    >
                      <Coffee className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                      <span>Breakfast</span>
                      {isSkippingBreakfast ? (
                        <XCircle className="w-3.5 h-3.5 text-rose-500 ml-0.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-0.5" />
                      )}
                    </button>
                  </form>

                  {/* Lunch */}
                  <form action={toggleMealAction}>
                    <input type="hidden" name="date" value={dateKey} />
                    <input type="hidden" name="mealType" value="lunch" />
                    <input type="hidden" name="currentValue" value={isSkippingLunch ? "true" : "false"} />
                    <input type="hidden" name="propertyId" value={activeLease.propertyId} />
                    <button
                      type="submit"
                      className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer border active:scale-95 ${
                        isSkippingLunch
                          ? "bg-rose-500/10 border-rose-200 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-xs"
                          : "bg-white/80 dark:bg-white/[0.05] border-orange-200/60 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-orange-400"
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Lunch</span>
                      {isSkippingLunch ? (
                        <XCircle className="w-3.5 h-3.5 text-rose-500 ml-0.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-0.5" />
                      )}
                    </button>
                  </form>

                  {/* Dinner */}
                  <form action={toggleMealAction}>
                    <input type="hidden" name="date" value={dateKey} />
                    <input type="hidden" name="mealType" value="dinner" />
                    <input type="hidden" name="currentValue" value={isSkippingDinner ? "true" : "false"} />
                    <input type="hidden" name="propertyId" value={activeLease.propertyId} />
                    <button
                      type="submit"
                      className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer border active:scale-95 ${
                        isSkippingDinner
                          ? "bg-rose-500/10 border-rose-200 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-xs"
                          : "bg-white/80 dark:bg-white/[0.05] border-orange-200/60 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-orange-400"
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      <span>Dinner</span>
                      {isSkippingDinner ? (
                        <XCircle className="w-3.5 h-3.5 text-rose-500 ml-0.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-0.5" />
                      )}
                    </button>
                  </form>

                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}