"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@/components/ClerkAuth";
import { useTheme } from "@/components/ThemeProvider";
import {
  Building2,
  Home,
  HelpCircle,
  ListFilter,
  Info,
  MapPin,
  Bell,
  Receipt,
  X,
  Menu,
  Sparkles,
  LayoutDashboard,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";

const POPULAR_CITIES = [
  "Ahmedabad",
  "Bengaluru",
  "Delhi-NCR",
  "Mumbai",
  "Pune",
  "Surat",
  "Hyderabad",
  "Mohali",
];

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Explore", href: "/properties", icon: ListFilter },
  { name: "How It Works", href: "/#how-it-works", icon: Info },
  { name: "FAQ", href: "/#support", icon: HelpCircle },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // DOM element refs
  const headerRef = useRef<HTMLElement>(null);
  const cityFormRef = useRef<HTMLFormElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Synchronous interaction state refs (avoids stale closures)
  const isHoveredRef = useRef(false);
  const isFocusedRef = useRef(false);
  const isCityDropdownOpenRef = useRef(false);
  const isNotificationsOpenRef = useRef(false);
  const isMobileMenuOpenRef = useRef(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // React UI states
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState("");

  // Sync state to refs immediately
  useEffect(() => {
    isCityDropdownOpenRef.current = isCityDropdownOpen;
  }, [isCityDropdownOpen]);

  useEffect(() => {
    isNotificationsOpenRef.current = isNotificationsOpen;
  }, [isNotificationsOpen]);

  useEffect(() => {
    isMobileMenuOpenRef.current = isMobileMenuOpen;
  }, [isMobileMenuOpen]);

  /**
   * Smart Interactivity Guard:
   * Returns true if user is hovering, focused/typing, or has any menu open.
   */
  const checkIsInteracting = useCallback(() => {
    if (
      isCityDropdownOpenRef.current ||
      isNotificationsOpenRef.current ||
      isMobileMenuOpenRef.current
    ) {
      return true;
    }

    if (headerRef.current) {
      // Native DOM check for hover and keyboard/input focus
      if (headerRef.current.matches(":hover")) return true;
      if (headerRef.current.matches(":focus-within")) return true;
    }

    return isHoveredRef.current || isFocusedRef.current;
  }, []);

  const clearTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(
    (delay = 3000) => {
      clearTimer();
      hideTimerRef.current = setTimeout(() => {
        // Guard check: do NOT hide if the user is interacting
        if (checkIsInteracting()) {
          return;
        }
        setIsVisible(false);
      }, delay);
    },
    [clearTimer, checkIsInteracting]
  );

  const showNavbar = useCallback(() => {
    setIsVisible(true);
    clearTimer();
  }, [clearTimer]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen to window scroll (uses empty dependency array to prevent timer loops)
  useEffect(() => {
    const handleScroll = () => {
      showNavbar();
      if (!checkIsInteracting()) {
        scheduleHide(3000);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    scheduleHide(3000); // Initial 3-second countdown on page load

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimer();
    };
  }, [showNavbar, scheduleHide, checkIsInteracting, clearTimer]);

  // Show navbar when navigating to a new route
  useEffect(() => {
    showNavbar();
    scheduleHide(3000);
  }, [pathname, showNavbar, scheduleHide]);

  // Handle clicks outside of dropdown menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (cityFormRef.current && !cityFormRef.current.contains(target)) {
        setIsCityDropdownOpen(false);
        isCityDropdownOpenRef.current = false;
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setIsNotificationsOpen(false);
        isNotificationsOpenRef.current = false;
      }

      setTimeout(() => {
        if (!checkIsInteracting()) {
          scheduleHide(3000);
        }
      }, 100);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [checkIsInteracting, scheduleHide]);

  // Mouse hover event handlers
  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    showNavbar();
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    if (!checkIsInteracting()) {
      scheduleHide(3000);
    }
  };

  // Keyboard/input focus event handlers
  const handleFocus = () => {
    isFocusedRef.current = true;
    showNavbar();
  };

  const handleBlur = (e: React.FocusEvent) => {
    // If focus is still within the header (e.g. tabbed to another button), stay active
    if (headerRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    isFocusedRef.current = false;
    if (!checkIsInteracting()) {
      scheduleHide(3000);
    }
  };

  const handleCitySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsCityDropdownOpen(false);
    isCityDropdownOpenRef.current = false;

    if (cityQuery.trim()) {
      router.push(`/properties?city=${encodeURIComponent(cityQuery.trim())}`);
    } else {
      router.push("/properties");
    }

    scheduleHide(3000);
  };

  const filteredCities = POPULAR_CITIES.filter((city) =>
    city.toLowerCase().includes(cityQuery.toLowerCase().trim())
  );

  if (!mounted) {
    return (
      <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="w-full max-w-5xl h-14 rounded-full bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/20" />
      </div>
    );
  }

  return (
    <header
      ref={headerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={`fixed top-4 inset-x-0 z-50 flex justify-center px-4 transition-all duration-500 ease-in-out ${
        isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "-translate-y-16 opacity-0 pointer-events-none"
      }`}
    >
      {/* Floating Island Shell */}
      <div className="liquid-nav w-full max-w-5xl h-14 rounded-full flex items-center justify-between px-3 sm:px-4">
        <div className="liquid-glare" />

        {/* 1. Brand Logo & City Input */}
        <div className="flex items-center gap-3 relative z-10">
          <Link href="/" className="flex items-center gap-2 shrink-0 pl-1">
            <div className="p-1.5 rounded-full bg-gradient-to-tr from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white shadow-md">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-base font-black text-slate-900 dark:text-white tracking-tight hidden xs:inline-block">
              Nest<span className="text-orange-500 dark:text-rose-400">Flow</span>
            </span>
          </Link>

          {/* Quick City Pill */}
          <form
            ref={cityFormRef}
            onSubmit={handleCitySubmit}
            className="relative hidden lg:block"
          >
            <div className="flex items-center gap-1.5 bg-white/70 dark:bg-white/[0.06] hover:bg-white/90 dark:hover:bg-white/[0.1] border border-orange-200/50 dark:border-white/10 px-3 py-1 rounded-full shadow-xs transition-colors">
              <MapPin className="w-3 h-3 text-orange-500 dark:text-rose-400 shrink-0" />
              <input
                type="text"
                value={cityQuery}
                onChange={(e) => {
                  setCityQuery(e.target.value);
                  setIsCityDropdownOpen(true);
                  showNavbar();
                }}
                onFocus={() => {
                  setIsCityDropdownOpen(true);
                  showNavbar();
                }}
                placeholder="City..."
                className="bg-transparent text-[11px] font-semibold text-slate-800 dark:text-white outline-none w-20 lg:w-24 placeholder:text-slate-500"
              />
              {cityQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setCityQuery("");
                    router.push("/properties");
                  }}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {isCityDropdownOpen && (
              <div className="absolute top-full left-0 mt-2.5 w-52 bg-white/95 dark:bg-[#0f111e]/95 backdrop-blur-3xl border border-orange-100 dark:border-white/15 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[9px] font-black uppercase text-slate-400 px-3 py-1 block tracking-wider">
                  Popular Cities
                </span>
                <div className="space-y-0.5 max-h-44 overflow-y-auto">
                  {filteredCities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setCityQuery(city);
                        setIsCityDropdownOpen(false);
                        isCityDropdownOpenRef.current = false;
                        router.push(`/properties?city=${encodeURIComponent(city)}`);
                        scheduleHide(3000);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-white/10 flex items-center justify-between transition-colors"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* 2. Navigation Items */}
        <nav
          className="hidden sm:flex items-center gap-1 relative z-10"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {NAV_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isHoveredItem = hoveredIdx === idx;

            return (
              <Link
                key={item.name}
                href={item.href}
                onMouseEnter={() => setHoveredIdx(idx)}
                className={`relative px-4 py-2 text-xs font-bold rounded-full flex items-center gap-1.5 select-none transition-colors duration-200 ${
                  isActive || isHoveredItem
                    ? "text-slate-950 dark:text-white dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                {(isActive || isHoveredItem) && <span className="liquid-pill" />}
                <Icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* 3. Right Controls */}
        <div className="flex items-center gap-2 relative z-10">
          {/* Day / Night Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="relative w-8 h-8 rounded-full bg-white/70 dark:bg-white/[0.08] hover:bg-white dark:hover:bg-white/[0.14] border border-orange-200/50 dark:border-white/10 flex items-center justify-center cursor-pointer shadow-xs transition-transform duration-200 hover:scale-105"
            title="Toggle Theme"
            aria-label="Toggle theme"
          >
            <Sun className="sun absolute w-4 h-4 text-amber-500" />
            <Moon className="moon absolute w-4 h-4 text-indigo-400" />
          </button>

          {/* Notifications Dropdown */}
          <SignedIn>
            <div ref={notificationsRef} className="relative">
              <button
                onClick={() => {
                  const nextState = !isNotificationsOpen;
                  setIsNotificationsOpen(nextState);
                  isNotificationsOpenRef.current = nextState;
                  setIsCityDropdownOpen(false);
                  isCityDropdownOpenRef.current = false;
                  showNavbar();
                }}
                className="w-8 h-8 rounded-full bg-white/70 dark:bg-white/[0.08] hover:bg-white dark:hover:bg-white/[0.14] border border-orange-200/50 dark:border-white/10 flex items-center justify-center relative cursor-pointer transition-colors"
                title="Notifications"
              >
                <Bell className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-orange-500 dark:bg-rose-500 rounded-full" />
              </button>

              {isNotificationsOpen && (
                <div className="absolute top-full right-0 mt-2.5 w-72 bg-white/95 dark:bg-[#0f111e]/95 backdrop-blur-3xl border border-orange-100 dark:border-white/15 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-orange-100 dark:border-white/10 mb-3">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Notifications
                    </span>
                    <span className="text-[9px] bg-orange-100 dark:bg-rose-500/20 text-orange-700 dark:text-rose-300 font-bold px-2 py-0.5 rounded-full">
                      2 New
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-orange-50/50 dark:bg-white/[0.03] rounded-xl border border-orange-100/60 dark:border-white/5 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <Receipt className="w-3.5 h-3.5 text-emerald-500" /> Rent Invoice Status
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Monthly invoice ready for review.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SignedIn>

          {/* Signed Out CTA */}
          <SignedOut>
            <Link
              href="/login"
              className="px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-3.5 py-1 text-xs font-extrabold bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white rounded-full shadow-md hover:scale-105 transition-all flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-100" /> Join
            </Link>
          </SignedOut>

          {/* Signed In Dashboard */}
          <SignedIn>
            <Link
              href="/onboarding"
              className="px-3.5 py-1 text-xs font-extrabold bg-slate-900 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 text-white rounded-full flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 border border-transparent dark:border-white/10"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-300 dark:text-rose-400" /> Dashboard
            </Link>
            <div className="pl-1 border-l border-orange-200/60 dark:border-white/10 flex items-center">
              <UserButton />
            </div>
          </SignedIn>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => {
              const nextState = !isMobileMenuOpen;
              setIsMobileMenuOpen(nextState);
              isMobileMenuOpenRef.current = nextState;
              showNavbar();
            }}
            className="sm:hidden p-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-white/70 dark:bg-white/[0.06] border border-orange-200/50 dark:border-white/10 rounded-full transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 4. Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="sm:hidden fixed top-20 inset-x-4 bg-white/95 dark:bg-[#0f111e]/95 backdrop-blur-3xl border border-orange-100 dark:border-white/15 rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-top-3 duration-200 z-50">
          <form onSubmit={handleCitySubmit} className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-orange-50/50 dark:bg-white/[0.06] border border-orange-200/50 dark:border-white/10 rounded-full px-3 py-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <input
                type="text"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder="Search city name..."
                className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white outline-none w-full"
              />
            </div>
            <button
              type="submit"
              onClick={() => {
                setIsMobileMenuOpen(false);
                isMobileMenuOpenRef.current = false;
              }}
              className="bg-gradient-to-r from-orange-400 to-sky-500 text-white font-bold text-xs px-4 py-1.5 rounded-full"
            >
              Go
            </button>
          </form>

          <hr className="border-orange-100 dark:border-white/10" />

          <nav className="flex flex-col gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    isMobileMenuOpenRef.current = false;
                    scheduleHide(3000);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-orange-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-orange-500" /> {item.name}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}