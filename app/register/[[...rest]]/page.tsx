"use client";

import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { User, Building2 } from "lucide-react";

/** Reusable Military Tank Vector */
function MilitaryTankSVG() {
  return (
    <svg
      className="w-full h-full drop-shadow-2xl overflow-visible"
      viewBox="0 0 280 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="140" cy="168" rx="120" ry="7" fill="rgba(0,0,0,0.35)" />
      <line x1="125" y1="28" x2="125" y2="58" stroke="#1d2e1c" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="125" cy="27" r="2.5" fill="#f59e0b" />

      {/* Cannon Barrel Assembly */}
      <g>
        <rect x="110" y="65" width="22" height="24" rx="4" fill="#2d4a2b" stroke="#1a2d19" strokeWidth="2" />
        <rect x="126" y="68" width="120" height="18" rx="2" fill="#527d49" stroke="#1a2d19" strokeWidth="2.5" />
        <rect x="126" y="78" width="120" height="8" fill="#3b5d35" />
        <rect x="238" y="63" width="20" height="28" rx="4" fill="#2d4a2b" stroke="#1a2d19" strokeWidth="2.5" />
        <ellipse cx="258" cy="77" rx="4" ry="12" fill="#1a2d19" />
      </g>

      {/* Armored Turret */}
      <polygon points="105,58 175,52 225,86 112,86" fill="#66995c" stroke="#1a2d19" strokeWidth="3" />
      <polygon points="175,52 225,86 200,86 155,54" fill="#4d7745" />

      {/* Hazard Stripes */}
      <g opacity="0.95">
        <polygon points="175,58 190,58 212,84 197,84" fill="#facc15" />
        <polygon points="193,58 202,58 222,84 213,84" fill="#fb923c" />
      </g>

      {/* Lower Chassis */}
      <polygon points="42,112 78,86 248,86 265,112 245,122 36,122" fill="#75aa6a" stroke="#1a2d19" strokeWidth="3" />
      <polygon points="36,122 245,122 238,130 45,130" fill="#3b5d35" />
      <rect x="52" y="94" width="14" height="12" rx="2" fill="#2d4a2b" stroke="#1a2d19" strokeWidth="1.5" />
      <circle cx="59" cy="100" r="3" fill="#1a2d19" />

      {/* Continuous Tracks */}
      <rect x="38" y="108" width="216" height="54" rx="27" fill="#c2410c" stroke="#1a2d19" strokeWidth="3.5" />
      <rect x="46" y="115" width="200" height="40" rx="20" fill="#182717" />

      {/* 5 Rotating Road Wheels */}
      {[72, 106, 140, 174, 208].map((cx, i) => (
        <g key={i} className="animate-tank-wheel" style={{ transformOrigin: `${cx}px 135px` }}>
          <circle cx={cx} cy="135" r="16.5" fill="#4d7745" stroke="#1a2d19" strokeWidth="2.5" />
          <circle cx={cx} cy="135" r="11" fill="#2d4a2b" stroke="#1a2d19" strokeWidth="1.8" />
          <circle cx={cx} cy="135" r="4.5" fill="#f59e0b" />
          <line x1={cx} y1={cx ? 122 : 0} x2={cx} y2="148" stroke="#1a2d19" strokeWidth="1.5" />
          <line x1={cx - 13} y1={135} x2={cx + 13} y2="135" stroke="#1a2d19" strokeWidth="1.5" />
        </g>
      ))}
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "LANDLORD" ? "LANDLORD" : "TENANT";

  const [role, setRole] = useState<"TENANT" | "LANDLORD">(initialRole);
  const [, startTransition] = useTransition();

  const isLandlord = role === "LANDLORD";

  const handleRoleChange = (newRole: "TENANT" | "LANDLORD") => {
    if (newRole === role) return;

    setRole(newRole);

    startTransition(() => {
      router.replace(`/register?role=${newRole}`, { scroll: false });
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient Radial Lighting Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-orange-400/20 via-amber-300/20 to-sky-400/20 dark:from-rose-600/20 dark:via-purple-500/15 dark:to-indigo-600/20 rounded-full blur-[160px] pointer-events-none -z-0" />

      {/* Header Branding & Role Selector */}
      <div className="mb-4 text-center relative z-10">
        <div className="bg-gradient-to-tr from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold text-sm px-3.5 py-1.5 rounded-full inline-block mb-2.5 shadow-md border border-white/40">
          NF
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
          Join NestFlow as {isLandlord ? "a Landlord" : "a Resident"}
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto font-medium">
          {isLandlord
            ? "List properties, manage rooms, track bed occupancies, and split utility bills."
            : "Browse rental houses, PG beds, view mess menus, and manage rent payments."}
        </p>

        {/* Liquid Glass Role Toggle Tabs */}
        <div className="mt-4 inline-flex items-center p-1.5 rounded-full bg-white/70 dark:bg-white/[0.06] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl shadow-sm gap-1">
          <button
            type="button"
            onClick={() => handleRoleChange("TENANT")}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer select-none outline-none ${
              !isLandlord
                ? "text-slate-950 dark:text-white dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/[0.08] hover:shadow-xs active:scale-95"
            }`}
          >
            {!isLandlord && <span className="liquid-pill" />}
            <User className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Resident / Tenant</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("LANDLORD")}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer select-none outline-none ${
              isLandlord
                ? "text-slate-950 dark:text-white dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/[0.08] hover:shadow-xs active:scale-95"
            }`}
          >
            {isLandlord && <span className="liquid-pill" />}
            <Building2 className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Landlord / Owner</span>
          </button>
        </div>
      </div>

      {/* Main Full-Width Animation Battlefield Stage */}
      <div className="relative w-full max-w-4xl flex items-center justify-center min-h-[540px]">

        {/* Dual Tanks Battlefield Container (Runs only on entry, then cleans up) */}
        <div className="animate-battle-cleanup absolute inset-x-0 top-8 h-48 pointer-events-none z-10 flex items-center justify-between overflow-visible">

          {/* LEFT TANK */}
          <div className="animate-left-tank relative w-56 sm:w-72 h-36 shrink-0 -ml-4 sm:ml-2">
            <MilitaryTankSVG />
            <div className="animate-muzzle-flash absolute top-[44px] -right-7 w-14 h-14 rounded-full bg-radial from-amber-200 via-orange-500 to-transparent blur-[1px]" />
          </div>

          {/* RIGHT TANK */}
          <div className="animate-right-tank relative w-56 sm:w-72 h-36 shrink-0 -mr-4 sm:mr-2">
            <MilitaryTankSVG />
            <div className="animate-muzzle-flash absolute top-[44px] -right-7 w-14 h-14 rounded-full bg-radial from-amber-200 via-orange-500 to-transparent blur-[1px]" />
          </div>

          {/* LEFT BOMB TRAJECTORY TRACK */}
          <div className="absolute top-[68px] left-[calc(50%-min(30vw,240px))] w-[min(30vw,240px)] h-0 z-20 pointer-events-none">
            <div className="animate-left-bomb-fly absolute flex items-center justify-center -ml-5">
              <svg className="w-10 h-10 drop-shadow-[0_0_14px_rgba(249,115,22,1)]" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="12" fill="#0f172a" stroke="#f97316" strokeWidth="2.5" />
                <circle cx="20" cy="20" r="5" fill="#facc15" />
                <path d="M8 20 Q2 14 0 20 Q2 26 8 20" fill="#ea580c" opacity="0.85" />
              </svg>
            </div>
          </div>

          {/* RIGHT BOMB TRAJECTORY TRACK */}
          <div className="absolute top-[68px] right-[calc(50%-min(30vw,240px))] w-[min(30vw,240px)] h-0 z-20 pointer-events-none">
            <div className="animate-right-bomb-fly absolute flex items-center justify-center -mr-5">
              <svg className="w-10 h-10 drop-shadow-[0_0_14px_rgba(249,115,22,1)]" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="12" fill="#0f172a" stroke="#f97316" strokeWidth="2.5" />
                <circle cx="20" cy="20" r="5" fill="#facc15" />
                <path d="M32 20 Q38 14 40 20 Q38 26 32 20" fill="#ea580c" opacity="0.85" />
              </svg>
            </div>
          </div>

          {/* EXACT DEAD-CENTER IMPACT EXPLOSION SHOCKWAVE */}
          <div className="absolute top-[68px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 pointer-events-none flex items-center justify-center z-25">
            <div className="animate-collision-blast absolute pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 rounded-full border-4 border-orange-500/90 bg-radial from-amber-300/95 via-orange-600/70 to-transparent shadow-[0_0_120px_rgba(249,115,22,1)]" />
            </div>
          </div>

        </div>

        {/* 3D FLIP CONTAINER WRAPPED INSIDE POP-OUT DETONATION */}
        <div className="animate-tank-card-emerge relative z-30 w-full max-w-md">
          <div className="flip-container w-full">
            <div className={`flipper ${isLandlord ? "flipped" : ""}`}>
              
              {/* FRONT FACE: Resident / Tenant */}
              <div className="flip-front">
                <SignUp
                  path="/register"
                  routing="path"
                  signInUrl="/login"
                  forceRedirectUrl="/onboarding?role=TENANT"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "rounded-[32px] p-6 shadow-2xl backdrop-blur-2xl transition-all",
                      formButtonPrimary:
                        "bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold rounded-full shadow-md hover:opacity-95 transition-all text-xs py-3",
                      socialButtonsBlockButton: "rounded-full transition-all text-xs font-bold py-2.5",
                      formFieldInput: "rounded-2xl transition-all text-xs font-semibold px-3.5 py-2.5",
                      footerActionLink: "text-orange-600 dark:text-rose-400 font-bold hover:underline",
                    },
                  }}
                />
              </div>

              {/* BACK FACE: Landlord / Owner */}
              <div className="flip-back">
                <SignUp
                  path="/register"
                  routing="path"
                  signInUrl="/login"
                  forceRedirectUrl="/onboarding?role=LANDLORD"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "rounded-[32px] p-6 shadow-2xl backdrop-blur-2xl transition-all",
                      formButtonPrimary:
                        "bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold rounded-full shadow-md hover:opacity-95 transition-all text-xs py-3",
                      socialButtonsBlockButton: "rounded-full transition-all text-xs font-bold py-2.5",
                      formFieldInput: "rounded-2xl transition-all text-xs font-semibold px-3.5 py-2.5",
                      footerActionText: "text-slate-600 dark:text-slate-300 font-medium",
                      footerActionLink: "text-orange-600 dark:text-rose-400 font-bold hover:underline",
                    },
                  }}
                />
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}