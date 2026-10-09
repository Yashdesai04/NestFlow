"use client";

import { useState } from "react";
import Link from "next/link";
import { createPropertyAction } from "./actions";
import {
  ArrowLeft,
  Building2,
  MapPin,
  IndianRupee,
  Bed,
  Plus,
  Trash2,
  Sparkles,
  Send,
  Image as ImageIcon,
} from "lucide-react";

const AMENITY_OPTIONS = [
  "High-Speed Wi-Fi",
  "Air Conditioning (AC)",
  "Mess Food Included",
  "Daily Housekeeping",
  "Laundry / Washing Machine",
  "Power Backup / Inverter",
  "24/7 CCTV & Security",
  "Geyser / Hot Water",
  "Two-Wheeler Parking",
  "Four-Wheeler Parking",
  "Attached Washroom",
  "RO Drinking Water",
  "Elevator / Lift",
  "Conference Room",
];

interface RoomConfig {
  roomNumber: string;
  roomType: string;
  bedsCount: number;
  bedPrice: string;
}

export default function NewPropertyPage() {
  const [isPending, setIsPending] = useState(false);
  const [propertyType, setPropertyType] = useState<"PG" | "HOSTEL" | "FLAT" | "HOUSE" | "OFFICE">("PG");
  const [genderPolicy, setGenderPolicy] = useState<"BOYS_ONLY" | "GIRLS_ONLY" | "CO_ED" | "FAMILY_ONLY">("CO_ED");
  const [targetAudience, setTargetAudience] = useState<"STUDENTS" | "WORKING_PROFESSIONALS" | "FAMILY" | "ALL">("ALL");

  const isBedLevel = propertyType === "PG" || propertyType === "HOSTEL";

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "High-Speed Wi-Fi",
    "24/7 CCTV & Security",
  ]);

  const [rooms, setRooms] = useState<RoomConfig[]>([
    { roomNumber: "101", roomType: "Double Sharing", bedsCount: 2, bedPrice: "8500" },
    { roomNumber: "102", roomType: "Triple Sharing", bedsCount: 3, bedPrice: "7500" },
  ]);

  const toggleAmenity = (item: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const addRoom = () => {
    const nextRoomNum = String(100 + rooms.length + 1);
    setRooms((prev) => [
      ...prev,
      { roomNumber: nextRoomNum, roomType: "Double Sharing", bedsCount: 2, bedPrice: "8500" },
    ]);
  };

  const removeRoom = (index: number) => {
    setRooms((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRoom = (index: number, field: keyof RoomConfig, value: any) => {
    setRooms((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-24 pt-24 sm:pt-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/15 via-amber-300/15 to-sky-400/15 dark:from-rose-600/15 dark:via-purple-600/10 dark:to-indigo-600/15 rounded-full blur-[160px] pointer-events-none -z-0" />

      <main className="max-w-4xl mx-auto relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/landlord"
            className="p-2.5 rounded-2xl bg-white/80 dark:bg-white/10 border border-orange-200/60 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-rose-400 transition shadow-xs flex items-center gap-2 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-rose-500/15 border border-orange-200/60 dark:border-rose-500/30 text-orange-700 dark:text-rose-400 text-[11px] font-black uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Property Publisher</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            List New Property
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            Publish Bed-Level rentals (PG/Hostel) or Full-Unit assets (Flat, House, Office).
          </p>
        </div>

        <form
          action={async (formData) => {
            setIsPending(true);
            try {
              formData.set("propertyType", propertyType);
              formData.set("genderPolicy", genderPolicy);
              formData.set("targetAudience", targetAudience);
              if (isBedLevel) {
                formData.set("roomsJson", JSON.stringify(rooms));
              }
              selectedAmenities.forEach((a) => formData.append("amenities", a));
              
              // Match the imported function name:
              await createPropertyAction(formData);
            } catch (err: any) {
              alert(err.message || "Failed to create property.");
            } finally {
              setIsPending(false);
            }
          }}
          className="space-y-8"
        >
          {/* 1. Category & Policy Setup */}
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-orange-100 dark:border-white/10 pb-4">
              <Building2 className="w-4 h-4 text-orange-500" />
              <h2 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider">
                1. Property Type & Audience Rules
              </h2>
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Property Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {(
                  [
                    { id: "PG", label: "Co-Living PG", sub: "Bed-Level" },
                    { id: "HOSTEL", label: "Student Hostel", sub: "Bed-Level" },
                    { id: "FLAT", label: "Apartment / Flat", sub: "Full Unit" },
                    { id: "HOUSE", label: "Independent House", sub: "Full Unit" },
                    { id: "OFFICE", label: "Office Space", sub: "Full Unit" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPropertyType(t.id)}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      propertyType === t.id
                        ? "bg-gradient-to-r from-orange-500/15 to-amber-500/15 border-orange-500 text-orange-700 dark:text-rose-300 shadow-xs"
                        : "bg-white/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    <span className="text-xs font-black">{t.label}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                      {t.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Policy */}
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Gender / Occupancy Policy *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(
                  [
                    { id: "CO_ED", label: "Co-Ed / Unisex" },
                    { id: "BOYS_ONLY", label: "Boys Only" },
                    { id: "GIRLS_ONLY", label: "Girls Only" },
                    { id: "FAMILY_ONLY", label: "Family Only" },
                  ] as const
                ).map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGenderPolicy(g.id)}
                    className={`p-3 rounded-2xl border text-center font-bold text-xs transition cursor-pointer ${
                      genderPolicy === g.id
                        ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                        : "bg-white/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Target Audience *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(
                  [
                    { id: "ALL", label: "All / Open" },
                    { id: "STUDENTS", label: "Students Only" },
                    { id: "WORKING_PROFESSIONALS", label: "Working Professionals" },
                    { id: "FAMILY", label: "Families Only" },
                  ] as const
                ).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setTargetAudience(a.id)}
                    className={`p-3 rounded-2xl border text-center font-bold text-xs transition cursor-pointer ${
                      targetAudience === a.id
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm"
                        : "bg-white/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Basic Information & Pricing */}
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-orange-100 dark:border-white/10 pb-4">
              <IndianRupee className="w-4 h-4 text-emerald-500" />
              <h2 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider">
                2. Property Profile & Base Pricing
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder={
                    isBedLevel
                      ? "e.g. NestFlow Grand Co-Living PG"
                      : "e.g. 3BHK Luxury High-Rise Apartment"
                  }
                  className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-4 py-2.5 text-xs font-medium outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBedLevel ? "Default Rent / Bed (₹/mo) *" : "Full Unit Rent (₹/mo) *"}
                </label>
                <input
                  type="number"
                  name="priceMonthly"
                  required
                  step="any"
                  placeholder="e.g. 8500"
                  className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-4 py-2.5 text-xs font-medium outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  name="securityDeposit"
                  step="any"
                  placeholder="e.g. 15000"
                  className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-4 py-2.5 text-xs font-medium outline-none focus:border-orange-500 transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
                  <span>Main Showcase Image URL</span>
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-4 py-2.5 text-xs font-medium outline-none focus:border-orange-500 transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  About the Property
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Highlight key features, connectivity to IT parks/colleges, food quality, and house policies..."
                  className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl p-4 text-xs font-medium outline-none focus:border-orange-500 transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Address & Location */}
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-orange-100 dark:border-white/10 pb-4">
              <MapPin className="w-4 h-4 text-orange-500" />
              <h2 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider">
                3. Location & Address
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="e.g. 402, Ring Road Plaza, Near Metro Station"
                  className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-4 py-2.5 text-xs font-medium outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="e.g. Surat"
                  className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-4 py-2.5 text-xs font-medium outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  placeholder="e.g. Gujarat"
                  className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-4 py-2.5 text-xs font-medium outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Postal Code *
                </label>
                <input
                  type="text"
                  name="zipCode"
                  required
                  placeholder="e.g. 395007"
                  className="w-full bg-white/80 dark:bg-white/[0.08] border border-orange-200/60 dark:border-white/15 rounded-2xl px-4 py-2.5 text-xs font-medium outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>
          </div>

          {/* 4. Amenities */}
          <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-orange-100 dark:border-white/10 pb-4">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider">
                4. Amenities & Inclusions ({selectedAmenities.length} Selected)
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {AMENITY_OPTIONS.map((item) => {
                const isSelected = selectedAmenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`p-3 rounded-2xl border text-left font-bold transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-orange-500/15 to-amber-500/15 border-orange-400 text-orange-700 dark:text-rose-300 shadow-xs"
                        : "bg-white/60 dark:bg-white/[0.02] border-slate-200/70 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    <span>{item}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? "bg-orange-500" : "bg-transparent border border-slate-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Room & Bed Inventory Builder (For PG & Hostels only) */}
          {isBedLevel && (
            <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-orange-100 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-sky-500" />
                  <h2 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider">
                    5. Room & Bed Inventory ({rooms.length} Rooms)
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={addRoom}
                  className="text-xs font-bold bg-orange-500/10 dark:bg-rose-500/15 text-orange-700 dark:text-rose-400 hover:bg-orange-500/20 border border-orange-200/60 dark:border-rose-500/30 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Room</span>
                </button>
              </div>

              <div className="space-y-3">
                {rooms.map((r, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-orange-100 dark:border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center"
                  >
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                        Room #
                      </label>
                      <input
                        type="text"
                        value={r.roomNumber}
                        onChange={(e) => updateRoom(index, "roomNumber", e.target.value)}
                        placeholder="e.g. 101"
                        className="w-full bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                        Sharing Type
                      </label>
                      <select
                        value={r.roomType}
                        onChange={(e) => updateRoom(index, "roomType", e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-2 text-xs font-semibold outline-none cursor-pointer"
                      >
                        <option value="Single Private">Single Private</option>
                        <option value="Double Sharing">Double Sharing</option>
                        <option value="Triple Sharing">Triple Sharing</option>
                        <option value="Four Sharing">Four Sharing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                        Beds Count
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={r.bedsCount}
                        onChange={(e) => updateRoom(index, "bedsCount", Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                          Rent/Bed (₹)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={r.bedPrice}
                          onChange={(e) => updateRoom(index, "bedPrice", e.target.value)}
                          placeholder="8500"
                          className="w-full bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                        />
                      </div>

                      {rooms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRoom(index)}
                          className="mt-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>
              {isPending
                ? "Publishing Property..."
                : isBedLevel
                ? "Publish Co-Living Inventory"
                : "Publish Full-Unit Listing"}
            </span>
          </button>
        </form>
      </main>
    </div>
  );
}