import { finalizeMoveOutAction } from "./vacate-actions";
import { CheckCircle2, User, Bed, Calendar } from "lucide-react";

interface CheckoutDeskProps {
  leases: Array<{
    id: string;
    startDate: Date;
    tenant: { fullName: string | null; email: string };
    bed: { bedNumber: string } | null;
    room: { roomNumber: string } | null;
  }>;
}

export default function CheckoutDesk({ leases }: CheckoutDeskProps) {
  if (leases.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-base font-black text-slate-950 dark:text-white">
        Checkout & Bed Release Desk
      </h2>

      <div className="space-y-3">
        {leases.map((lease) => (
          <div
            key={lease.id}
            className="p-5 rounded-3xl bg-white/70 dark:bg-white/[0.04] backdrop-blur-2xl border border-orange-200/60 dark:border-white/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-black text-slate-950 dark:text-white">
                  {lease.tenant.fullName || lease.tenant.email}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 font-semibold">
                <span className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5" />
                  Room {lease.room?.roomNumber || "1"} · Bed {lease.bed?.bedNumber || "Entire"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Since {new Date(lease.startDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <form action={finalizeMoveOutAction}>
              <input type="hidden" name="leaseId" value={lease.id} />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white/10 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Complete Checkout & Release Bed</span>
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}