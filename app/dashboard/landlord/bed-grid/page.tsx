import { db } from "@/lib/prisma";
import { BedStatus } from "@prisma/client";
import { DoorOpen, LayoutGrid, Sparkles, Building2, UserCheck, UserX } from "lucide-react";

export default async function BedOccupancyGridPage() {
  // 1. Fetch Room, Bed, and Property Data from PostgreSQL
  const rooms = await db.room.findMany({
    include: {
      beds: true,
      property: {
        select: { title: true },
      },
    },
    orderBy: { roomNumber: "asc" }, // Sorting rooms for a cleaner grid
  });

  // Calculate overall metrics
  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce((acc, room) => acc + room.beds.length, 0);
  const occupiedBeds = rooms.reduce(
    (acc, room) => acc + room.beds.filter((b) => b.status === BedStatus.OCCUPIED).length,
    0
  );
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Background Ambient Theme Backdrop Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0" />

      <main className="max-w-7xl mx-auto relative z-10 space-y-10">
        
        {/* Page Header & Analytics Banner Card */}
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-sky-400/10 border border-blue-200/60 dark:border-sky-400/20 text-blue-700 dark:text-sky-300 text-[11px] font-extrabold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Management Center</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              NestFlow Bed Occupancy Grid
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium max-w-xl">
              Monitor real-time room and bed availability status across all listed PG buildings and properties.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-end shrink-0">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-orange-200/60 dark:border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-xs flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-orange-500 dark:text-rose-400" />
              <span>
                <span className="text-slate-950 dark:text-white font-black">{occupiedBeds}</span> / <span className="font-medium text-slate-500">{totalBeds}</span> Beds Occupied ({occupancyRate}%)
              </span>
            </span>
          </div>
        </div>

        {/* Liquid Glass Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-sm dark:shadow-2xl flex flex-col space-y-5"
            >
              {/* Room Card Header */}
              <div className="flex items-center gap-3 border-b border-orange-100 dark:border-white/10 pb-4">
                <div className="p-2.5 bg-sky-500/10 dark:bg-sky-400/15 text-sky-600 dark:text-sky-400 rounded-2xl border border-sky-200/50 dark:border-sky-400/20">
                  <DoorOpen className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950 dark:text-white tracking-tight">
                    Room {room.roomNumber}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium">
                    <Building2 className="w-3 h-3 text-orange-500 dark:text-rose-400 shrink-0" />
                    <span>{room.property.title}</span>
                  </p>
                </div>
              </div>

              {/* Bed Matrix */}
              <div className="grid grid-cols-2 gap-3.5">
                {room.beds.map((bed) => {
                  const isVacant = bed.status === BedStatus.VACANT;

                  return (
                    <div
                      key={bed.id}
                      className={`p-4 rounded-2xl border transition text-center space-y-1.5 backdrop-blur-sm ${
                        isVacant
                          ? "bg-emerald-500/[0.08] dark:bg-emerald-400/[0.08] border-emerald-200/80 dark:border-emerald-400/20 text-slate-950 dark:text-white"
                          : "bg-rose-500/[0.06] dark:bg-rose-400/[0.06] border-rose-200/60 dark:border-rose-400/15 text-slate-400 dark:text-slate-500 border-dashed"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5 font-black text-sm">
                        <span>{bed.bedNumber}</span>
                      </div>
                      
                      <div
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isVacant
                            ? "bg-emerald-200/80 dark:bg-emerald-400/20 text-emerald-800 dark:text-emerald-300"
                            : "bg-rose-200/60 dark:bg-rose-400/10 text-rose-600 dark:text-rose-500"
                        }`}
                      >
                        {isVacant ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        <span>{bed.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}