import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  ShieldAlert,
  Building2,
  Users,
  IndianRupee,
  CheckCircle2,
  FileCheck2,
  Bed,
  Layers,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

export default async function SuperAdminDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const admin = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!admin || admin.role !== "ADMIN") {
    redirect("/dashboard/landlord");
  }

  const [properties, users, payments] = await Promise.all([
    db.property.findMany({
      include: {
        landlord: true,
        rooms: { include: { beds: true } },
      },
    }),
    db.user.findMany(),
    db.payment.findMany({ where: { status: "PAID" } }),
  ]);

  const totalGTV = payments.reduce((acc, p) => acc + p.totalAmount, 0);
  const pendingProperties = properties.filter((p) => !p.isVerified);
  const pendingKycUsers = users.filter((u) => u.kycStatus === "PENDING" || (!u.isVerified && u.kycDocumentUrl));

  let totalBedsPlatform = 0;
  let occupiedBedsPlatform = 0;

  properties.forEach((p) => {
  p.rooms.forEach((r) => {
    totalBedsPlatform += r.beds.length;
    r.beds.forEach((b) => {
      if (b.status === "OCCUPIED") occupiedBedsPlatform++;
    });
  });
});

  const platformOccupancyRate =
    totalBedsPlatform > 0 ? Math.round((occupiedBedsPlatform / totalBedsPlatform) * 100) : 0;

  const adminModules = [
    {
      title: "KYC Verification Queue",
      desc: "Review uploaded Aadhaar/Student ID proofs, verify user identities, and approve accounts.",
      href: "/dashboard/admin/kyc",
      badge: pendingKycUsers.length > 0 ? `${pendingKycUsers.length} Action Required` : "Queue Clear",
      badgeColor: pendingKycUsers.length > 0 ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-300" : "bg-slate-100 text-slate-500",
      icon: FileCheck2,
      accent: "from-rose-500/20 to-pink-500/20 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-500/20",
    },
    {
      title: "Property Quality Moderation",
      desc: "Inspect landlord PG listings, verify photo authentications, and approve public catalog items.",
      href: "/dashboard/admin/properties",
      badge: pendingProperties.length > 0 ? `${pendingProperties.length} Under Review` : "All Verified",
      badgeColor: pendingProperties.length > 0 ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300" : "bg-slate-100 text-slate-500",
      icon: Building2,
      accent: "from-amber-500/20 to-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-200/60 dark:border-orange-500/20",
    },
    {
      title: "Platform User Registry & Roles",
      desc: "Audit registered accounts, assign Landlord or Super Admin roles, and inspect verification records.",
      href: "/dashboard/admin/users",
      badge: `${users.length} Users`,
      badgeColor: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-300",
      icon: Users,
      accent: "from-sky-500/20 to-blue-500/20 text-sky-600 dark:text-sky-400 border-sky-200/60 dark:border-sky-500/20",
    },
  ];

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-28 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[750px] h-[750px] bg-gradient-to-tr from-rose-500/20 via-purple-600/15 to-indigo-600/20 rounded-full blur-[180px] pointer-events-none -z-0" />

      <main className="max-w-6xl mx-auto relative z-10 space-y-8">
        <div className="relative rounded-[40px] sm:rounded-[48px] bg-white/70 dark:bg-white/[0.04] backdrop-blur-3xl border border-rose-200/60 dark:border-white/15 p-6 sm:p-10 shadow-[0_30px_90px_-20px_rgba(244,63,94,0.12),0_15px_35px_-10px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,0.95)] space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-rose-100 dark:border-white/[0.08] pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="p-2.5 rounded-full bg-white/80 dark:bg-white/10 border border-rose-200/60 dark:border-white/20 text-slate-700 dark:text-slate-200 shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-200/60 text-rose-700 dark:text-rose-400 text-[11px] font-black uppercase tracking-wider">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Platform Administration</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight pt-1">
                Super Admin Executive Portal
              </h1>
            </div>

            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Real-Time Audit Engine</span>
            </div>
          </div>

          {/* Telemetry Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-[26px] bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-100 block">Gross Merchandise Value</span>
                <span className="text-2xl font-black">{formatCurrency(totalGTV)}</span>
              </div>
              <IndianRupee className="w-6 h-6 opacity-80" />
            </div>

            <div className="p-5 rounded-[26px] bg-gradient-to-r from-teal-500 via-emerald-500 to-sky-500 text-white shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 block">Platform Occupancy</span>
                <span className="text-2xl font-black">{platformOccupancyRate}%</span>
              </div>
              <Bed className="w-6 h-6 opacity-80" />
            </div>

            <div className="p-5 rounded-[26px] bg-white/80 dark:bg-white/[0.05] border border-rose-200/60 dark:border-white/10 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Platform Properties</span>
                <span className="text-2xl font-black text-slate-950 dark:text-white">{properties.length} Listings</span>
              </div>
              <Building2 className="w-6 h-6 text-orange-500" />
            </div>
          </div>

          {/* Operations Dedicated Cards */}
          <div className="space-y-4 pt-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Administrative Control Centers
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {adminModules.map((m, idx) => {
                const Icon = m.icon;
                return (
                  <Link
                    key={idx}
                    href={m.href}
                    className="group relative overflow-hidden bg-white/70 dark:bg-white/[0.04] border border-rose-200/60 dark:border-white/15 backdrop-blur-2xl rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-6"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-2xl border ${m.accent}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${m.badgeColor}`}>
                          {m.badge}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-black text-slate-950 dark:text-white group-hover:text-rose-600 transition">
                          {m.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5 leading-relaxed">
                          {m.desc}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-rose-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-rose-600 transition">
                      <span>Open Module</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}