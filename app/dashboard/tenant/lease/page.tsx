import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { LeaseSignaturePad } from "@/components/LeaseSignaturePad";
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  Building2,
  User,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Printer,
  FileDown,
  Clock,
  Sparkles,
} from "lucide-react";

export default async function TenantLeaseAgreementPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      leases: {
        where: { status: "ACTIVE" },
        include: {
          property: {
            include: { landlord: true },
          },
          room: true,
          bed: true,
        },
        orderBy: { startDate: "desc" },
      },
    },
  });

  if (!user) redirect("/onboarding");

  const activeLease = user.leases[0];

  if (!activeLease || !activeLease.property) {
    return (
      <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden flex items-center justify-center">
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-4">
          <FileText className="w-10 h-10 text-orange-500 dark:text-rose-400 mx-auto" />
          <h2 className="text-lg font-black">No Active Lease Found</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            You do not currently have an assigned property lease agreement.
          </p>
          <Link
            href="/properties"
            className="bg-gradient-to-r from-orange-400 to-sky-500 text-white text-xs font-bold px-6 py-2.5 rounded-full inline-block"
          >
            Explore Properties
          </Link>
        </div>
      </div>
    );
  }

  const { property, room, bed, landlord } = {
    property: activeLease.property,
    room: activeLease.room,
    bed: activeLease.bed,
    landlord: activeLease.property.landlord,
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Theme Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0 print:hidden" />

      <main className="max-w-4xl mx-auto relative z-10 space-y-8">
        
        {/* Navigation & Header Card */}
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 print:hidden">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/tenant"
                className="p-2.5 rounded-2xl bg-white/80 dark:bg-white/10 border border-orange-200/60 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-rose-400 transition shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-200/60 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Digital E-Signature Document</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Residential Lease Agreement
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Official binding rental contract between Property Owner and Resident.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            <span
              className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border flex items-center gap-2 ${
                activeLease.isSigned
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-500/30"
              }`}
            >
              {activeLease.isSigned ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              <span>{activeLease.isSigned ? "Counter-Signed & Active" : "Pending Tenant Signature"}</span>
            </span>
          </div>
        </div>

        {/* Official Legal Lease Document Sheet */}
        <div className="bg-white dark:bg-slate-950/90 border border-orange-200/80 dark:border-white/10 rounded-3xl p-8 sm:p-12 shadow-md dark:shadow-2xl space-y-8 print:p-0 print:border-none print:shadow-none">
          
          {/* Header Banner */}
          <div className="border-b border-slate-200 dark:border-white/10 pb-6 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase text-orange-600 dark:text-rose-400">
                NestFlow Property Network
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white mt-1">
                Standard PG & Residential Lease Agreement
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Lease ID: <span className="font-mono">{activeLease.id}</span>
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <span className="block font-bold">Generated:</span>
              <span>{new Date(activeLease.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>

          {/* Parties Involved */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/10 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                1. Property Owner / Landlord
              </span>
              <h4 className="font-black text-sm text-slate-950 dark:text-white">
                {landlord?.fullName || "Property Manager"}
              </h4>
              <p className="text-slate-600 dark:text-slate-400">{landlord?.email}</p>
              {landlord?.phone && <p className="text-slate-600 dark:text-slate-400">{landlord.phone}</p>}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/10 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                2. Resident / Tenant
              </span>
              <h4 className="font-black text-sm text-slate-950 dark:text-white">
                {user.fullName || "Resident"}
              </h4>
              <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
              {user.phone && <p className="text-slate-600 dark:text-slate-400">{user.phone}</p>}
            </div>
          </div>

          {/* Property & Accommodation Breakdown */}
          <div className="space-y-3 text-xs">
            <h3 className="font-black text-sm text-slate-950 dark:text-white uppercase tracking-wider text-[11px]">
              3. Premises & Allotment
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-slate-400 uppercase text-[9px] font-bold block">Property</span>
                <span className="font-bold text-slate-900 dark:text-white">{property.title}</span>
                <p className="text-slate-500 text-[11px] mt-0.5">{property.address}, {property.city}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[9px] font-bold block">Allocated Room</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {room ? `Room ${room.roomNumber} (${room.roomType || "Standard"})` : "Standard Unit"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[9px] font-bold block">Bed Space</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {bed ? `Bed ${bed.bedNumber}` : "Single Occupancy"}
                </span>
              </div>
            </div>
          </div>

          {/* Financials & Duration */}
          <div className="space-y-3 text-xs">
            <h3 className="font-black text-sm text-slate-950 dark:text-white uppercase tracking-wider text-[11px]">
              4. Financial Terms & Schedule
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200/70 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03]">
                <span className="text-slate-400 font-black text-[9px] uppercase block">Monthly Base Rent</span>
                <span className="font-black text-base text-slate-950 dark:text-white mt-0.5 block">
                  {formatCurrency(activeLease.rentAmount)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200/70 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03]">
                <span className="text-slate-400 font-black text-[9px] uppercase block">Security Deposit</span>
                <span className="font-black text-base text-slate-950 dark:text-white mt-0.5 block">
                  {formatCurrency(activeLease.depositAmount)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200/70 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03]">
                <span className="text-slate-400 font-black text-[9px] uppercase block">Due Schedule</span>
                <span className="font-black text-base text-slate-950 dark:text-white mt-0.5 block">
                  1st of Each Month
                </span>
              </div>
            </div>
          </div>

          {/* Standard Guidelines & Rules */}
          <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <h3 className="font-black text-sm text-slate-950 dark:text-white uppercase tracking-wider text-[11px]">
              5. House Rules & Resident Code of Conduct
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-[11px]">
              <li><strong>Rent Payment:</strong> Rent invoices are generated monthly and payable within the designated grace period.</li>
              <li><strong>Quiet Hours:</strong> Respect communal living guidelines between 10:00 PM and 06:00 AM.</li>
              <li><strong>Visitor Entry:</strong> All external guests must be pre-registered via a valid digital visitor pass[cite: 1].</li>
              <li><strong>Notice Period:</strong> Standard 30-day notice is required prior to lease termination.</li>
            </ul>
          </div>

          {/* Signature Verification Block */}
          <div className="border-t border-slate-200 dark:border-white/10 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-white/20">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">
                Authorized Landlord Signatory
              </span>
              <div className="h-14 flex items-end">
                <span className="font-serif italic text-lg text-slate-800 dark:text-slate-200">
                  {landlord?.fullName || "NestFlow Properties"}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-2 border-t pt-1">
                Verified Platform Owner Signature
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-white/20">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">
                Resident Digital Signature[cite: 1]
              </span>
              {activeLease.isSigned && activeLease.tenantSignature ? (
                <div>
                  <img
                    src={activeLease.tenantSignature}
                    alt="Resident Signature"
                    className="h-14 object-contain max-w-[200px]"
                  />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-2 border-t pt-1">
                    Digitally signed on {activeLease.signedAt ? new Date(activeLease.signedAt).toLocaleDateString() : "Active"}[cite: 1]
                  </span>
                </div>
              ) : (
                <div className="h-14 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                  Awaiting Digital Counter-Signature[cite: 1]
                </div>
              )}
            </div>
          </div>
        </div>

        {/* E-Signature Pad Component (Visible if Unsigned) */}
        {!activeLease.isSigned && (
          <LeaseSignaturePad
            leaseId={activeLease.id}
            tenantName={user.fullName || "Resident"}
          />
        )}
      </main>
    </div>
  );
}