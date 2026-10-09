"use client";

import { useState } from "react";
import { vacateResidentAction } from "./actions";
import { UserMinus, Loader2, AlertTriangle, X } from "lucide-react";

interface VacateButtonProps {
  leaseId: string;
  tenantName: string;
  roomNumber?: string | null;
  bedNumber?: string | null;
}

export default function VacateButton({
  leaseId,
  tenantName,
  roomNumber,
  bedNumber,
}: VacateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVacate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("leaseId", leaseId);

    try {
      await vacateResidentAction(formData);
      setIsOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to offboard resident.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
      >
        <UserMinus className="w-3.5 h-3.5" />
        <span>Vacate Resident</span>
      </button>

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-[32px] bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-500/20 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <div className="p-2 rounded-xl bg-rose-500/10">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-black text-base text-slate-950 dark:text-white">
                  Confirm Resident Offboarding
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Are you sure you want to offboard <strong>{tenantName}</strong>?
              This will mark their lease agreement as <strong>TERMINATED</strong> and
              immediately set{" "}
              <strong>
                {roomNumber ? `Room ${roomNumber}` : ""}
                {bedNumber ? ` · Bed ${bedNumber}` : " their bed"}
              </strong>{" "}
              to <strong>VACANT</strong> for new bookings.
            </p>

            <form onSubmit={handleVacate} className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-white/20 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>Confirm Vacate</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}