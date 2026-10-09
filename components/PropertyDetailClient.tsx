"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { bookPropertyTourAction, submitBedApplicationAction } from "@/app/properties/[id]/actions";
import {
  Bed,
  Check,
  Calendar,
  IndianRupee,
  Phone,
  Send,
  Compass,
  User,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface BedData {
  id: string;
  bedNumber: string;
  priceMonthly: number | null;
  isOccupied: boolean;
}

interface RoomData {
  id: string;
  roomNumber: string;
  roomType: string | null;
  beds: BedData[];
}

interface PropertyDetailClientProps {
  property: {
    id: string;
    title: string;
    priceMonthly: number | null;
    images: string[];
    rooms: RoomData[];
    landlord: {
      fullName: string | null;
      email: string;
      phone?: string | null;
    };
  };
}

export function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(
    property.images?.[0] ||
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80"
  );
  const [selectedBedId, setSelectedBedId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"apply" | "tour">("apply");
  const [isPending, setIsPending] = useState(false);

  const selectedBed = property.rooms
    .flatMap((r) => r.beds.map((b) => ({ ...b, roomNumber: r.roomNumber, roomId: r.id })))
    .find((b) => b.id === selectedBedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left 2 Columns: Gallery & Interactive Layout */}
      <div className="lg:col-span-2 space-y-8">
        {/* Visual Showcase */}
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-sm space-y-4">
          <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-slate-100 dark:bg-white/5">
            <img
              src={selectedImage}
              alt={property.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl text-white">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Base Rent</span>
              <span className="text-xl font-black">{formatCurrency(property.priceMonthly || 0)}</span>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {property.images?.length > 1 && (
            <div className="p-4 pt-0 flex items-center gap-3 overflow-x-auto">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative h-16 w-24 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                    selectedImage === img
                      ? "border-orange-500 scale-105 shadow-md"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Bed Space Matrix */}
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-950 dark:text-white tracking-tight">
                Interactive Bed Space Layout
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Click on any open bed to select it for your application.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Available
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Occupied
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {property.rooms.map((room) => (
              <div
                key={room.id}
                className="p-5 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-orange-100/80 dark:border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                      Room {room.roomNumber}
                    </span>
                    {room.roomType && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 uppercase">
                        {room.roomType}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {room.beds.length} Total Beds
                  </span>
                </div>

                {/* Beds Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {room.beds.map((bed) => {
                    const isBooked = bed.isOccupied;
                    const isSelected = selectedBedId === bed.id;

                    return (
                      <button
                        key={bed.id}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setSelectedBedId(isSelected ? "" : bed.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                          isBooked
                            ? "bg-slate-100/50 dark:bg-white/[0.01] border-slate-200/60 dark:border-white/5 opacity-50 cursor-not-allowed"
                            : isSelected
                            ? "bg-gradient-to-tr from-orange-500/15 to-amber-500/15 border-orange-500 ring-2 ring-orange-500/20 scale-[1.02]"
                            : "bg-white/80 dark:bg-white/[0.03] border-orange-100 dark:border-white/10 hover:border-orange-400 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5 text-sky-500" />
                            <span>Bed {bed.bedNumber}</span>
                          </span>
                          {isSelected ? (
                            <span className="p-0.5 bg-orange-500 text-white rounded-full">
                              <Check className="w-3 h-3" />
                            </span>
                          ) : (
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isBooked ? "bg-rose-500" : "bg-emerald-500"
                              }`}
                            />
                          )}
                        </div>

                        <div className="text-[11px] font-bold text-slate-900 dark:text-white">
                          {formatCurrency(bed.priceMonthly || property.priceMonthly || 0)}
                          <span className="text-[9px] font-normal text-slate-400 block">
                            {isBooked ? "Occupied" : isSelected ? "Selected Space" : "Available"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Actions (Apply or Tour) */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-sm sticky top-28 space-y-5">
          {/* Tab Controls */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-white/10 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab("apply")}
              className={`py-2 text-xs font-extrabold rounded-xl transition ${
                activeTab === "apply"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Apply for Bed
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tour")}
              className={`py-2 text-xs font-extrabold rounded-xl transition ${
                activeTab === "tour"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Book Walkthrough
            </button>
          </div>

          {/* Form 1: Bed Space Application */}
          {activeTab === "apply" && (
            <form
              action={async (formData) => {
                setIsPending(true);
                try {
                  await submitBedApplicationAction(formData);
                } finally {
                  setIsPending(false);
                }
              }}
              className="space-y-3.5 text-xs"
            >
              <input type="hidden" name="propertyId" value={property.id} />
              {selectedBed && (
                <>
                  <input type="hidden" name="roomId" value={selectedBed.roomId} />
                  <input type="hidden" name="bedId" value={selectedBed.id} />
                </>
              )}

              {/* Selected Bed Banner */}
              {selectedBed ? (
                <div className="p-3 bg-orange-500/10 border border-orange-200/60 dark:border-orange-500/30 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 dark:text-rose-400 block">
                      Target Bed Space
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Room {selectedBed.roomNumber} · Bed {selectedBed.bedNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBedId("")}
                    className="text-[10px] text-slate-500 hover:text-rose-500 font-bold underline"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-[11px] text-slate-500 text-center">
                  Select a bed from the layout or submit an open application.
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-500" />
                  <span>Target Move-in Date *</span>
                </label>
                <input
                  type="date"
                  name="moveInDate"
                  required
                  className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-medium outline-none [color-scheme:light_dark]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Occupation / College
                </label>
                <input
                  type="text"
                  name="occupation"
                  placeholder="e.g. Software Engineer / Student"
                  className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Monthly Income (₹)</span>
                </label>
                <input
                  type="number"
                  name="monthlyIncome"
                  placeholder="e.g. 45000"
                  className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-orange-500" />
                  <span>Emergency Phone</span>
                </label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  placeholder="+91 98765 00000"
                  className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-medium outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold text-xs py-3 rounded-2xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPending ? "Submitting..." : "Submit Bed Application"}</span>
              </button>
            </form>
          )}

          {/* Form 2: Schedule a Tour */}
          {activeTab === "tour" && (
            <form
              action={async (formData) => {
                setIsPending(true);
                try {
                  await bookPropertyTourAction(formData);
                } finally {
                  setIsPending(false);
                }
              }}
              className="space-y-3 text-xs"
            >
              <input type="hidden" name="propertyId" value={property.id} />

              <input
                type="text"
                name="visitorName"
                required
                placeholder="Full Name *"
                className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-medium outline-none"
              />

              <input
                type="email"
                name="email"
                required
                placeholder="Email Address *"
                className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-medium outline-none"
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number (Optional)"
                className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-medium outline-none"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  name="tourDate"
                  required
                  className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-xl px-2.5 py-2 text-xs font-medium outline-none [color-scheme:light_dark]"
                />
                <select
                  name="timeSlot"
                  className="w-full bg-white/80 dark:bg-slate-900 border border-orange-200/60 dark:border-white/15 rounded-xl px-2 py-2 text-[11px] font-semibold outline-none cursor-pointer"
                >
                  <option value="10:00 AM - 12:00 PM">Morning</option>
                  <option value="02:00 PM - 04:00 PM">Afternoon</option>
                  <option value="05:00 PM - 07:00 PM">Evening</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white font-extrabold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Compass className="w-3.5 h-3.5 text-orange-400" />
                <span>{isPending ? "Booking..." : "Book Walkthrough"}</span>
              </button>
            </form>
          )}

          {/* Host Contact Footer */}
          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-xs space-y-1">
            <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">
              Verified Property Host
            </span>
            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.landlord.fullName || "Property Host"}</span>
            </p>
            <p className="text-slate-500 text-[11px]">{property.landlord.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}