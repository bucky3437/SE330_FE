"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/context/AuthContext";

const popularSearches = ["Computer Science", "Database", "Java", "Finance", "English"];

export function HeroSearchSection() {
  const { hasAdminAccess, hasStaffAccess } = useAuth();
  const searchTarget = hasAdminAccess ? "/admin/books" : hasStaffAccess ? "/staff/books" : "/books";

  return (
    <section className="relative flex min-h-[calc(100vh-64px)] items-center overflow-hidden bg-black bg-[linear-gradient(rgba(0,0,0,0.32),rgba(0,0,0,0.32)),url('/image.png')] bg-cover bg-[center_42%] px-5 py-16 text-white md:bg-fixed lg:px-8 lg:py-24">
      {/* Enhanced gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(81,210,255,0.22),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_100%,rgba(230,0,40,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
      
      <div className="relative mx-auto max-w-7xl">
        <div className="relative max-w-5xl">
          {/* Enhanced title with text gradient */}
          <h1 className="animate-fade-up animate-delay-75 mt-6 max-w-3xl font-serif text-4xl font-bold leading-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] md:text-6xl">
            The Athenaeum
          </h1>
          <p className="animate-fade-up animate-delay-150 mt-5 max-w-2xl text-lg font-medium leading-8 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
            A modern space for knowledge discovery.
          </p>
          
          {/* Enhanced search form with better glass effect */}
          <form action={searchTarget} method="get" className="animate-fade-up animate-delay-225 mt-9 flex w-full max-w-5xl flex-col gap-3 rounded-2xl border border-white/30 bg-white/95 p-3 shadow-2xl backdrop-blur-lg sm:flex-row">
            <label className="sr-only" htmlFor="library-search">
              Search library catalogue
            </label>
            <input
              id="library-search"
              name="q"
              className="min-h-12 flex-1 rounded-lg border border-[#D9DCE8] bg-white px-5 text-base text-[#333333] outline-none transition-all duration-200 focus:border-2 focus:border-[#337AB7] focus:shadow-[0_0_0_4px_rgba(51,122,183,0.12)]"
              placeholder="Search by book title, author, ISBN or category..."
              type="search"
            />
            <button type="submit" className="min-h-12 rounded-full bg-gradient-to-r from-[#E60028] to-[#c90022] px-8 text-sm font-bold text-white shadow-lg shadow-[#E60028]/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#E60028]/40">
              Search
            </button>
          </form>
          
          {/* Enhanced popular searches */}
          <div className="animate-fade-up animate-delay-300 mt-6 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]">Popular searches:</span>
            {popularSearches.map((term) => (
              <Link 
                key={term} 
                href={`${searchTarget}?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-white/25 bg-black/40 px-3 py-2 font-semibold text-white shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:border-white/40 hover:bg-white/20 hover:text-[#51D2FF] hover:shadow-md"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
