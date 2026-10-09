"use client";

import { useActionState, useState } from "react";
import { schedulePropertyTour, ScheduleTourState } from "@/app/properties/[id]/tour-actions";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CalendarCheck,
  Timer,
  Sparkles,
} from "lucide-react";

interface ScheduleTourCardProps {
  propertyId: string;
  propertyTitle: string;
}

const PRESET_TIME_SLOTS = [
  { id: "morning", label: "10:00 AM - 11:30 AM", period: "Morning" },
  { id: "afternoon", label: "02:00 PM - 03:30 PM", period: "Afternoon" },
  { id: "evening", label: "05:00 PM - 06:30 PM", period: "Evening" },
];

export function ScheduleTourCard({ propertyId, propertyTitle }: ScheduleTourCardProps) {
  const initialState: ScheduleTourState = {};
  const [state, formAction, isPending] = useActionState(schedulePropertyTour, initialState);

  // Time selection mode: 'preset' or 'custom'
  const [timeMode, setTimeMode] = useState<"preset" | "custom">("preset");
  const [selectedPreset, setSelectedPreset] = useState(PRESET_TIME_SLOTS[0].label);
  const [customTime, setCustomTime] = useState("11:00");

  // Helper to format 24hr time string to 12hr AM/PM format
  const formatCustomTime = (timeStr: string) => {
    if (!timeStr) return "Custom Time";
    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const adjustedHours = hours % 12 || 12;
    return `${adjustedHours}:${minutes < 10 ? `0${minutes}` : minutes} ${period} (Custom)`;
  };

  const effectiveTimeSlot =
    timeMode === "preset"
      ? selectedPreset
      : formatCustomTime(customTime);

  // Min date set to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split("T")[0];

  return (
    <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-2xl space-y-5">
      <div className="flex items-center justify-between border-b border-orange-100 dark:border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-orange-500/10 dark:bg-rose-500/15 text-orange-600 dark:text-rose-400 rounded-2xl border border-orange-200/50 dark:border-rose-500/20">
            <CalendarCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-950 dark:text-white tracking-tight">
              Schedule a Property Visit
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Free guided in-person tour
            </p>
          </div>
        </div>
      </div>

      {state.success ? (
        <div className="bg-emerald-500/[0.08] dark:bg-emerald-400/[0.08] border border-emerald-200/80 dark:border-emerald-400/20 rounded-2xl p-6 text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="font-black text-slate-950 dark:text-white text-sm">
            Tour Request Submitted!
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            {state.message}
          </p>
        </div>
      ) : (
        <form action={formAction} className="space-y-4 text-xs">
          <input type="hidden" name="propertyId" value={propertyId} />
          <input type="hidden" name="timeSlot" value={effectiveTimeSlot} />

          {state.error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
              <span>Preferred Date *</span>
            </label>
            <input
              type="date"
              name="tourDate"
              required
              min={minDateStr}
              defaultValue={minDateStr}
              className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-orange-500 dark:focus:border-rose-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-rose-500/20 transition font-medium cursor-pointer [color-scheme:light_dark]"
            />
          </div>

          {/* Preferred Time: Preset vs Custom Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                <span>Preferred Time *</span>
              </label>

              {/* Mode Toggle Switch */}
              <div className="flex items-center bg-white/60 dark:bg-white/[0.05] border border-orange-100/80 dark:border-white/10 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => setTimeMode("preset")}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    timeMode === "preset"
                      ? "bg-gradient-to-r from-orange-400 to-amber-400 dark:from-rose-500 dark:to-purple-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Preset Slots
                </button>
                <button
                  type="button"
                  onClick={() => setTimeMode("custom")}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    timeMode === "custom"
                      ? "bg-gradient-to-r from-orange-400 to-amber-400 dark:from-rose-500 dark:to-purple-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Custom Time
                </button>
              </div>
            </div>

            {/* SECTION 1: Preset Slots */}
            {timeMode === "preset" && (
              <div className="grid grid-cols-1 gap-2 pt-0.5">
                {PRESET_TIME_SLOTS.map((slot) => {
                  const isSelected = selectedPreset === slot.label;
                  return (
                    <button
                      type="button"
                      key={slot.id}
                      onClick={() => setSelectedPreset(slot.label)}
                      className={`text-left px-3.5 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-orange-500/[0.08] dark:bg-rose-500/[0.1] border-orange-500 dark:border-rose-500 text-slate-950 dark:text-white"
                          : "bg-white/60 dark:bg-white/[0.03] border-orange-100/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-orange-300 dark:hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                          {slot.period}
                        </span>
                        <span>{slot.label}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* SECTION 2: Custom Time Picker */}
            {timeMode === "custom" && (
              <div className="bg-white/60 dark:bg-white/[0.03] border border-orange-100/80 dark:border-white/10 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs font-bold">
                  <Timer className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                  <span>Choose Your Preferred Arrival Time:</span>
                </div>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full bg-white/90 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 dark:focus:border-rose-500 transition [color-scheme:light_dark] cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Selected window: <span className="font-bold text-orange-600 dark:text-rose-400">{formatCustomTime(customTime)}</span>
                </p>
              </div>
            )}
          </div>

          {/* Visitor Full Name */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
              <span>Full Name *</span>
            </label>
            <input
              type="text"
              name="guestName"
              required
              placeholder="e.g. John Doe"
              className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:border-orange-500 dark:focus:border-rose-500 font-medium"
            />
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                <span>Email *</span>
              </label>
              <input
                type="email"
                name="guestEmail"
                required
                placeholder="name@example.com"
                className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:border-orange-500 dark:focus:border-rose-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                <span>Phone *</span>
              </label>
              <input
                type="tel"
                name="guestPhone"
                required
                placeholder="+91 98765 43210"
                className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:border-orange-500 dark:focus:border-rose-500 font-medium"
              />
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
              <span>Specific Questions or Requests</span>
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="e.g. Inquiring for single occupancy room; visiting with a friend."
              className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:border-orange-500 dark:focus:border-rose-500 font-medium resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold text-xs py-3 rounded-2xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Confirming Appointment...</span>
              </>
            ) : (
              <>
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Book In-Person Tour</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}