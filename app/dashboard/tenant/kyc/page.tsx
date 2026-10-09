import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { submitKycAction } from "./actions";
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  UploadCloud,
  ExternalLink,
  Sparkles,
  Lock,
} from "lucide-react";

export default async function TenantKycPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) redirect("/onboarding");

  const isApproved = user.kycStatus === "APPROVED";
  const isPending = user.kycStatus === "PENDING";
  const isRejected = user.kycStatus === "REJECTED";
  const isUnsubmitted = user.kycStatus === "UNSUBMITTED";

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-28 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Refraction Lighting */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[750px] h-[750px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[170px] pointer-events-none -z-0" />

      <main className="max-w-4xl mx-auto relative z-10 space-y-8">
        
        {/* Master Liquid Glass Slab */}
        <div className="relative rounded-[40px] sm:rounded-[48px] bg-white/70 dark:bg-white/[0.04] backdrop-blur-3xl border border-orange-200/60 dark:border-white/15 p-6 sm:p-10 shadow-[0_30px_90px_-20px_rgba(249,115,22,0.12),0_15px_35px_-10px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,0.95)] dark:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.15)] space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-orange-100 dark:border-white/[0.08] pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/tenant"
                  className="p-2.5 rounded-full bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-orange-200/60 dark:border-white/20 text-slate-700 dark:text-slate-200 shadow-xs transition active:scale-90"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-500/10 dark:bg-rose-500/15 border border-orange-200/60 dark:border-rose-500/30 text-orange-700 dark:text-rose-400 text-[11px] font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Trust & Security</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight pt-1">
                Identity & KYC Verification
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                Verify your identity to unlock digital lease signatures, booking confirmations, and gate pass privileges.
              </p>
            </div>

            {/* Live Verification Capsule */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span
                className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border shadow-xs flex items-center gap-1.5 ${
                  isApproved
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30"
                    : isPending
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30"
                    : isRejected
                    ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30"
                    : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10"
                }`}
              >
                {isApproved && <CheckCircle2 className="w-4 h-4" />}
                {isPending && <Clock className="w-4 h-4 animate-pulse" />}
                {isRejected && <XCircle className="w-4 h-4" />}
                {isUnsubmitted && <ShieldAlert className="w-4 h-4" />}
                <span>Status: {user.kycStatus}</span>
              </span>
            </div>
          </div>

          {/* Status Context Alerts */}
          {isApproved && (
            <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-emerald-950 dark:text-emerald-200">
                    Identity Verified Successfully
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium mt-0.5">
                    Your government identity records are verified. All resident platform privileges are unlocked.
                  </p>
                </div>
              </div>

              {user.kycDocumentUrl && (
                <a
                  href={user.kycDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-white/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-xs hover:opacity-90 transition inline-flex items-center gap-1.5 shrink-0"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View ID</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
            </div>
          )}

          {isPending && (
            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-amber-950 dark:text-amber-200">
                    Document Under Super Admin Review
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mt-0.5">
                    Your identity proof was submitted and is pending verification in the executive moderation queue.
                  </p>
                </div>
              </div>

              {user.kycDocumentUrl && (
                <a
                  href={user.kycDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-white/10 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-xs hover:opacity-90 transition inline-flex items-center gap-1.5 shrink-0"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Uploaded Proof</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
            </div>
          )}

          {isRejected && (
            <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/30 flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500 text-white shadow-sm">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-rose-950 dark:text-rose-200">
                  Verification Review Rejected
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-300 font-medium mt-0.5">
                  The uploaded identity document was unclear, expired, or invalid. Please submit a clearer image or document link below.
                </p>
              </div>
            </div>
          )}

          {/* Submission Form (Rendered if not yet approved) */}
          {!isApproved && (
            <form action={submitKycAction} className="space-y-6">
              
              <div className="p-6 sm:p-7 rounded-[32px] bg-white/80 dark:bg-white/[0.03] border border-orange-100 dark:border-white/10 space-y-5">
                <div className="flex items-center gap-2 border-b border-orange-100/60 dark:border-white/5 pb-3">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-white">
                    Submit Identity Proof
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Document Type *
                    </label>
                    <select
                      name="documentType"
                      required
                      className="w-full bg-white dark:bg-slate-900 border border-orange-200/60 dark:border-white/15 rounded-2xl px-4 py-2.5 text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="AADHAAR">Aadhaar Card (Front & Back)</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="STUDENT_ID">University / College Student ID</option>
                      <option value="DRIVING_LICENSE">Driving License</option>
                      <option value="VOTER_ID">Voter ID</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Government / Roll ID Number
                    </label>
                    <input
                      type="text"
                      name="idNumber"
                      placeholder="e.g. XXXX-XXXX-1234"
                      className="w-full bg-white dark:bg-slate-900 border border-orange-200/60 dark:border-white/15 rounded-2xl px-4 py-2.5 text-xs font-medium outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Document URL or Cloud File Link *</span>
                      <span className="text-[10px] text-slate-400 font-semibold lowercase">
                        (Uploadcare, Cloudinary, Imgur, or Google Drive public link)
                      </span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="url"
                        name="documentUrl"
                        required
                        placeholder="https://ucarecdn.com/... or https://drive.google.com/..."
                        className="w-full bg-white dark:bg-slate-900 border border-orange-200/60 dark:border-white/15 rounded-2xl px-4 py-2.5 text-xs font-medium outline-none focus:border-orange-500 transition pr-10"
                      />
                      <UploadCloud className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium pt-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>All documents are securely encrypted and accessible only by Super Admin moderators.</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg hover:opacity-95 transition cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isPending ? "Resubmit Document Proof" : "Submit for KYC Verification"}</span>
              </button>
            </form>
          )}

        </div>
      </main>
    </div>
  );
}