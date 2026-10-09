"use client";

import { useEffect } from "react";
import { Printer, Download } from "lucide-react";

export default function PrintTrigger() {
  useEffect(() => {
    // If the URL has ?auto=true, automatically open the print dialog
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("auto") === "true") {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, []);

  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
    >
      <Printer className="w-3.5 h-3.5" />
      <span>Print / Save as PDF</span>
    </button>
  );
}