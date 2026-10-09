"use client";

import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <SignOutButton>
      <button className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition border border-slate-200 cursor-pointer">
        <LogOut className="w-3.5 h-3.5" /> Logout
      </button>
    </SignOutButton>
  );
}