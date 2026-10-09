import Link from "next/link";
import { db } from "@/lib/prisma";
import { PropertyType } from "@prisma/client";
import { SignedIn, SignedOut } from "@/components/ClerkAuth";
import { ListingImageSlider } from "@/components/ListingImageSlider";
import {
  Building2,
  Bed,
  Utensils,
  Wrench,
  ShieldCheck,
  Search,
  ArrowRight,
  CheckCircle2,
  Users,
  Sparkles,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  MessageSquare,
  Mail,
  FileText,
  DoorOpen,
  UserCheck,
  Compass,
  Calendar,
  MapPin,
  Zap,
  Activity,
} from "lucide-react";

const FAQS = [
  {
    q: "How does real-time bed tracking work for PG owners?",
    a: "Landlords can configure custom room structures (e.g. Room 101 as Triple Sharing). Each individual bed (Bed A, Bed B, Bed C) features its own price and can be assigned to residents by email. Once assigned, availability dynamically shifts from VACANT to OCCUPIED across search listings.",
  },
  {
    q: "Can residents view their daily 3-meal schedule on their phone?",
    a: "Yes! Residents access their live Tenant Portal (`/dashboard/tenant`) to inspect today's meals: Breakfast (8:00 AM – 10:00 AM), Lunch (12:00 PM – 1:30 PM), and Dinner (8:00 PM – 9:30 PM).",
  },
  {
    q: "How are maintenance requests logged and resolved?",
    a: "Tenants log issues directly with priority flags (`HIGH`, `MEDIUM`, `LOW`). Property managers receive real-time ticket notifications on their central Ticket Resolver and can transition statuses from 'Open' to 'In Progress' and 'Resolved'.",
  },
  {
    q: "How does tenant onboarding and bed assignment work?",
    a: "Landlords enter the resident's registered email address. NestFlow links the tenant to an active digital lease and sets the selected bed to OCCUPIED. When a resident checks out, one click terminates the lease and returns the bed to VACANT.",
  },
  {
    q: "Is there a limit on how many properties or beds I can manage?",
    a: "Zero limits. NestFlow scales seamlessly from a boutique 4-bed flat to high-capacity co-living buildings with 200+ beds across multiple cities.",
  },
];

export default async function LandingPage() {
  const FEATURED_LIMIT = 6;
  const featuredProperties = await db.property.findMany({
    take: FEATURED_LIMIT,
    include: {
      rooms: {
        include: { beds: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="text-slate-900 dark:text-slate-100 selection:bg-orange-400 selection:text-white transition-colors duration-400 overflow-hidden pb-16">
      
      {/* 1. HERO SECTION WITH PEACH, YELLOW & SKY BLUE AMBIENT GLOW */}
      <section className="relative pt-12 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] pointer-events-none -z-0">
          <div className="absolute top-10 left-1/4 w-[450px] h-[450px] bg-gradient-to-tr from-orange-300/35 via-amber-200/35 to-yellow-200/30 dark:from-rose-600/30 dark:via-purple-500/20 dark:to-indigo-600/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-28 right-1/4 w-[400px] h-[400px] bg-gradient-to-bl from-amber-200/35 via-sky-200/35 to-blue-300/30 dark:from-cyan-500/20 dark:via-blue-500/20 dark:to-purple-500/20 rounded-full blur-[130px]" />
          <div className="absolute inset-0 bg-[radial-gradient(#fed7aa_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          {/* Liquid Status Pill */}
          <div className="inline-flex items-center gap-2.5 bg-white/75 dark:bg-[#0c1222]/80 backdrop-blur-xl border border-white/90 dark:border-white/10 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-md dark:shadow-2xl mb-8 transition duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-sky-600 dark:from-rose-400 dark:to-indigo-300 bg-clip-text text-transparent font-bold">
              NestFlow
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-slate-700 dark:text-slate-300 text-[11px]">Intelligent Co-Living Infrastructure</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] max-w-5xl mx-auto text-slate-950 dark:text-white">
            The Operating System for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-sky-600 dark:from-rose-400 dark:via-purple-300 dark:to-cyan-300">
              Modern Co-Living & PGs
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto mt-6 leading-relaxed font-medium">
            Real-time bed occupancy matrices, synced meal mess schedules, and one-click maintenance operations built for property managers and modern residents.
          </p>

          {/* Hero CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/properties"
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 via-amber-500 to-sky-600 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm px-8 py-4 rounded-full shadow-lg shadow-orange-500/20 transition-all duration-300 flex items-center justify-center gap-2 group border border-white/30"
            >
              <Search className="w-4 h-4 text-amber-100" /> Explore Properties
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>

            <SignedOut>
              <Link
                href="/register"
                className="w-full sm:w-auto bg-white/80 hover:bg-white dark:bg-white/[0.08] dark:hover:bg-white/[0.15] text-slate-900 dark:text-slate-200 font-bold text-xs sm:text-sm px-8 py-4 rounded-full border border-white/80 dark:border-white/10 backdrop-blur-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4 text-orange-500" /> List Your Property
              </Link>
            </SignedOut>

            <SignedIn>
              <Link
                href="/onboarding"
                className="w-full sm:w-auto bg-white/80 hover:bg-white dark:bg-white/[0.08] dark:hover:bg-white/[0.15] text-slate-900 dark:text-white font-bold text-xs sm:text-sm px-8 py-4 rounded-full border border-white/80 dark:border-white/10 backdrop-blur-xl shadow-md transition flex items-center justify-center gap-2"
              >
                Go to Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
            </SignedIn>
          </div>

          {/* Highlights */}
          <div className="mt-14 pt-8 border-t border-orange-200/40 dark:border-white/10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Instant Bed Matrix
            </span>
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Live Meal Sync
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-blue-400" /> 100% Digital Leases
            </span>
          </div>
        </div>
      </section>

      {/* 2. STATS STRIP */}
      <section className="py-6 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center bg-white/60 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-3xl p-6 shadow-xl">
          <div className="p-3">
            <div className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">100%</div>
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-1">
              Live Bed Tracking
            </div>
          </div>
          <div className="p-3">
            <div className="text-3xl sm:text-4xl font-black text-orange-600 dark:text-rose-400">
              3 Meals
            </div>
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-1">
              Automated Planner
            </div>
          </div>
          <div className="p-3">
            <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-purple-400">
              0-Friction
            </div>
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-1">
              Resident Onboarding
            </div>
          </div>
          <div className="p-3">
            <div className="text-3xl sm:text-4xl font-black text-sky-600 dark:text-emerald-400 tracking-tight">24/7</div>
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-1">
              Issue Resolution
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROPERTIES */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-rose-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5" /> Handpicked Spaces
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Featured Properties
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Explore verified PGs, rooms, and co-living homes with real-time vacancies.
            </p>
          </div>

          <Link
            href="/properties"
            className="text-xs font-bold text-orange-700 dark:text-rose-400 bg-white/70 dark:bg-white/[0.06] border border-white/80 dark:border-white/10 px-4 py-2 rounded-full transition flex items-center gap-1.5 w-fit hover:scale-105 shadow-sm"
          >
            View All Listings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featuredProperties.length > 0 ? (
          <div className="flex flex-col gap-6">
            {featuredProperties.map((property) => {
              const isPG = property.propertyType === PropertyType.PG;

              let displayPrice = `₹${property.priceMonthly || 0}/mo`;
              let vacantBedsCount = 0;

              if (isPG && property.rooms.length > 0) {
                const allBeds = property.rooms.flatMap((r) => r.beds);
                vacantBedsCount = allBeds.filter((b) => b.status === "VACANT").length;

                const validPrices = allBeds
                  .map((b) => b.priceMonthly)
                  .filter((p): p is number => p !== null && p !== undefined && p > 0);

                if (validPrices.length > 0) {
                  const minBedPrice = Math.min(...validPrices);
                  displayPrice = `From ₹${minBedPrice}/mo`;
                }
              }

              return (
                <div
                  key={property.id}
                  className="bg-white/60 dark:bg-black/35 border border-white/80 dark:border-white/10 hover:border-orange-300 dark:hover:border-rose-400/50 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row justify-between group"
                >
                  <div className="w-full md:w-80 shrink-0">
                    <ListingImageSlider
                      images={property.images}
                      title={property.title}
                      isPG={isPG}
                      vacantBeds={isPG ? vacantBedsCount : undefined}
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-orange-100/70 dark:bg-white/10 text-orange-800 dark:text-slate-200">
                          {property.city}
                        </span>
                        <span className="font-black text-orange-600 dark:text-rose-400 text-lg">
                          {displayPrice}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-950 dark:text-white text-xl leading-snug">
                        {property.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span className="truncate">{property.address}, {property.city}</span>
                      </p>

                      {property.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed font-normal">
                          {property.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-orange-100/50 dark:border-white/5">
                      <div>
                        {isPG ? (
                          <span className="bg-amber-100/70 dark:bg-purple-500/15 text-amber-800 dark:text-purple-300 border border-amber-200/60 dark:border-purple-500/20 px-3 py-1 rounded-full text-[11px] font-bold">
                            {vacantBedsCount > 0 ? `${vacantBedsCount} Beds Available` : "Fully Occupied"}
                          </span>
                        ) : (
                          <span className="bg-sky-100/70 dark:bg-rose-500/15 text-sky-800 dark:text-rose-300 border border-sky-200/60 dark:border-rose-500/20 px-3 py-1 rounded-full text-[11px] font-bold">
                            Entire House
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/properties/${property.id}`}
                        className="bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 text-xs font-extrabold px-5 py-2 rounded-full flex items-center gap-1.5 transition shadow-sm hover:scale-105"
                      >
                        View Details <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/50 dark:bg-white/[0.04] backdrop-blur-xl border border-dashed border-white/80 dark:border-white/10 rounded-3xl p-12 text-center">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">No Listings Published Yet</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Be the first property owner to list rooms on NestFlow!
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 text-white border border-white/20 text-xs font-bold px-6 py-3.5 rounded-full transition shadow-md hover:scale-105"
          >
            Explore Complete Directory <ChevronRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>
      </section>

      {/* 4. DUAL ENGINE CAPABILITIES */}
      <section id="how-it-works" className="py-20 px-6 max-w-6xl mx-auto scroll-mt-20 border-t border-orange-200/40 dark:border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-rose-400 text-[10px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-widest">
            Architecture & Workflows
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight mt-4">
            Engineered for Both Sides of Co-Living
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-3 leading-relaxed">
            High-velocity management for landlords. Clean, frictionless living for residents.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLUMN 1: LANDLORD */}
          <div className="bg-white/60 dark:bg-black/35 border border-white/80 dark:border-white/10 rounded-3xl p-8 shadow-xl backdrop-blur-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-amber-500/10 text-amber-700 dark:text-purple-400 rounded-2xl border border-amber-500/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-purple-300 border border-amber-500/30 rounded-full tracking-wider">
                  Landlord Engine
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                  Operational Control System
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Total visibility over your inventory, bed occupancies, meal scheduling, and maintenance.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3.5 bg-white/70 dark:bg-white/[0.03] border border-orange-100/60 dark:border-white/5 p-4 rounded-2xl">
                  <div className="p-2 bg-amber-100 text-amber-700 dark:bg-purple-500/10 dark:text-purple-400 rounded-xl shrink-0 mt-0.5">
                    <DoorOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 dark:text-white">
                      Granular Room & Bed Matrix
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Configure Single, Double, or Triple sharing rooms. Set custom monthly rent per bed and track real-time occupancy.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 bg-white/70 dark:bg-white/[0.03] border border-orange-100/60 dark:border-white/5 p-4 rounded-2xl">
                  <div className="p-2 bg-orange-100 text-orange-700 dark:bg-amber-500/10 dark:text-amber-400 rounded-xl shrink-0 mt-0.5">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 dark:text-white">
                      3-Meal Weekly Mess Planner
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Publish Breakfast (8-10 AM), Lunch (12-1:30 PM), and Dinner (8-9:30 PM) menus synced live with residents.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 bg-white/70 dark:bg-white/[0.03] border border-orange-100/60 dark:border-white/5 p-4 rounded-2xl">
                  <div className="p-2 bg-sky-100 text-sky-700 dark:bg-blue-500/10 dark:text-blue-400 rounded-xl shrink-0 mt-0.5">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 dark:text-white">
                      Digital Lease Assignment
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Assign beds to residents via email. Issue digital leases and reclaim beds with a single click upon checkout.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 bg-white/70 dark:bg-white/[0.03] border border-orange-100/60 dark:border-white/5 p-4 rounded-2xl">
                  <div className="p-2 bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl shrink-0 mt-0.5">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 dark:text-white">
                      Maintenance Ticket Resolver
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Track repair tickets categorized by priority (`HIGH`, `MEDIUM`, `LOW`) and update resolution statuses in real time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-orange-100/60 dark:border-white/5">
              <Link
                href="/register"
                className="w-full bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold text-xs py-3.5 rounded-full transition flex items-center justify-center gap-2 shadow-sm"
              >
                Access Landlord Hub <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* COLUMN 2: TENANT */}
          <div className="bg-white/60 dark:bg-black/35 border border-white/80 dark:border-white/10 rounded-3xl p-8 shadow-xl backdrop-blur-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-sky-500/10 text-sky-700 dark:text-rose-400 rounded-2xl border border-sky-500/20">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase px-3 py-1 bg-sky-500/10 text-sky-700 dark:text-rose-300 border border-sky-500/30 rounded-full tracking-wider">
                  Resident Suite
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                  Living Experience Portal
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Search verified vacancies, monitor today’s meal schedule, and submit maintenance tickets instantly.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3.5 bg-white/70 dark:bg-white/[0.03] border border-orange-100/60 dark:border-white/5 p-4 rounded-2xl">
                  <div className="p-2 bg-sky-100 text-sky-700 dark:bg-blue-500/10 dark:text-blue-400 rounded-xl shrink-0 mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 dark:text-white">
                      City & Sharing Filters
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Filter rooms by City, Property Type, or Room Sharing capacity (1, 2, or 3 Sharing) with live vacancy counts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 bg-white/70 dark:bg-white/[0.03] border border-orange-100/60 dark:border-white/5 p-4 rounded-2xl">
                  <div className="p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-xl shrink-0 mt-0.5">
                    <Bed className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 dark:text-white">
                      Live Bed Inspection
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Inspect exact room layouts, real-time bed availability (`VACANT` vs `OCCUPIED`), and monthly rent breakdown.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 bg-white/70 dark:bg-white/[0.03] border border-orange-100/60 dark:border-white/5 p-4 rounded-2xl">
                  <div className="p-2 bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 rounded-xl shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 dark:text-white">
                      Live 3-Meal Daily Menu
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Check today's freshly prepared breakfast, lunch, and dinner directly on your resident dashboard.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 bg-white/70 dark:bg-white/[0.03] border border-orange-100/60 dark:border-white/5 p-4 rounded-2xl">
                  <div className="p-2 bg-orange-100 text-orange-700 dark:bg-purple-500/10 dark:text-purple-400 rounded-xl shrink-0 mt-0.5">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 dark:text-white">
                      1-Click Issue Resolution
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Submit maintenance requests with priority levels and monitor real-time repair status updates from your landlord.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-orange-100/60 dark:border-white/5">
              <Link
                href="/properties"
                className="w-full bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 text-white font-bold text-xs py-3.5 rounded-full transition flex items-center justify-center gap-2 shadow-md"
              >
                Browse Available Rooms <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section id="support" className="py-20 px-6 max-w-4xl mx-auto scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-emerald-400 text-[10px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-widest">
            Support Center
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight mt-3">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-2">
            Everything you need to know about setting up properties, beds, and mess menus.
          </p>
        </div>

        <div className="space-y-4 mb-16">
          {FAQS.map((faq, idx) => (
            <details
              key={idx}
              className="group bg-white/60 dark:bg-black/35 border border-white/80 dark:border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xs transition duration-200 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                <span className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-orange-500 dark:text-rose-500 shrink-0" />
                  {faq.q}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0 ml-2" />
              </summary>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-orange-100/50 dark:border-white/5 leading-relaxed font-normal">
                {faq.a}
              </p>
            </details>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 dark:bg-black/35 border border-white/80 dark:border-white/10 p-6 rounded-3xl text-center flex flex-col items-center justify-between space-y-3 backdrop-blur-xl shadow-sm">
            <div className="p-3 bg-sky-500/10 text-sky-700 dark:text-blue-400 rounded-2xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Landlord Support</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-normal">
                Get help setting up bed matrices or onboarding tenants.
              </p>
            </div>
            <a
              href="mailto:support@nestflow.com"
              className="text-xs font-bold text-orange-600 dark:text-rose-400 hover:underline"
            >
              support@nestflow.com
            </a>
          </div>

          <div className="bg-white/60 dark:bg-black/35 border border-white/80 dark:border-white/10 p-6 rounded-3xl text-center flex flex-col items-center justify-between space-y-3 backdrop-blur-xl shadow-sm">
            <div className="p-3 bg-amber-500/10 text-amber-700 dark:text-purple-400 rounded-2xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Resident Helpdesk</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-normal">
                Questions about active leases or maintenance tickets?
              </p>
            </div>
            <Link
              href="/dashboard/tenant"
              className="text-xs font-bold text-amber-700 dark:text-purple-400 hover:underline"
            >
              Go to Tenant Portal
            </Link>
          </div>

          <div className="bg-white/60 dark:bg-black/35 border border-white/80 dark:border-white/10 p-6 rounded-3xl text-center flex flex-col items-center justify-between space-y-3 backdrop-blur-xl shadow-sm">
            <div className="p-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-2xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">System Overview</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-normal">
                Explore documentation on bed configuration and meal scheduling.
              </p>
            </div>
            <Link
              href="/#how-it-works"
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              View Platform Guide
            </Link>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <div className="relative bg-white/60 dark:bg-black/40 text-slate-950 dark:text-white border border-white/80 dark:border-white/10 rounded-3xl p-10 sm:p-16 shadow-2xl backdrop-blur-2xl overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Ready to Modernize Your Co-Living Operations?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed font-medium">
              Join property managers and residents running on NestFlow.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 hover:opacity-90 text-white font-bold text-xs px-8 py-4 rounded-full shadow-lg transition"
              >
                Create Free Account
              </Link>
              <Link
                href="/properties"
                className="w-full sm:w-auto bg-slate-950 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 text-white font-bold text-xs px-8 py-4 rounded-full border border-white/20 transition"
              >
                Browse All Properties
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-orange-200/30 dark:border-white/5 py-12 px-6 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-full bg-gradient-to-tr from-orange-400 via-amber-400 to-sky-500 text-white shadow-sm">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-black text-slate-900 dark:text-white text-base tracking-tight">
              Nest<span className="text-orange-500">Flow</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All systems operational</span>
          </div>

          <div className="flex items-center gap-6 font-semibold text-slate-700 dark:text-slate-300">
            <Link href="/properties" className="hover:text-orange-500 transition">
              Properties
            </Link>
            <Link href="/#support" className="hover:text-orange-500 transition">
              Support
            </Link>
            <Link href="/login" className="hover:text-orange-500 transition">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-orange-500 transition">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}