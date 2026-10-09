"use client";

import { useState } from "react";
import { submitMoveOutNoticeAction } from "@/app/dashboard/landlord/operations/vacate-actions";
import { LogOut, AlertTriangle, Send } from "lucide-react";

export default function VacateNoticeCard({ leaseId }: { leaseId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-6 rounded-[32px] bg-white/70 dark:bg-white/[0.04] backdrop-blur-2xl border border-rose-200/60 dark:border-white/10 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/50">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-950 dark:text-white">
              Notice to Vacate
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Formal 30-day residency move-out procedure
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 font-bold text-xs transition cursor-pointer"
        >
          {isOpen ? "Cancel" : "Initiate Checkout"}
        </button>
      </div>

      {isOpen && (
        <form action={submitMoveOutNoticeAction} className="pt-2 space-y-3">
          <input type="hidden" name="leaseId" value={leaseId} />
          
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-200/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Submitting notice notifies property management to schedule your checkout inspection and calculate deposit returns.
            </span>
          </div>

          <textarea
            name="reason"
            rows={2}
            required
            placeholder="Reason for checkout (e.g. End of semester, job change, relocation)..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-3 text-xs outline-none focus:border-rose-500 transition"
          />

          <button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 rounded-2xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Formal 30-Day Notice</span>
          </button>
        </form>
      )}
    </div>
  );
}