"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";

interface ListingImageSliderProps {
  images?: string[];
  title: string;
  isPG: boolean;
  vacantBeds?: number;
}

export function ListingImageSlider({
  images = [],
  title,
  isPG,
  vacantBeds,
}: ListingImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = images.length;

  const nextSlide = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-play slideshow every 2 seconds
  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 2000);

    return () => clearInterval(timer);
  }, [total]);

  if (!images || total === 0) {
    return (
      <div className="h-48 bg-slate-100 flex flex-col items-center justify-center text-slate-400 relative">
        <Building2 className="w-8 h-8 mb-1" />
        <span className="text-[10px] font-bold uppercase">No Photo Available</span>
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase text-white shadow-sm ${
            isPG ? "bg-purple-600" : "bg-blue-600"
          }`}
        >
          {isPG ? "PG / Co-Living" : "Full House"}
        </span>
      </div>
    );
  }

  return (
    <div className="h-48 bg-slate-900 relative overflow-hidden group select-none">
      {/* Display Image */}
      <img
        src={images[currentIndex]}
        alt={`${title} - image ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-all duration-500 ease-in-out"
      />

      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <span
          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase text-white shadow-md ${
            isPG ? "bg-purple-600" : "bg-blue-600"
          }`}
        >
          {isPG ? "PG / Co-Living" : "Full House"}
        </span>

        {isPG && vacantBeds !== undefined && (
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase bg-white/90 text-slate-900 shadow-md backdrop-blur-xs">
            {vacantBeds > 0 ? `${vacantBeds} Beds Vacant` : "Full"}
          </span>
        )}
      </div>

      {/* Hover Control Arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 p-1.5 rounded-full shadow-md transition opacity-0 group-hover:opacity-100 hover:scale-110 z-20 cursor-pointer"
            title="Previous Image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 p-1.5 rounded-full shadow-md transition opacity-0 group-hover:opacity-100 hover:scale-110 z-20 cursor-pointer"
            title="Next Image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Bottom Progress Dots */}
      {total > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx
                  ? "w-4 bg-white"
                  : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}