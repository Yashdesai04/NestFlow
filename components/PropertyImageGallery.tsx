"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  Pause,
  Play,
  Building2,
} from "lucide-react";

interface PropertyImageGalleryProps {
  images?: string[];
  title: string;
}

export function PropertyImageGallery({
  images = [],
  title,
}: PropertyImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Drag / Swipe Ref Tracking
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const total = images.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // 1. Auto-Play Timer (2 seconds per slide)
  useEffect(() => {
    if (!isAutoPlaying || isHovered || total <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 2000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, isHovered, total, nextSlide]);

  // 2. Mouse Drag & Touch Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    touchEndX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const distance = touchStartX.current - touchEndX.current;

    // Minimum swipe threshold of 40px
    if (distance > 40) {
      nextSlide();
    } else if (distance < -40) {
      prevSlide();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const distance = touchStartX.current - touchEndX.current;

    if (distance > 40) {
      nextSlide();
    } else if (distance < -40) {
      prevSlide();
    }
  };

  // Fallback state if property has no images
  if (!images || total === 0) {
    return (
      <div className="w-full h-64 sm:h-96 bg-slate-100 rounded-3xl border flex flex-col items-center justify-center text-slate-400 mb-8 shadow-inner">
        <Building2 className="w-10 h-10 mb-2 text-slate-300" />
        <span className="text-xs font-bold uppercase tracking-wider">
          No Photos Uploaded
        </span>
      </div>
    );
  }

  return (
    <div className="mb-8 space-y-3">
      {/* Main Image Slider Canvas */}
      <div
        className="relative w-full h-72 sm:h-[420px] rounded-3xl overflow-hidden bg-slate-900 shadow-md group select-none cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          isDragging.current = false;
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Main Display Photo */}
        <img
          src={images[currentIndex]}
          alt={`${title} - Photo ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-500 ease-in-out pointer-events-none"
        />

        {/* Gradient Overlay for controls visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20 pointer-events-none" />

        {/* Counter Badge */}
        <div className="absolute top-4 left-4 bg-slate-900/80 text-white text-[11px] font-extrabold px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 border border-white/10">
          <Camera className="w-3.5 h-3.5 text-blue-400" />
          <span>
            {currentIndex + 1} / {total}
          </span>
        </div>

        {/* Auto-play Toggle Button */}
        {total > 1 && (
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-md transition cursor-pointer border border-white/10"
            title={isAutoPlaying ? "Pause Auto-Slide" : "Play Auto-Slide"}
          >
            {isAutoPlaying && !isHovered ? (
              <Pause className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Play className="w-3.5 h-3.5 text-blue-400" />
            )}
          </button>
        )}

        {/* Previous & Next Control Arrows */}
        {total > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 p-2.5 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
              aria-label="Previous Photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 p-2.5 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
              aria-label="Next Photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Slide Progress Dots (Mobile) */}
        {total > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "w-6 bg-blue-500"
                    : "w-2 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails Row (Desktop & Tablet) */}
      {total > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {images.map((imgUrl, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-16 w-24 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                currentIndex === idx
                  ? "border-blue-600 ring-2 ring-blue-600/30 opacity-100 scale-105"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={imgUrl}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}