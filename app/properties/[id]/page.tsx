import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { PropertyDetailClient } from "@/components/PropertyDetailClient";
import { ArrowLeft, MapPin, Utensils } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const property = await db.property.findUnique({
    where: { id },
    include: {
      landlord: true,
      rooms: {
        include: { beds: true },
        orderBy: { roomNumber: "asc" },
      },
      messMenus: {
        orderBy: { dayOfWeek: "asc" },
      },
    },
  });

  if (!property) notFound();

  let totalBeds = 0;
  let occupiedBeds = 0;

  property.rooms.forEach((r) => {
    totalBeds += r.beds.length;
    r.beds.forEach((b) => {
      if (b.status === "OCCUPIED") occupiedBeds++;
    });
  });

  const vacantBeds = Math.max(0, totalBeds - occupiedBeds);

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0" />

      <main className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/properties"
            className="p-2.5 rounded-2xl bg-white/80 dark:bg-white/10 border border-orange-200/60 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-rose-400 transition shadow-xs flex items-center gap-2 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Discovery</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-orange-500/10 text-orange-700 dark:text-rose-400 border border-orange-200/60">
              {property.propertyType}
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
              {vacantBeds} Beds Vacant
            </span>
          </div>
        </div>

        {/* Property Info Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            {property.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
            <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
            <span>
              {property.address}, {property.city}, {property.state} {property.zipCode}
            </span>
          </p>
        </div>

        {/* Interactive Client View (Gallery, Bed Matrix, Forms) */}
        <PropertyDetailClient
          property={{
            id: property.id,
            title: property.title,
            priceMonthly: property.priceMonthly,
            images: property.images,
            rooms: property.rooms.map((r) => ({
              id: r.id,
              roomNumber: r.roomNumber,
              roomType: r.roomType,
              beds: r.beds.map((b) => ({
                id: b.id,
                bedNumber: b.bedNumber,
                priceMonthly: b.priceMonthly,
                isOccupied: b.status === "OCCUPIED",
              })),
            })),
            landlord: {
              fullName: property.landlord.fullName,
              email: property.landlord.email,
              phone: property.landlord.phone,
            },
          }}
        />

        {/* Mess Menu Section (if configured) */}
        {property.messMenus.length > 0 && (
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-black text-slate-950 dark:text-white">
                Weekly Mess & Meal Schedule
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {property.messMenus.map((menu) => (
                <div
                  key={menu.id}
                  className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1.5"
                >
                  <span className="font-black text-slate-900 dark:text-white capitalize block">
                    {menu.dayOfWeek.toLowerCase()}
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                    <strong>Breakfast:</strong> {menu.breakfast || "Standard"}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                    <strong>Lunch:</strong> {menu.lunch || "Standard"}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                    <strong>Dinner:</strong> {menu.dinner || "Standard"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}