import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { togglePropertyVerificationAction, deletePropertyAction } from "../actions";
import {
  ArrowLeft,
  Building2,
  Eye,
  Trash2,
  MapPin,
  Bed,
  Search,
  CheckCircle2,
} from "lucide-react";

interface PropertiesPageProps {
  searchParams: Promise<{ query?: string }>;
}

export default async function AdminPropertiesPage({ searchParams }: PropertiesPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const admin = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!admin || admin.role !== "ADMIN") {
    redirect("/dashboard/landlord");
  }

  const resolvedSearchParams = await searchParams;
  const query = (resolvedSearchParams?.query || "").trim().toLowerCase();

  const properties = await db.property.findMany({
    include: {
      landlord: true,
      rooms: { include: { beds: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const filtered = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(query) ||
      p.city.toLowerCase().includes(query) ||
      (p.landlord.fullName || "").toLowerCase().includes(query) ||
      p.landlord.email.toLowerCase().includes(query)
  );

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-28 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[750px] h-[750px] bg-gradient-to-tr from-rose-500/20 via-purple-600/15 to-indigo-600/20 rounded-full blur-[180px] pointer-events-none -z-0" />

      <main className="max-w-6xl mx-auto relative z-10 space-y-8">
        <div className="relative rounded-[40px] sm:rounded-[48px] bg-white/70 dark:bg-white/[0.04] backdrop-blur-3xl border border-rose-200/60 dark:border-white/15 p-6 sm:p-10 shadow-[0_30px_90px_-20px_rgba(244,63,94,0.12),0_15px_35px_-10px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,0.95)] dark:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.15)] space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-rose-100 dark:border-white/[0.08] pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/admin"
                  className="p-2.5 rounded-full bg-white/80 dark:bg-white/10 border border-rose-200/60 dark:border-white/20 text-slate-700 dark:text-slate-200 shadow-xs transition cursor-pointer"
                  title="Back to Admin Console"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-200/60 text-orange-700 dark:text-rose-400 text-[11px] font-black uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Quality Control</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight pt-1">
                Property Listing Moderation
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                Verify PG and hostel inventory, inspect safety disclosures, and approve public catalog listings.
              </p>
            </div>

            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-rose-200/60 px-4 py-2.5 rounded-2xl shadow-xs self-start sm:self-auto">
              <strong className="text-slate-950 dark:text-white">{properties.length}</strong> Total Properties
            </span>
          </div>

          {/* Search Form */}
          <form
            action="/dashboard/admin/properties"
            method="GET"
            className="relative flex items-center bg-white/90 dark:bg-white/10 backdrop-blur-2xl rounded-full border border-rose-200/60 dark:border-white/20 p-1.5 shadow-xs"
          >
            <Search className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Search properties by title, city, or landlord..."
              className="w-full bg-transparent px-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 text-white font-extrabold text-xs shadow-sm hover:opacity-95 transition cursor-pointer mr-0.5"
            >
              Search
            </button>
          </form>

          {/* Listings List */}
          {filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((p) => {
                let pBeds = 0;
                let pOccupied = 0;
                p.rooms.forEach((r) => {
                pBeds += r.beds.length;
                r.beds.forEach((b) => {
                  if (b.status === "OCCUPIED") pOccupied++;
                });
              });

                return (
                  <div
                    key={p.id}
                    className="p-6 rounded-[32px] bg-white/70 dark:bg-white/[0.04] backdrop-blur-2xl border border-rose-200/60 dark:border-white/15 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                            p.isVerified
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/60"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/60"
                          }`}
                        >
                          {p.isVerified ? "Verified Listing" : "Under Review"}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 uppercase">
                          {p.propertyType}
                        </span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {formatCurrency(p.priceMonthly || 0)} / mo
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-950 dark:text-white">{p.title}</h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-orange-500" />
                          <span>{p.address}, {p.city}</span>
                        </span>
                        <span>Host: <strong>{p.landlord.fullName || p.landlord.email}</strong></span>
                        <span>Capacity: <strong>{pOccupied}/{pBeds} Beds Booked</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-rose-100 dark:border-white/10">
                      <Link
                        href={`/properties/${p.id}`}
                        target="_blank"
                        className="p-2.5 rounded-xl bg-white/80 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1 border border-rose-200/50"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Inspect</span>
                      </Link>

                      <form action={togglePropertyVerificationAction}>
                        <input type="hidden" name="propertyId" value={p.id} />
                        <input type="hidden" name="isVerified" value={p.isVerified ? "false" : "true"} />
                        <button
                          type="submit"
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold text-white transition shadow-sm cursor-pointer ${
                            p.isVerified
                              ? "bg-amber-600 hover:bg-amber-700"
                              : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95"
                          }`}
                        >
                          {p.isVerified ? "Revoke Verification" : "Approve Listing"}
                        </button>
                      </form>

                      <form action={deletePropertyAction}>
                        <input type="hidden" name="propertyId" value={p.id} />
                        <button
                          type="submit"
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-500/10 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-rose-200 rounded-3xl">
              No properties found matching your search.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}