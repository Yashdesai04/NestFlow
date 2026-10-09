import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { ReportExportButtons } from "@/components/ReportExportButtons";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Receipt,
  IndianRupee,
  Building2,
  Users,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Clock,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";

export default async function LandlordReportsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      properties: {
        include: {
          rooms: {
            include: { beds: true },
          },
          leases: {
            include: {
              tenant: true,
              room: true,
              bed: true,
            },
          },
          maintenance: true,
        },
      },
    },
  });

  if (!landlord || landlord.role !== "LANDLORD") {
    redirect("/onboarding");
  }

  // 1. Fetch all Invoices & Payments for landlord properties
  const payments = await db.payment.findMany({
    where: {
      lease: { property: { landlordId: landlord.id } },
    },
    include: {
      tenant: true,
      lease: {
        include: {
          property: true,
          room: true,
          bed: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch all Maintenance Tickets
  const tickets = await db.maintenanceTicket.findMany({
    where: {
      property: { landlordId: landlord.id },
    },
    include: {
      property: true,
      tenant: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // --- FINANCIAL CALCULATIONS ---
  const paidPayments = payments.filter((p) => p.status === "PAID");
  const pendingPayments = payments.filter((p) => p.status === "PENDING");

  const totalInvoicedAmount = payments.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalCollectedRevenue = paidPayments.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalPendingDues = pendingPayments.reduce((acc, p) => acc + p.totalAmount, 0);

  // Total Maintenance Expenses (sum of estimated/actual repair costs)
  const totalMaintenanceCost = tickets.reduce((acc, t) => acc + (t.estimatedCost || 0), 0);

  // Net Operating Income (NOI) = Total Collected - Total Maintenance Expenses
  const netOperatingIncome = totalCollectedRevenue - totalMaintenanceCost;

  // Collection Efficiency Rate
  const collectionEfficiency =
    totalInvoicedAmount > 0
      ? Math.round((totalCollectedRevenue / totalInvoicedAmount) * 100)
      : 100;

  // --- OCCUPANCY CALCULATIONS ---
  let totalBeds = 0;
  let occupiedBeds = 0;

  landlord.properties.forEach((p) => {
    p.rooms.forEach((r) => {
      totalBeds += r.beds.length;
      r.beds.forEach((b) => {
        if (b.status === "OCCUPIED") occupiedBeds++;
      });
    });
  });

  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // --- MONTHLY AGGREGATIONS (Past 6 Months) ---
  const monthlyRevenueMap: Record<string, { collected: number; invoiced: number }> = {};

  payments.forEach((p) => {
    const monthKey = new Date(p.createdAt).toLocaleString("en-US", {
      month: "short",
      year: "2-digit",
    });

    if (!monthlyRevenueMap[monthKey]) {
      monthlyRevenueMap[monthKey] = { collected: 0, invoiced: 0 };
    }

    monthlyRevenueMap[monthKey].invoiced += p.totalAmount;
    if (p.status === "PAID") {
      monthlyRevenueMap[monthKey].collected += p.totalAmount;
    }
  });

  const monthlyEntries = Object.entries(monthlyRevenueMap).slice(0, 6).reverse();

  // --- SERIALIZATION FOR CSV EXPORT ---
  const exportInvoices = payments.map((p) => ({
    id: p.id,
    tenantName: p.tenant.fullName || p.tenant.email,
    propertyName: p.lease.property.title,
    roomBed: `Room ${p.lease.room?.roomNumber || "-"} Bed ${p.lease.bed?.bedNumber || "-"}`,
    rentAmount: p.rentAmount,
    utilityAmount: p.utilityAmount,
    totalAmount: p.totalAmount,
    status: p.status,
    date: new Date(p.createdAt).toLocaleDateString(),
  }));

  const exportTenants = landlord.properties.flatMap((p) =>
    p.leases
      .filter((l) => l.status === "ACTIVE")
      .map((l) => ({
        tenantName: l.tenant.fullName || "Resident",
        email: l.tenant.email,
        phone: l.tenant.phone || "N/A",
        propertyName: p.title,
        roomBed: `Room ${l.room?.roomNumber || "-"} Bed ${l.bed?.bedNumber || "-"}`,
        rent: l.rentAmount,
        deposit: l.depositAmount,
        startDate: new Date(l.startDate).toLocaleDateString(),
        isSigned: l.isSigned,
      }))
  );

  const exportMaintenance = tickets.map((t) => ({
    id: t.id,
    title: t.title,
    propertyName: t.property.title,
    priority: t.priority,
    status: t.status,
    assignedStaff: t.assignedStaff || "Unassigned",
    cost: t.estimatedCost || 0,
    date: new Date(t.createdAt).toLocaleDateString(),
  }));

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0 print:hidden" />

      <main className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Navigation & Action Header */}
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 print:border-none print:shadow-none">
          <div className="space-y-2">
            <div className="flex items-center gap-3 print:hidden">
              <Link
                href="/dashboard/landlord/operations"
                className="p-2.5 rounded-2xl bg-white/80 dark:bg-white/10 border border-orange-200/60 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-rose-400 transition shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-200/60 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Executive Reports & P&L</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Financial Analytics & Insights
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-xl">
              Consolidated revenue cash flow, operational maintenance expenses, and downloadable financial statements.
            </p>
          </div>

          {/* Export Actions Component */}
          <ReportExportButtons
            invoicesData={exportInvoices}
            tenantsData={exportTenants}
            maintenanceData={exportMaintenance}
          />
        </div>

        {/* High-Level P&L Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Gross Collected Revenue */}
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Gross Collected
              </span>
              <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200/50">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
              {formatCurrency(totalCollectedRevenue)}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{collectionEfficiency}% Collection Rate</span>
            </p>
          </div>

          {/* Card 2: Net Operating Income (NOI) */}
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Net Operating Income
              </span>
              <div className="p-2.5 bg-sky-500/10 dark:bg-sky-400/15 text-sky-600 dark:text-sky-400 rounded-2xl border border-sky-200/50">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 tracking-tight">
              {formatCurrency(netOperatingIncome)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              After ₹{totalMaintenanceCost} repair costs
            </p>
          </div>

          {/* Card 3: Pending Receivables */}
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Unpaid Receivables
              </span>
              <div className="p-2.5 bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-200/50">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {formatCurrency(totalPendingDues)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              {pendingPayments.length} pending tenant invoice(s)
            </p>
          </div>

          {/* Card 4: Inventory Utilization */}
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Occupancy Efficiency
              </span>
              <div className="p-2.5 bg-purple-500/10 dark:bg-purple-400/15 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-200/50">
                <PieChart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
              {occupancyRate}%
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              {occupiedBeds} occupied / {totalBeds} total beds
            </p>
          </div>
        </div>

        {/* Monthly Inflow Chart Breakdown */}
        {monthlyEntries.length > 0 && (
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-950 dark:text-white tracking-tight">
                  Monthly Cash Flow Trends
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Comparison between total invoiced amounts and actual collected funds
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-500" />
                <span>Past {monthlyEntries.length} Billing Cycles</span>
              </span>
            </div>

            <div className="space-y-4">
              {monthlyEntries.map(([month, data]) => {
                const maxVal = Math.max(...monthlyEntries.map(([, d]) => d.invoiced), 1);
                const invoicedWidth = Math.round((data.invoiced / maxVal) * 100);
                const collectedWidth = Math.round((data.collected / maxVal) * 100);

                return (
                  <div key={month} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900 dark:text-white">{month}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-[11px]">
                          Invoiced: {formatCurrency(data.invoiced)}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Collected: {formatCurrency(data.collected)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Visual Bar */}
                    <div className="w-full h-3.5 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-slate-300 dark:bg-white/20 rounded-full absolute top-0 left-0"
                        style={{ width: `${invoicedWidth}%` }}
                      />
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full absolute top-0 left-0"
                        style={{ width: `${collectedWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Property Performance Table */}
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-base font-black text-slate-950 dark:text-white tracking-tight">
            Property Performance Matrix ({landlord.properties.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-orange-100 dark:border-white/10 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th className="pb-3">Property Listing</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3 text-center">Bed Occupancy</th>
                  <th className="pb-3 text-right">Monthly Rent Yield</th>
                  <th className="pb-3 text-right">Active Leases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100/60 dark:divide-white/5 font-medium">
                {landlord.properties.map((p) => {
                  let pTotalBeds = 0;
                  let pOccupiedBeds = 0;
                  let pRentYield = 0;

                  p.rooms.forEach((r) => {
                    pTotalBeds += r.beds.length;
                    r.beds.forEach((b) => {
                      if (b.status === "OCCUPIED") pOccupiedBeds++;
                    });
                  });

                  p.leases
                    .filter((l) => l.status === "ACTIVE")
                    .forEach((l) => {
                      pRentYield += l.rentAmount || 0;
                    });

                  const pOccupancy =
                    pTotalBeds > 0 ? Math.round((pOccupiedBeds / pTotalBeds) * 100) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                      <td className="py-3.5 pr-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                          <span>{p.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-normal ml-5">
                          {p.city}, {p.state}
                        </span>
                      </td>

                      <td className="py-3.5 pr-4 text-slate-600 dark:text-slate-400">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 uppercase">
                          {p.propertyType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {pOccupiedBeds}/{pTotalBeds}
                        </span>
                        <span className="text-[10px] text-slate-500 block">({pOccupancy}%)</span>
                      </td>

                      <td className="py-3.5 pl-4 text-right font-black text-slate-950 dark:text-white">
                        {formatCurrency(pRentYield)}
                      </td>

                      <td className="py-3.5 pl-4 text-right">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          {p.leases.filter((l) => l.status === "ACTIVE").length} Signed
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}