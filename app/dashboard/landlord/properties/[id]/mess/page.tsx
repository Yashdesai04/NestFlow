import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { updateDayMenu } from "./actions";
import {
  ArrowLeft,
  Utensils,
  Coffee,
  Sun,
  Moon,
  Save,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export default async function MessSchedulePage({
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

  // Fetch Property along with existing Mess Menu entries
  const property = await db.property.findFirst({
    where: {
      id: propertyId,
      landlordId: user.id,
    },
    include: {
      messMenus: true,
    },
  });

  if (!property) redirect("/dashboard/landlord");

  // Convert menu array into a lookup map for easy access
  const menuMap = new Map(
    property.messMenus.map((menu) => [menu.dayOfWeek, menu])
  );

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
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-200/60 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider mb-1">
                <Utensils className="w-3.5 h-3.5" /> Mess & Meal Schedule
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                {property.title}
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/10 border border-orange-200/60 dark:border-white/15 px-3.5 py-2 rounded-2xl shadow-xs">
            <Clock className="w-4 h-4 text-orange-500 dark:text-rose-400" />
            <span>Auto-synced with Resident App</span>
          </div>
        </div>

        {/* Page Description Header */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
            Weekly Mess Menu Planner
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-2xl">
            Configure the 3 daily meals for residents. Tenants can view this schedule live on their resident portal.
          </p>
        </div>

        {/* 7-Day Schedule Grid */}
        <div className="space-y-6">
          {DAYS_OF_WEEK.map((day) => {
            const dayMenu = menuMap.get(day);

            return (
              <div
                key={day}
                className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-2xl hover:shadow-lg dark:hover:shadow-rose-500/10 transition-all duration-300 space-y-5"
              >
                {/* Day Card Header */}
                <div className="flex items-center justify-between border-b border-orange-100 dark:border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-orange-500/10 dark:bg-rose-500/15 text-orange-600 dark:text-rose-400 border border-orange-200/50 dark:border-rose-500/20">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <h3 className="font-black text-slate-950 dark:text-white text-base capitalize tracking-tight">
                      {day.toLowerCase()} Schedule
                    </h3>
                  </div>

                  {dayMenu && (
                    <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Menu Configured</span>
                    </span>
                  )}
                </div>

                {/* Day Menu Form */}
                <form action={updateDayMenu} className="space-y-5">
                  <input type="hidden" name="propertyId" value={property.id} />
                  <input type="hidden" name="dayOfWeek" value={day} />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Breakfast */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        <span>Breakfast (8:00 - 10:00 AM)</span>
                      </label>
                      <textarea
                        name="breakfast"
                        rows={2}
                        defaultValue={dayMenu?.breakfast || ""}
                        placeholder="e.g. Aloo Paratha, Curd, Tea / Coffee"
                        className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:border-orange-500 dark:focus:border-rose-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-rose-500/20 transition font-medium resize-none"
                      />
                    </div>

                    {/* Lunch */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Lunch (12:00 - 1:30 PM)</span>
                      </label>
                      <textarea
                        name="lunch"
                        rows={2}
                        defaultValue={dayMenu?.lunch || ""}
                        placeholder="e.g. Rice, Dal Makhani, Roti, Salad"
                        className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:border-orange-500 dark:focus:border-rose-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-rose-500/20 transition font-medium resize-none"
                      />
                    </div>

                    {/* Dinner */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                        <span>Dinner (8:00 - 9:30 PM)</span>
                      </label>
                      <textarea
                        name="dinner"
                        rows={2}
                        defaultValue={dayMenu?.dinner || ""}
                        placeholder="e.g. Paneer Butter Masala, Chapati, Rice, Kheer"
                        className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:border-orange-500 dark:focus:border-rose-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-rose-500/20 transition font-medium resize-none"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-md hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save {day.toLowerCase()} Menu</span>
                    </button>
                  </div>
                </form>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}