import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { updateUserRoleAction } from "../actions";
import { ArrowLeft, Users, Search } from "lucide-react";

interface UsersPageProps {
  searchParams: Promise<{ query?: string }>;
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
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

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const filtered = users.filter(
    (u) =>
      (u.fullName || "").toLowerCase().includes(query) ||
      (u.email || "").toLowerCase().includes(query) ||
      (u.phone || "").toLowerCase().includes(query) ||
      (u.role || "").toLowerCase().includes(query)
  );

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-28 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[750px] h-[750px] bg-gradient-to-tr from-rose-500/20 via-purple-600/15 to-indigo-600/20 rounded-full blur-[180px] pointer-events-none -z-0" />

      <main className="max-w-6xl mx-auto relative z-10 space-y-8">
        <div className="relative rounded-[40px] sm:rounded-[48px] bg-white/70 dark:bg-white/[0.04] backdrop-blur-3xl border border-rose-200/60 dark:border-white/15 p-6 sm:p-10 shadow-sm space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-rose-100 dark:border-white/[0.08] pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/admin"
                  className="p-2.5 rounded-full bg-white/80 dark:bg-white/10 border border-rose-200/60 dark:border-white/20 text-slate-700 dark:text-slate-200 shadow-xs transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-200/60 text-purple-700 dark:text-purple-400 text-[11px] font-black uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5" />
                  <span>Access Control</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight pt-1">
                Platform User Registry & Roles
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                Elevate account roles to Landlords or Admins and audit KYC status across accounts.
              </p>
            </div>

            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-rose-200/60 px-4 py-2.5 rounded-2xl shadow-xs self-start sm:self-auto">
              <strong className="text-slate-950 dark:text-white">{users.length}</strong> Registered Users
            </span>
          </div>

          {/* Search */}
          <form
            action="/dashboard/admin/users"
            method="GET"
            className="relative flex items-center bg-white/90 dark:bg-white/10 backdrop-blur-2xl rounded-full border border-rose-200/60 dark:border-white/20 p-1.5 shadow-xs"
          >
            <Search className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Search by name, email, phone, or role (TENANT, LANDLORD, ADMIN)..."
              className="w-full bg-transparent px-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 text-white font-extrabold text-xs shadow-sm hover:opacity-95 transition cursor-pointer mr-0.5"
            >
              Search
            </button>
          </form>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-rose-100 dark:border-white/10 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th className="pb-3">User Profile</th>
                  <th className="pb-3">Email & Contact</th>
                  <th className="pb-3 text-center">Verification Status</th>
                  <th className="pb-3 text-right">Role Elevation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100/60 dark:divide-white/5 font-medium">
                {filtered.length > 0 ? (
                  filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                      <td className="py-3.5 pr-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {u.fullName || "Anonymous User"}
                        </div>
                        <span className="text-[10px] text-slate-400">ID: {u.id.slice(-8)}</span>
                      </td>

                      <td className="py-3.5 pr-4 text-slate-600 dark:text-slate-300">
                        <div>{u.email}</div>
                        <span className="text-[10px] text-slate-400">{u.phone || "No phone registered"}</span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                            u.isVerified
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/60"
                              : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400 border-slate-200"
                          }`}
                        >
                          {u.isVerified ? "Verified" : "Unverified"}
                        </span>
                      </td>

                      <td className="py-3.5 pl-4 text-right">
                        <form action={updateUserRoleAction} className="inline-flex items-center gap-2">
                          <input type="hidden" name="userId" value={u.id} />
                          <select
                            name="role"
                            defaultValue={u.role}
                            className="bg-white dark:bg-slate-900 border border-rose-200/60 dark:border-white/15 rounded-xl px-2.5 py-1 text-xs font-semibold outline-none cursor-pointer"
                          >
                            <option value="TENANT">TENANT</option>
                            <option value="LANDLORD">LANDLORD</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          <button
                            type="submit"
                            className="px-2.5 py-1 rounded-xl bg-slate-900 dark:bg-white/10 text-white font-extrabold text-[11px] shadow-xs cursor-pointer hover:opacity-90"
                          >
                            Save
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No users match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}