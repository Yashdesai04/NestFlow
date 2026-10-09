"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileCheck2,
  FileText,
  Receipt,
  Utensils,
  QrCode,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface TenantRotaryHubProps {
  user: {
    fullName: string | null;
    kycStatus: string;
  };
  lease: {
    isSigned: boolean;
    rentAmount: number | null;
    room?: { roomNumber: string; roomType: string } | null;
    bed?: { bedNumber: string; priceMonthly: number | null } | null;
  } | null;
  activeTicketsCount: number;
}

export default function TenantRotaryHub({
  user,
  lease,
  activeTicketsCount,
}: TenantRotaryHubProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions = [
    {
      id: "kyc",
      title: "KYC Verify",
      subtitle: user.kycStatus === "APPROVED" ? "Identity Verified" : "Verification Required",
      metric: user.kycStatus,
      metricColor:
        user.kycStatus === "APPROVED"
          ? "text-emerald-500 dark:text-emerald-400"
          : "text-amber-500 dark:text-amber-400",
      href: "/dashboard/tenant/kyc",
      icon: ShieldCheck,
      angle: -90, // 12 o'clock
      accent: "from-rose-500 to-pink-600",
      ringColor: "border-rose-500",
      shadow: "shadow-rose-500/30",
    },
    {
      id: "applications",
      title: "Applications",
      subtitle: "Booking pipeline",
      metric: "Active Tracking",
      metricColor: "text-emerald-500 dark:text-emerald-400",
      href: "/dashboard/tenant/applications",
      icon: FileCheck2,
      angle: -30, // 2 o'clock
      accent: "from-emerald-500 to-teal-600",
      ringColor: "border-emerald-500",
      shadow: "shadow-emerald-500/30",
    },
    {
      id: "lease",
      title: "Lease Contract",
      subtitle: lease?.isSigned ? "Countersigned" : "Pending Signature",
      metric: lease ? (lease.isSigned ? "Active Legal" : "Action Required") : "No Lease",
      metricColor: lease?.isSigned
        ? "text-emerald-500 dark:text-emerald-400"
        : "text-amber-500 dark:text-amber-400",
      href: "/dashboard/tenant/lease",
      icon: FileText,
      angle: 30, // 4 o'clock
      accent: "from-orange-500 to-amber-600",
      ringColor: "border-orange-500",
      shadow: "shadow-orange-500/30",
    },
    {
      id: "payments",
      title: "Pay Rent",
      subtitle: "Monthly billing cycle",
      metric: lease ? `₹${lease.rentAmount || lease.bed?.priceMonthly || 0}` : "₹0 Due",
      metricColor: "text-cyan-500 dark:text-cyan-400",
      href: "/dashboard/tenant/payments",
      icon: Receipt,
      angle: 90, // 6 o'clock
      accent: "from-cyan-500 to-sky-600",
      ringColor: "border-cyan-500",
      shadow: "shadow-cyan-500/30",
    },
    {
      id: "meals",
      title: "Mess Opt-Out",
      subtitle: "Daily cutoff toggles",
      metric: "Menu Configured",
      metricColor: "text-amber-500 dark:text-amber-400",
      href: "/dashboard/tenant/meals",
      icon: Utensils,
      angle: 150, // 8 o'clock
      accent: "from-amber-500 to-yellow-600",
      ringColor: "border-amber-500",
      shadow: "shadow-amber-500/30",
    },
    {
      id: "gatepass",
      title: "Visitor Pass",
      subtitle: "QR security check",
      metric: "Token Ready",
      metricColor: "text-purple-500 dark:text-purple-400",
      href: "/dashboard/tenant/gatepass",
      icon: QrCode,
      angle: 210, // 10 o'clock
      accent: "from-purple-500 to-indigo-600",
      ringColor: "border-purple-500",
      shadow: "shadow-purple-500/30",
    },
  ];

  const currentAction = actions[selectedIndex];
  const radius = 160; // Orbital distance in pixels

  return (
    <div className="w-full relative py-6 select-none">
      {/* ================= DESKTOP & TABLET: ROTARY DIAL (>= md) ================= */}
      <div className="hidden md:flex flex-col items-center justify-center">
        <div className="relative w-[450px] h-[450px] flex items-center justify-center">
          
          {/* Subtle Outer Guidance Rings */}
          <div className="absolute inset-4 rounded-full border border-dashed border-orange-300/40 dark:border-white/10 pointer-events-none" />
          <div className="absolute inset-16 rounded-full border border-orange-200/50 dark:border-white/5 pointer-events-none" />

          {/* 6 Circular Orbital Nodes */}
          {actions.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = selectedIndex === idx;

            // Trigonometric positioning around orbital track
            const rad = (item.angle * Math.PI) / 180;
            const x = Math.round(radius * Math.cos(rad));
            const y = Math.round(radius * Math.sin(rad));

            return (
              <button
                key={item.id}
                onClick={() => setSelectedIndex(idx)}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                className={`absolute w-16 h-16 rounded-full transition-all duration-500 ease-out flex flex-col items-center justify-center cursor-pointer group ${
                  isSelected
                    ? `scale-115 z-30 ring-4 ${item.ringColor} shadow-[0_0_25px_rgba(249,115,22,0.4)] dark:shadow-[0_0_25px_rgba(244,63,94,0.4)]`
                    : "scale-100 z-20 hover:scale-105 opacity-80 hover:opacity-100"
                }`}
              >
                {/* Frosted Glass Node Bubble */}
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center backdrop-blur-2xl transition-colors ${
                    isSelected
                      ? "bg-white dark:bg-slate-900 border-2 border-white dark:border-white/30 text-slate-950 dark:text-white"
                      : "bg-white/70 dark:bg-white/[0.07] border border-orange-200/60 dark:border-white/15 text-slate-600 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-white/15"
                  } shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_8px_16px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_8px_20px_rgba(0,0,0,0.5)]`}
                >
                  <Icon
                    className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${
                      isSelected ? "text-orange-600 dark:text-rose-400" : ""
                    }`}
                  />
                </div>

                {/* Node Label Floating Below */}
                <span
                  className={`absolute -bottom-6 text-[10px] font-black uppercase tracking-wider whitespace-nowrap px-2 py-0.5 rounded-full transition-colors ${
                    isSelected
                      ? "text-slate-950 dark:text-white bg-white/90 dark:bg-slate-800/90 shadow-xs border border-orange-200 dark:border-white/10"
                      : "text-slate-500 dark:text-slate-400 opacity-80"
                  }`}
                >
                  {item.title}
                </span>
              </button>
            );
          })}

          {/* Center Rotary Knob Housing */}
          <div className="relative w-52 h-52 rounded-full p-2.5 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 dark:from-slate-700 dark:via-slate-800 dark:to-slate-950 shadow-[0_20px_40px_rgba(0,0,0,0.15),inset_0_2px_4px_rgba(255,255,255,0.8)] dark:shadow-[0_25px_50px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.15)] flex items-center justify-center">
            
            {/* Skeuomorphic Beveled Ring with Rotatable Pointer Needle */}
            <div
              style={{
                transform: `rotate(${currentAction.angle}deg)`,
                transition: "transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
              className="absolute inset-1 rounded-full pointer-events-none flex items-center justify-end pr-0.5"
            >
              {/* Outer Amber Needle Notch */}
              <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 dark:from-rose-500 dark:to-purple-500 rotate-45 -mr-1 rounded-xs shadow-[0_0_12px_#f97316] dark:shadow-[0_0_12px_#f43f5e]" />
            </div>

            {/* Stationary Central Telemetry Core */}
            <div className="w-full h-full rounded-full bg-white/90 dark:bg-slate-900/95 backdrop-blur-3xl border border-orange-200/80 dark:border-white/15 p-4 flex flex-col items-center justify-center text-center shadow-[inset_0_2px_5px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] z-10 space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Hub Telemetry
              </span>

              <h4 className="text-sm font-black text-slate-950 dark:text-white leading-tight">
                {currentAction.title}
              </h4>

              <div
                className={`text-[11px] font-black uppercase tracking-wider ${currentAction.metricColor}`}
              >
                {currentAction.metric}
              </div>

              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold max-w-[130px] line-clamp-1">
                {currentAction.subtitle}
              </p>

              {/* Instant Execution CTA */}
              <Link
                href={currentAction.href}
                className="mt-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-black text-[10px] shadow-sm hover:opacity-90 active:scale-95 transition flex items-center gap-1"
              >
                <span>Launch</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ================= MOBILE VIEWPORT: RESPONSIVE FALLBACK (< md) ================= */}
      <div className="block md:hidden space-y-3">
        {/* Mobile Telemetry Status Pill */}
        <div className="p-4 rounded-3xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl border border-orange-200/60 dark:border-white/10 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Active Focus
            </span>
            <span className="text-xs font-black text-slate-950 dark:text-white">
              {currentAction.title} · {currentAction.metric}
            </span>
          </div>

          <Link
            href={currentAction.href}
            className="px-3.5 py-1.5 rounded-xl bg-orange-500 dark:bg-rose-500 text-white text-xs font-black flex items-center gap-1 shadow-sm"
          >
            <span>Launch</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2-Column Scannable Liquid Glass Grid */}
        <div className="grid grid-cols-2 gap-3">
          {actions.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = selectedIndex === idx;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedIndex(idx)}
                className={`p-3.5 rounded-2xl border backdrop-blur-2xl transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-white/95 dark:bg-white/[0.12] border-orange-400 dark:border-rose-500 shadow-md scale-[1.02]"
                    : "bg-white/70 dark:bg-white/[0.04] border-orange-200/60 dark:border-white/10"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      isSelected
                        ? "bg-orange-500 dark:bg-rose-500 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black text-slate-950 dark:text-white block truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 block truncate">
                      {item.metric}
                    </span>
                  </div>
                </div>

                <Link
                  href={item.href}
                  className="p-1 rounded-lg text-slate-400 hover:text-orange-500 dark:hover:text-rose-400 ml-1"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}