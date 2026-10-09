"use client";

import { Download, Printer, FileSpreadsheet } from "lucide-react";

interface ReportExportButtonsProps {
  invoicesData: Array<{
    id: string;
    tenantName: string;
    propertyName: string;
    roomBed: string;
    rentAmount: number;
    utilityAmount: number;
    totalAmount: number;
    status: string;
    date: string;
  }>;
  tenantsData: Array<{
    tenantName: string;
    email: string;
    phone: string;
    propertyName: string;
    roomBed: string;
    rent: number;
    deposit: number;
    startDate: string;
    isSigned: boolean;
  }>;
  maintenanceData: Array<{
    id: string;
    title: string;
    propertyName: string;
    priority: string;
    status: string;
    assignedStaff: string;
    cost: number;
    date: string;
  }>;
}

export function ReportExportButtons({
  invoicesData,
  tenantsData,
  maintenanceData,
}: ReportExportButtonsProps) {
  // Helper to convert objects array to downloadable CSV
  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const val = row[header] ?? "";
            const escaped = String(val).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 print:hidden">
      {/* Export Invoices CSV */}
      <button
        type="button"
        onClick={() => downloadCSV(invoicesData, "financial_invoices_ledger")}
        className="text-xs font-bold bg-white/80 dark:bg-white/10 hover:bg-orange-500 hover:text-white dark:hover:bg-rose-500 text-slate-700 dark:text-slate-200 border border-orange-200/60 dark:border-white/15 px-3.5 py-2 rounded-2xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
      >
        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
        <span>Export Invoices CSV</span>
      </button>

      {/* Export Tenants CSV */}
      <button
        type="button"
        onClick={() => downloadCSV(tenantsData, "active_tenants_directory")}
        className="text-xs font-bold bg-white/80 dark:bg-white/10 hover:bg-orange-500 hover:text-white dark:hover:bg-rose-500 text-slate-700 dark:text-slate-200 border border-orange-200/60 dark:border-white/15 px-3.5 py-2 rounded-2xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
      >
        <Download className="w-3.5 h-3.5 text-sky-500" />
        <span>Export Tenants CSV</span>
      </button>

      {/* Export Maintenance Expenses CSV */}
      <button
        type="button"
        onClick={() => downloadCSV(maintenanceData, "maintenance_expense_sheet")}
        className="text-xs font-bold bg-white/80 dark:bg-white/10 hover:bg-orange-500 hover:text-white dark:hover:bg-rose-500 text-slate-700 dark:text-slate-200 border border-orange-200/60 dark:border-white/15 px-3.5 py-2 rounded-2xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
      >
        <FileSpreadsheet className="w-3.5 h-3.5 text-purple-500" />
        <span>Export Expenses CSV</span>
      </button>

      {/* Print PDF Sheet */}
      <button
        type="button"
        onClick={() => window.print()}
        className="text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 text-white px-3.5 py-2 rounded-2xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
      >
        <Printer className="w-3.5 h-3.5 text-orange-400" />
        <span>Print / Save PDF</span>
      </button>
    </div>
  );
}