import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, FileCheck2, Calendar, MessageSquare, Send } from "lucide-react";

export default async function PropertyApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 1. Await server auth in Clerk v5
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  // 2. Await route params in Next.js 16
  const { id } = await params;

  const property = await db.property.findUnique({
    where: { id },
    include: {
      rooms: {
        include: {
          beds: true,
        },
      },
    },
  });

  if (!property) {
    notFound();
  }

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Background Ambient Theme Backdrop Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0" />

      <main className="max-w-3xl mx-auto relative z-10 space-y-6">
        
        {/* Navigation Breadcrumb Card */}
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-4 sm:p-5 shadow-sm dark:shadow-2xl flex items-center justify-between">
          <Link
            href={`/properties/${property.id}`}
            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-rose-400 flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Property</span>
          </Link>
        </div>

        {/* Form Application Card */}
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-500/10 dark:bg-rose-500/10 border border-orange-200/60 dark:border-rose-500/20 text-orange-600 dark:text-rose-400 text-[11px] font-black uppercase tracking-wider mb-2.5">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Tenancy Application</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Apply for {property.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Submit your application details to the landlord for review and approval.
            </p>
          </div>

          <form action="/api/applications" method="POST" className="space-y-5">
            <input type="hidden" name="propertyId" value={property.id} />

            {/* Move-In Date */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                <span>Move-In Date *</span>
              </label>
              <input
                type="date"
                name="moveInDate"
                required
                className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-white outline-none focus:border-orange-500 dark:focus:border-rose-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-rose-500/20 transition cursor-pointer [color-scheme:light_dark]"
              />
            </div>

            {/* Notes for Landlord */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
                <span>Notes for Landlord (Optional)</span>
              </label>
              <textarea
                name="notes"
                rows={4}
                placeholder="Share a brief introduction, employment details, or preferred lease duration..."
                className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl p-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:border-orange-500 dark:focus:border-rose-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-rose-500/20 transition resize-none font-medium"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Application</span>
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}