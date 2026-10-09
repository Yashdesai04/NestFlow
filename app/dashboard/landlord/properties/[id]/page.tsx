import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  addRoom,
  deleteRoom,
  addBed,
  deleteBed,
  addPropertyImages,
  deletePropertyImage,
} from "./actions";
import {
  ArrowLeft,
  Building2,
  Bed as BedIcon,
  Plus,
  Trash2,
  MapPin,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  DoorOpen,
  Camera,
  Image as ImageIcon,
  Sparkles,
  UserPlus,
  Utensils,
  Wrench,
} from "lucide-react";

export default async function PropertyManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: propertyId } = await params;
  const { userId } = await auth();

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) redirect("/onboarding");

  // Fetch Property along with Rooms & Beds
  const property = await db.property.findFirst({
    where: {
      id: propertyId,
      landlordId: user.id,
    },
    include: {
      rooms: {
        include: {
          beds: true,
        },
        orderBy: { roomNumber: "asc" },
      },
    },
  });

  if (!property) redirect("/dashboard/landlord");

  const isPG = property.propertyType === "PG";

  // Calculate real-time totals
  const totalRooms = property.rooms.length;
  let totalBeds = 0;
  let occupiedBeds = 0;

  property.rooms.forEach((room) => {
    room.beds.forEach((bed) => {
      totalBeds += 1;
      if (bed.status === "OCCUPIED") occupiedBeds += 1;
    });
  });

  const vacantBeds = totalBeds - occupiedBeds;

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Background Ambient Theme Backdrop Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0" />

      <main className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-4 sm:p-6 shadow-sm dark:shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/landlord"
              className="p-2.5 rounded-2xl bg-white/80 dark:bg-white/10 border border-orange-200/60 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-rose-400 transition shadow-xs"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                    isPG
                      ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-500/30"
                      : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200/60 dark:border-sky-500/30"
                  }`}
                >
                  {isPG ? "PG / Co-Living" : "Full House"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                {property.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <MapPin className="w-4 h-4 text-orange-500 dark:text-rose-400 shrink-0" />
            <span>
              {property.address}, {property.city}
            </span>
          </div>
        </div>

        {/* Owner Management Quick Toolbar */}
        <div className="bg-slate-900/90 dark:bg-white/[0.08] border border-orange-200/50 dark:border-white/15 text-white p-5 rounded-3xl shadow-lg backdrop-blur-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              Owner Dashboard
            </span>
            <span className="text-xs text-slate-300 font-medium">
              You are managing this property.
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Link
              href={`/dashboard/landlord/properties/${property.id}`}
              className="bg-white/15 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition border border-white/20"
            >
              <BedIcon className="w-3.5 h-3.5" /> Rooms & Beds
            </Link>
            <Link
              href={`/dashboard/landlord/properties/${property.id}/assign`}
              className="bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-1.5 transition shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5 text-sky-400" /> Assign Residents
            </Link>
            {isPG && (
              <Link
                href={`/dashboard/landlord/properties/${property.id}/mess`}
                className="bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-1.5 transition shrink-0"
              >
                <Utensils className="w-3.5 h-3.5 text-amber-400" /> Mess Schedule
              </Link>
            )}
            <Link
              href="/dashboard/landlord/tickets"
              className="bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-1.5 transition shrink-0"
            >
              <Wrench className="w-3.5 h-3.5 text-purple-400" /> Tickets
            </Link>
          </div>
        </div>

        {/* Quick Analytics Metrics Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm dark:shadow-xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Total Rooms
            </span>
            <div className="text-2xl font-black text-slate-950 dark:text-white mt-1.5 tracking-tight">
              {totalRooms}
            </div>
          </div>

          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm dark:shadow-xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Total Beds
            </span>
            <div className="text-2xl font-black text-slate-950 dark:text-white mt-1.5 tracking-tight">
              {totalBeds}
            </div>
          </div>

          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm dark:shadow-xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              Occupied Beds
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1.5 tracking-tight">
              {occupiedBeds}
            </div>
          </div>

          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-sm dark:shadow-xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Vacant Beds
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5 tracking-tight">
              {vacantBeds}
            </div>
          </div>
        </div>

        {/* Property Photo Gallery Section */}
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-orange-100 dark:border-white/10 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-orange-500 dark:text-rose-400" /> Property Photo Gallery
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Manage photos displayed on public search listings & property details
              </p>
            </div>
            
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/10 border border-orange-200/60 dark:border-white/15 px-3.5 py-1.5 rounded-2xl shadow-xs">
              {property.images?.length ?? 0}{" "}
              {property.images?.length === 1 ? "Photo" : "Photos"}
            </span>
          </div>

          {/* 1. Existing Photos Grid */}
          {property.images && property.images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {(property.images || []).map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative h-32 sm:h-36 rounded-2xl overflow-hidden border border-orange-100/80 dark:border-white/10 bg-slate-100 dark:bg-white/5 group shadow-sm"
                >
                  <img
                    src={imgUrl}
                    alt={`Property Photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />

                  {/* Delete Photo Button */}
                  <form
                    action={async () => {
                      "use server";
                      await deletePropertyImage(property.id, imgUrl);
                    }}
                    className="absolute top-2 right-2"
                  >
                    <button
                      type="submit"
                      className="bg-rose-600/90 hover:bg-rose-600 text-white p-2 rounded-xl text-xs transition shadow-md cursor-pointer active:scale-95"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 bg-slate-950/80 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-lg backdrop-blur-md">
                      Cover Photo
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/60 dark:bg-white/[0.03] border border-dashed border-orange-200/80 dark:border-white/15 rounded-2xl p-6 text-center">
              <ImageIcon className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-black text-slate-900 dark:text-white">
                No photos uploaded yet
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Add photo URLs below to display thumbnails on search pages.
              </p>
            </div>
          )}

          {/* 2. Add New Photos Form */}
          <form action={addPropertyImages} className="space-y-3.5 pt-4 border-t border-orange-100 dark:border-white/10">
            <input type="hidden" name="propertyId" value={property.id} />

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Add Photo URLs (Separated by commas)
              </label>
              <textarea
                name="images"
                rows={2}
                required
                placeholder="https://images.unsplash.com/photo-1..., https://images.unsplash.com/photo-2..."
                className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:border-orange-500 dark:focus:border-rose-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-rose-500/20 transition font-medium resize-none"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Paste high-resolution image links from Unsplash, Cloudinary, or UploadThing.
              </p>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-md hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Photos to Property</span>
            </button>
          </form>
        </div>

        {/* Section Title & Add Room Form */}
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-5">
          <h2 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-orange-100 dark:border-white/10 pb-3">
            <DoorOpen className="w-4 h-4 text-orange-500 dark:text-rose-400" />
            <span>Add Room to Property</span>
          </h2>

          <form action={addRoom} className="flex flex-col sm:flex-row gap-3">
            <input type="hidden" name="propertyId" value={property.id} />

            <input
              type="text"
              name="roomNumber"
              required
              placeholder="Room Name/No. (e.g. 101, Room A)"
              className="flex-1 bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:border-orange-500 dark:focus:border-rose-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-rose-500/20 transition font-medium"
            />

            <select
              name="roomType"
              className="bg-white/80 dark:bg-slate-900 border border-orange-200/60 dark:border-white/15 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-orange-500 dark:focus:border-rose-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-rose-500/20 transition cursor-pointer font-medium"
            >
              <option value="Single Sharing" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Single Sharing (1 Bed)</option>
              <option value="Double Sharing" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Double Sharing (2 Beds)</option>
              <option value="Triple Sharing" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Triple Sharing (3 Beds)</option>
              <option value="Four Sharing" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Four Sharing (4 Beds)</option>
            </select>

            <button
              type="submit"
              className="bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold text-xs px-6 py-2.5 rounded-2xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Room</span>
            </button>
          </form>
        </div>

        {/* Rooms & Bed Matrix Section */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2 tracking-tight">
              <BedIcon className="w-5 h-5 text-orange-500 dark:text-rose-400" />
              <span>Room & Bed Matrix</span>
            </h2>
          </div>

          {property.rooms.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {property.rooms.map((room) => {
                const roomBedsCount = room.beds.length;

                return (
                  <div
                    key={room.id}
                    className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-sm dark:shadow-2xl flex flex-col justify-between"
                  >
                    <div>
                      {/* Room Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-orange-100 dark:border-white/10 mb-4">
                        <div>
                          <span className="text-[10px] font-black bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md uppercase tracking-wider">
                            {room.roomType || "Standard"}
                          </span>
                          <h3 className="text-lg font-black text-slate-950 dark:text-white mt-1">
                            {room.roomNumber}
                          </h3>
                        </div>

                        <form
                          action={async () => {
                            "use server";
                            await deleteRoom(property.id, room.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="p-2.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-white/10 rounded-2xl transition cursor-pointer active:scale-95"
                            title="Delete Room"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </div>

                      {/* Beds Grid inside Room */}
                      <div className="space-y-3 mb-6">
                        <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          Beds ({roomBedsCount})
                        </span>

                        {room.beds.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {room.beds.map((bed) => {
                              const isOccupied = bed.status === "OCCUPIED";

                              return (
                                <div
                                  key={bed.id}
                                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                                    isOccupied
                                      ? "bg-amber-500/[0.08] dark:bg-amber-400/[0.08] border-amber-200/80 dark:border-amber-400/20"
                                      : "bg-emerald-500/[0.08] dark:bg-emerald-400/[0.08] border-emerald-200/80 dark:border-emerald-400/20"
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-extrabold text-slate-950 dark:text-white text-xs">
                                        {bed.bedNumber}
                                      </span>
                                      <span
                                        className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                          isOccupied
                                            ? "bg-amber-200/80 dark:bg-amber-400/20 text-amber-800 dark:text-amber-300"
                                            : "bg-emerald-200/80 dark:bg-emerald-400/20 text-emerald-800 dark:text-emerald-300"
                                        }`}
                                      >
                                        {bed.status}
                                      </span>
                                    </div>
                                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 block mt-1">
                                      {formatCurrency(
                                        bed.priceMonthly ||
                                          property.priceMonthly ||
                                          0
                                      )}
                                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">/mo</span>
                                    </span>
                                  </div>

                                  <form
                                    action={async () => {
                                      "use server";
                                      await deleteBed(property.id, bed.id);
                                    }}
                                  >
                                    <button
                                      type="submit"
                                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-xl hover:bg-white/20 transition cursor-pointer active:scale-95"
                                      title="Delete Bed"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </form>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="bg-white/60 dark:bg-white/[0.03] border border-dashed border-orange-200/80 dark:border-white/15 p-4 rounded-2xl text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                              No beds added to this room yet.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Add Bed Inline Form */}
                    <div className="pt-4 border-t border-orange-100 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-4 rounded-2xl border border-orange-100/80 dark:border-white/[0.06] space-y-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white block">
                        + Add Bed to {room.roomNumber}
                      </span>
                      <form action={addBed} className="flex gap-2">
                        <input
                          type="hidden"
                          name="propertyId"
                          value={property.id}
                        />
                        <input type="hidden" name="roomId" value={room.id} />

                        <input
                          type="text"
                          name="bedNumber"
                          required
                          placeholder="Bed ID (e.g. Bed 1)"
                          className="flex-1 bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:border-orange-500 dark:focus:border-rose-500 font-medium"
                        />

                        <input
                          type="number"
                          name="priceMonthly"
                          required
                          defaultValue={property.priceMonthly || 8000}
                          placeholder="Price (₹)"
                          className="w-24 bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:border-orange-500 dark:focus:border-rose-500 font-medium"
                        />

                        <button
                          type="submit"
                          className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer active:scale-95 shrink-0"
                        >
                          Add
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/70 dark:bg-white/[0.05] border border-dashed border-orange-200/80 dark:border-white/15 backdrop-blur-2xl rounded-3xl p-10 text-center shadow-sm">
              <Building2 className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
              <h3 className="font-black text-slate-950 dark:text-white text-base">
                No Rooms Created
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium max-w-sm mx-auto">
                Use the form above to add your first room (e.g. Room 101) to build your bed matrix.
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}