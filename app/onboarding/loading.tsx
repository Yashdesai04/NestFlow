import { Sparkles, Loader2 } from "lucide-react";

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden text-slate-900 dark:text-white">
      {/* Background Ambient Theme Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-orange-400/20 via-amber-300/20 to-sky-400/20 dark:from-rose-600/20 dark:via-purple-500/15 dark:to-indigo-600/20 rounded-full blur-[160px] pointer-events-none -z-0" />

      {/* Center Liquid Glass Box */}
      <div className="relative z-10 bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
        <div className="bg-gradient-to-tr from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white p-3 rounded-2xl inline-block shadow-md">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>

        <h1 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">
          Setting up your workspace
        </h1>
        
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          Configuring your profile and redirecting you to your dashboard...
        </p>

        <div className="flex items-center justify-center pt-2">
          <Loader2 className="w-5 h-5 text-orange-500 dark:text-rose-400 animate-spin" />
        </div>
      </div>
    </div>
  );
}