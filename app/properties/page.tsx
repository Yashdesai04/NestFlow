import Link from "next/link";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { PropertySearchFilter } from "@/components/PropertySearchFilter";
import {
  Building2,
  MapPin,
  Bed,
  Sparkles,
  Utensils,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    query?: string;
    type?: string;
    city?: string;
    maxPrice?: string;
  }>;
}

export default async function PropertiesDiscoveryPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const { query, type, city, maxPrice } = resolvedSearchParams;

  // Build safe dynamic query filters
  const where: any = {};

  if (type && ["PG", "HOSTEL", "APARTMENT", "HOUSE"].includes(type.toUpperCase())) {
    where.propertyType = type.toUpperCase();
  }

  if (city?.trim()) {
    where.city = { contains: city.trim(), mode: "insensitive" };
  }

  if (maxPrice && !isNaN(Number(maxPrice))) {
    where.priceMonthly = { lte: parseFloat(maxPrice) };
  }

  if (query?.trim()) {
    where.OR = [
      { title: { contains: query.trim(), mode: "insensitive" } },
      { description: { contains: query.trim(), mode: "insensitive" } },
      { address: { contains: query.trim(), mode: "insensitive" } },
      { city: { contains: query.trim(), mode: "insensitive" } },
    ];
  }

  const properties = await db.property.findMany({
    where,
    include: {
      landlord: true,
      rooms: {
        include: { beds: true },
      },
      messMenus: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0" />

      <main className="max-w-7xl mx-auto relative z-10 space-y-8">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-rose-500/15 border border-orange-200/60 dark:border-rose-500/30 text-orange-700 dark:text-rose-400 text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Find Your Next Space</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            Explore Verified PGs, Hostels & Apartments
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            Browse live bed vacancies, transparent monthly rent, mess menus, and schedule property walkthroughs.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <PropertySearchFilter />

        {/* Listings Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Showing {properties.length} Available {properties.length === 1 ? "Listing" : "Listings"}
            </span>
          </div>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => {
                let totalBeds = 0;
                let occupiedBeds = 0;

                p.rooms.forEach((r) => {
                  totalBeds += r.beds.length;
                  r.beds.forEach((b) => {
                    if (b.status === "OCCUPIED") occupiedBeds++;
                  });
                });

                const vacantBeds = Math.max(0, totalBeds - occupiedBeds);
                const hasMess = p.messMenus.length > 0;
                const heroImage =
                  p.images?.[0] ||
                  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60";

                return (
                  <Link
                    key={p.id}
                    href={`/properties/${p.id}`}
                    className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-orange-400 dark:hover:border-rose-500/50 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Property Image Banner */}
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-white/5">
                        <img
                          src={heroImage}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-950/75 text-white backdrop-blur-md">
                            {p.propertyType}
                          </span>
                          {vacantBeds > 0 ? (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/90 text-white backdrop-blur-md">
                              {vacantBeds} Beds Left
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/90 text-white backdrop-blur-md">
                              Fully Booked
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-white font-black text-xs">
                          {formatCurrency(p.priceMonthly || 0)}{" "}
                          <span className="text-[10px] font-normal text-slate-300">/ mo</span>
                        </div>
                      </div>

                      {/* Card Info */}
                      <div className="p-5 sm:p-6 space-y-3">
                        <h3 className="font-black text-base text-slate-950 dark:text-white group-hover:text-orange-600 dark:group-hover:text-rose-400 transition line-clamp-1">
                          {p.title}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span className="line-clamp-1">
                            {p.address}, {p.city}
                          </span>
                        </p>

                        {/* Amenities Chips */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {hasMess && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                              <Utensils className="w-3 h-3" /> Mess Food
                            </span>
                          )}
                          {p.amenities?.slice(0, 3).map((amenity, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-semibold"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 sm:px-6 py-4 border-t border-orange-100 dark:border-white/10 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Bed className="w-4 h-4 text-sky-500" />
                        <span>
                          {p.rooms.length} Rooms ({totalBeds} Beds)
                        </span>
                      </span>
                      <span className="text-orange-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/60 dark:bg-white/[0.03] border border-dashed border-orange-200/80 dark:border-white/15 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-black text-slate-900 dark:text-white text-base">No Matching Properties</h3>
              <p className="text-xs text-slate-500">
                Try adjusting your search criteria or price filters to see available listings.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}