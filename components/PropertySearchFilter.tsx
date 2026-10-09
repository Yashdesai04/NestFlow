"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, SlidersHorizontal, IndianRupee, Building2, MapPin, X } from "lucide-react";

export function PropertySearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const handleFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();

    if (query) params.set("query", query);
    if (type) params.set("type", type);
    if (city) params.set("city", city);
    if (maxPrice) params.set("maxPrice", maxPrice);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setQuery("");
    setType("");
    setCity("");
    setMaxPrice("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = Boolean(query || type || city || maxPrice);

  return (
    <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-4">
      <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Search by Keywords */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, landmark, or address..."
            className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white font-medium outline-none focus:border-orange-500 transition"
          />
        </div>

        {/* Property Type Dropdown */}
        <div className="relative">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-white/80 dark:bg-slate-900 border border-orange-200/60 dark:border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold outline-none cursor-pointer"
          >
            <option value="">All Living Types</option>
            <option value="PG">Co-Living PG</option>
            <option value="HOSTEL">Student Hostel</option>
            <option value="APARTMENT">Apartment / Flat</option>
            <option value="HOUSE">Independent House</option>
          </select>
        </div>

        {/* City Filter */}
        <div className="relative">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City (e.g. Surat, Pune)"
            className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white font-medium outline-none focus:border-orange-500 transition"
          />
        </div>

        {/* Max Budget Filter */}
        <div className="relative">
          <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max Rent (₹/mo)"
            className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white font-medium outline-none focus:border-orange-500 transition"
          />
        </div>
      </form>

      {/* Filter Control Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-orange-100 dark:border-white/10">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-orange-500" />
          <span>Real-time availability filters</span>
        </span>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold text-slate-500 hover:text-rose-500 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleFilter()}
            disabled={isPending}
            className="bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow-md hover:opacity-95 transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isPending ? "Filtering..." : "Apply Filters"}
          </button>
        </div>
      </div>
    </div>
  );
}