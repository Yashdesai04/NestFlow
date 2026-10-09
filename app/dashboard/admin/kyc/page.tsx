import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { approveKycAction, rejectKycAction } from "../actions";
import {
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  FileText,
  Mail,
  User,
  Search,
  Users,
} from "lucide-react";

interface KycPageProps {
  searchParams: Promise<{ query?: string }>;
}

export default async function AdminKycPage({ searchParams }: KycPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const admin = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!admin || admin.role !== "ADMIN") {
    redirect("/dashboard/landlord");
  }

  const resolvedSearchParams = await searchParams;
  const query = (resolvedSearchParams?.query || "").trim().toLowerCase();

  const pendingUsers = await db.user.findMany({
    where: {
      OR: [{ kycStatus: "PENDING" }, { isVerified: false, kycDocumentUrl: { not: null } }],
    },
    orderBy: { createdAt: "desc" },
  });

  const filteredUsers = pendingUsers.filter(
    (u) =>
      (u.fullName || "").toLowerCase().includes(query) ||
      (u.email || "").toLowerCase().includes(query) ||
      (u.role || "").toLowerCase().includes(query)
  );

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-28 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[750px] h-[750px] bg-gradient-to-tr from-rose-500/20 via-purple-600/15 to-indigo-600/20 dark:from-rose-600/25 dark:via-purple-600/20 dark:to-indigo-600/25 rounded-full blur-[180px] pointer-events-none -z-0" />

      <main className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* Master Liquid Glass Slab */}
        <div className="relative rounded-[40px] sm:rounded-[48px] bg-white/70 dark:bg-white/[0.04] backdrop-blur-3xl border border-rose-200/60 dark:border-white/15 p-6 sm:p-10 shadow-[0_30px_90px_-20px_rgba(244,63,94,0.12),0_15px_35px_-10px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,0.95)] dark:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.15)] space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-rose-100 dark:border-white/[0.08] pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/admin"
                  className="p-2.5 rounded-full bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-rose-200/60 dark:border-white/20 text-slate-700 dark:text-slate-200 shadow-[0_6px_16px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] transition cursor-pointer active:scale-90"
                  title="Back to Admin Console"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/10 dark:bg-rose-500/20 border border-rose-200/60 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-[11px] font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Identity & Trust</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight pt-1">
                User KYC Verification Queue
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                Review identity documents, verify residential validity, and grant platform verification.
              </p>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-white/[0.06] border border-rose-200/60 dark:border-white/10 backdrop-blur-md shadow-xs flex items-center gap-2 self-start sm:self-auto shrink-0">
              <Users className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                <strong className="text-slate-950 dark:text-white">{pendingUsers.length}</strong> Pending
              </span>
            </div>
          </div>

          {/* Search Form */}
          <form
            action="/dashboard/admin/kyc"
            method="GET"
            className="relative flex items-center bg-white/90 dark:bg-white/10 backdrop-blur-2xl rounded-full border border-rose-200/60 dark:border-white/20 p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)]"
          >
            <Search className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Search KYC queue by name, email, or role..."
              className="w-full bg-transparent px-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 text-white font-extrabold text-xs shadow-[0_8px_20px_rgba(244,63,94,0.35),inset_0_1px_2px_rgba(255,255,255,0.6)] hover:opacity-95 transition cursor-pointer shrink-0 mr-0.5"
            >
              Search
            </button>
          </form>

          {/* Verification Table */}
          {filteredUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-6 rounded-[32px] bg-white/70 dark:bg-white/[0.04] backdrop-blur-2xl border border-rose-200/60 dark:border-white/15 shadow-[0_18px_38px_-10px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)] flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        <User className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-base text-slate-950 dark:text-white">
                        {u.fullName || "Unregistered Name"}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 uppercase">
                        {u.role}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.email}</span>
                      </span>
                      <span>Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                    </div>

                    {u.kycDocumentUrl ? (
                      <div className="pt-1">
                        <a
                          href={u.kycDocumentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/10 border border-rose-200/60 dark:border-white/15 text-slate-800 dark:text-slate-200 hover:text-rose-600 font-bold transition shadow-xs text-xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-rose-500" />
                          <span>View Submitted ID Document</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">No document file attached</span>
                    )}
                  </div>

                  {/* Approve / Reject Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-rose-100 dark:border-white/10">
                    <form action={approveKycAction}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white font-extrabold text-xs transition shadow-sm cursor-pointer active:scale-95 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve KYC</span>
                      </button>
                    </form>

                    <form action={rejectKycAction}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 sm:p-16 text-center max-w-md mx-auto border border-dashed border-rose-200 dark:border-white/10 rounded-3xl">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-950 dark:text-white text-base">
                All KYC Submissions Cleared
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                There are no pending identity documents requiring verification.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}