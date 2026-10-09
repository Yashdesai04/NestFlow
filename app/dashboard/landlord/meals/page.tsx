import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { updateDayMenuAction } from "./actions";
import {
  ArrowLeft,
  Utensils,
  Coffee,
  Sun,
  Moon,
  Building2,
  Users,
  CheckCircle2,
  Save,
  Info,
  Calendar,
  Sparkles,
  ChefHat,
  ShieldCheck,
} from "lucide-react";

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

interface PageProps {
  searchParams: Promise<{ propertyId?: string }>;
}

export default async function LandlordMealsPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      properties: {
        include: {
          messMenus: true,
          leases: {
            where: { status: "ACTIVE" },
            include: { tenant: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!landlord || landlord.role !== "LANDLORD") {
    redirect("/onboarding");
  }

  const properties = landlord.properties;
  if (properties.length === 0) {
    return (
      <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 flex items-center justify-center">
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-8 max-w-md text-center shadow-xl space-y-4">
          <Building2 className="w-10 h-10 text-orange-500 mx-auto" />
          <h2 className="text-lg font-black">No Properties Found</h2>
          <p className="text-xs text-slate-500">List a property first to configure weekly mess schedules.</p>
          <Link href="/properties/new" className="bg-orange-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl inline-block">
            Add Property
          </Link>
        </div>
      </div>
    );
  }

  const { propertyId } = await searchParams;
  const selectedProperty = properties.find((p) => p.id === propertyId) || properties[0];

  // 1. Calculate Today's Real-time Kitchen Headcount
  const now = new Date();
  const dayIndex = now.getDay();
  const todayEnum = (dayIndex === 0 ? "SUNDAY" : DAYS_OF_WEEK[dayIndex - 1]) as typeof DAYS_OF_WEEK[number];

  const todayDateStr = now.toISOString().split("T")[0];
  const startOfDay = new Date(`${todayDateStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${todayDateStr}T23:59:59.999Z`);

  // Fetch today's opt-outs for this property
  const todayOptOuts = await db.mealOptOut.findMany({
    where: {
      propertyId: selectedProperty.id,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const totalResidents = selectedProperty.leases.length;
  const skippedBreakfastCount = todayOptOuts.filter((o) => o.breakfast).length;
  const skippedLunchCount = todayOptOuts.filter((o) => o.lunch).length;
  const skippedDinnerCount = todayOptOuts.filter((o) => o.dinner).length;

  const breakfastPlates = Math.max(0, totalResidents - skippedBreakfastCount);
  const lunchPlates = Math.max(0, totalResidents - skippedLunchCount);
  const dinnerPlates = Math.max(0, totalResidents - skippedDinnerCount);

  // Map existing configured menus by day of week
  const menuMap = new Map(selectedProperty.messMenus.map((m) => [m.dayOfWeek, m]));

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0" />

      <main className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Navigation & Header */}
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/landlord/operations"
                className="p-2.5 rounded-2xl bg-white/80 dark:bg-white/10 border border-orange-200/60 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-rose-400 transition shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-200/60 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider">
                <ChefHat className="w-3.5 h-3.5" />
                <span>Mess Operations</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Weekly Mess Planner & Headcount
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-xl">
              Configure 7-day food menus and view real-time kitchen plate counts based on tenant meal opt-outs.
            </p>
          </div>

          {/* Property Selector */}
          {properties.length > 1 && (
            <div className="flex items-center gap-2 bg-white/80 dark:bg-white/[0.06] border border-orange-200/60 dark:border-white/15 p-1.5 rounded-2xl">
              {properties.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/landlord/meals?propertyId=${p.id}`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    p.id === selectedProperty.id
                      ? "bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  {p.title}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Live Kitchen Headcount Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Utensils className="w-4 h-4 text-orange-500" />
              <span>Today's Kitchen Attendance ({todayEnum.toLowerCase()})</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {totalResidents} Total Assigned Residents
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Breakfast */}
            <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Coffee className="w-4 h-4" /> Breakfast
                </span>
                <span className="text-[10px] font-bold bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded-md">
                  {skippedBreakfastCount} Skipped
                </span>
              </div>
              <div className="text-3xl font-black text-slate-950 dark:text-white">
                {breakfastPlates} <span className="text-xs font-bold text-slate-400">Plates to Prepare</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium truncate">
                Menu: {menuMap.get(todayEnum)?.breakfast || "Standard Breakfast"}
              </p>
            </div>

            {/* Lunch */}
            <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Sun className="w-4 h-4" /> Lunch
                </span>
                <span className="text-[10px] font-bold bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded-md">
                  {skippedLunchCount} Skipped
                </span>
              </div>
              <div className="text-3xl font-black text-slate-950 dark:text-white">
                {lunchPlates} <span className="text-xs font-bold text-slate-400">Plates to Prepare</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium truncate">
                Menu: {menuMap.get(todayEnum)?.lunch || "Standard Lunch"}
              </p>
            </div>

            {/* Dinner */}
            <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Moon className="w-4 h-4" /> Dinner
                </span>
                <span className="text-[10px] font-bold bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded-md">
                  {skippedDinnerCount} Skipped
                </span>
              </div>
              <div className="text-3xl font-black text-slate-950 dark:text-white">
                {dinnerPlates} <span className="text-xs font-bold text-slate-400">Plates to Prepare</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium truncate">
                Menu: {menuMap.get(todayEnum)?.dinner || "Standard Dinner"}
              </p>
            </div>
          </div>
        </div>

        {/* 7-Day Weekly Menu Editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-950 dark:text-white tracking-tight">
              Weekly Meal Menu Schedule ({selectedProperty.title})
            </h2>
            <span className="text-xs text-slate-500 font-medium">Auto-synced with resident dashboards</span>
          </div>

          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day) => {
              const currentMenu = menuMap.get(day);
              const isToday = day === todayEnum;

              return (
                <div
                  key={day}
                  className={`bg-white/70 dark:bg-white/[0.05] border backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-sm transition-all ${
                    isToday
                      ? "border-orange-500/80 dark:border-rose-500/60 ring-2 ring-orange-500/10"
                      : "border-orange-200/60 dark:border-white/10"
                  }`}
                >
                  <form action={updateDayMenuAction}>
                    <input type="hidden" name="propertyId" value={selectedProperty.id} />
                    <input type="hidden" name="dayOfWeek" value={day} />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orange-100 dark:border-white/10 pb-4 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-950 dark:text-white capitalize">
                          {day.toLowerCase()}
                        </span>
                        {isToday && (
                          <span className="text-[9px] bg-orange-500/10 text-orange-600 dark:text-rose-400 px-2 py-0.5 rounded-md font-extrabold uppercase">
                            Today
                          </span>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer active:scale-95"
                      >
                        <Save className="w-3.5 h-3.5 text-orange-400" />
                        <span>Save {day.toLowerCase()} Menu</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      {/* Breakfast Field */}
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                          <Coffee className="w-3.5 h-3.5 text-amber-500" />
                          <span>Breakfast (8:00 AM)</span>
                        </label>
                        <input
                          type="text"
                          name="breakfast"
                          defaultValue={currentMenu?.breakfast || ""}
                          placeholder="e.g. Masala Dosa, Sambar, Tea"
                          className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Lunch Field */}
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                          <Sun className="w-3.5 h-3.5 text-amber-600" />
                          <span>Lunch (1:00 PM)</span>
                        </label>
                        <input
                          type="text"
                          name="lunch"
                          defaultValue={currentMenu?.lunch || ""}
                          placeholder="e.g. Paneer Butter Masala, Roti, Rice, Dal"
                          className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Dinner Field */}
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                          <Moon className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Dinner (8:30 PM)</span>
                        </label>
                        <input
                          type="text"
                          name="dinner"
                          defaultValue={currentMenu?.dinner || ""}
                          placeholder="e.g. Mix Veg Curry, Chapati, Salad"
                          className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </form>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}