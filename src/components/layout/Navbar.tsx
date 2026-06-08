"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { publicNavItems } from "@/constants/nav-items";
import { useAuth } from "@/features/auth/context/AuthContext";
import { BrandMark } from "./BrandMark";

type TopNavItem = {
  label: string;
  href: string;
  originalHref?: string;
};

export function Navbar() {
  const {
    currentUser,
    hasAdminAccess,
    hasStaffAccess,
    isAuthenticated,
    isInitializing,
    logout,
  } = useAuth();
  const pathname = usePathname();
  const staffBooksHref = hasAdminAccess ? "/admin/books" : "/staff/books";
  const staffNavItems: TopNavItem[] = [
    ...(hasAdminAccess ? [{ label: "Dashboard", href: "/admin/dashboard" }] : []),
    { label: "Books", href: staffBooksHref, originalHref: "/books" },
    { label: "Borrowing Guide", href: "/borrowing-guide" },
    { label: "Library Notices", href: "/notices" },
    { label: "About", href: "/about" },
    { label: "Circulation", href: "/staff/circulation" },
    { label: "Borrowers", href: "/staff/members" },
  ];
  const topNavItems: TopNavItem[] = hasStaffAccess
    ? staffNavItems
    : publicNavItems.map((item) => ({ ...item, originalHref: item.href }));

  return (
    <header
      className="sticky inset-x-0 top-0 z-30 border-b border-[#EDEDF2] bg-white text-[#111827] shadow-[0_12px_30px_rgba(7,7,88,0.12)]"
    >
      <nav className="mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between gap-5 px-5 py-3 lg:px-8">
        <BrandMark tone="dark" />
        <div className="hidden items-center gap-1 lg:flex">
          {topNavItems.map((item) => {
            const originalHref = item.originalHref ?? item.href;
            const isActive = isActiveNavItem(pathname, originalHref, item.href, hasStaffAccess);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`group relative rounded-full px-3 py-2 text-sm font-semibold text-[#111827] transition-colors duration-150 hover:bg-black/[0.06] hover:text-black overflow-visible ${
                  isActive ? "bg-black/[0.06] text-black" : ""
                }`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#E60028] transition-transform duration-200 ${
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          {isInitializing ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-[#EDEDF2]" aria-label="Checking session" />
          ) : isAuthenticated ? (
            <UserMenu
              currentUser={currentUser}
              hasAdminAccess={hasAdminAccess}
              hasStaffAccess={hasStaffAccess}
              onLogout={() => logout()}
            />
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-semibold text-[#111827] transition-colors duration-75 hover:bg-black/[0.06] hover:text-black"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-[#E60028] to-[#c90022] px-5 py-2 text-sm font-bold text-white shadow-lg shadow-[#E60028]/25 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[#E60028]/35"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function isActiveNavItem(pathname: string, originalHref: string, resolvedHref: string, hasStaffAccess: boolean) {
  if (pathname === "/" || pathname === "") return false;

  if (originalHref === "/books" && hasStaffAccess) {
    return pathname.startsWith("/staff/books") || pathname.startsWith("/admin/books") || pathname.startsWith("/books");
  }

  if (originalHref === "/user/holds") {
    return pathname.startsWith("/user/holds");
  }

  if (originalHref === "/ebook-catalog") {
    return pathname.startsWith("/ebook-catalog") || pathname.startsWith("/my-ebooks");
  }

  return pathname === resolvedHref || pathname.startsWith(`${resolvedHref}/`);
}

function UserMenu({
  currentUser,
  hasAdminAccess,
  hasStaffAccess,
  onLogout,
}: {
  currentUser: { fullName?: string; role?: string } | null;
  hasAdminAccess: boolean;
  hasStaffAccess: boolean;
  onLogout: () => void;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        aria-label="Open user menu"
        className="grid h-11 w-11 place-items-center rounded-full border border-[#EDEDF2] bg-white text-black shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-black/20 hover:shadow-[0_12px_28px_rgba(17,24,39,0.14)] focus:outline-none focus:ring-4 focus:ring-black/10"
      >
        <svg
          aria-hidden="true"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.9"
          viewBox="0 0 24 24"
        >
          <path d="M20 21a8 8 0 0 0-16 0" />
          <path d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
        </svg>
      </button>

      <div className="invisible absolute right-0 top-[calc(100%+12px)] w-64 translate-y-2 rounded-2xl border border-[#EDEDF2] bg-white p-2 opacity-0 shadow-[0_24px_60px_rgba(7,7,88,0.16)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="px-3 py-2">
          <p className="text-xs font-bold uppercase tracking-wide text-black/70">Account</p>
          <p className="mt-1 text-sm font-bold text-black">{currentUser?.fullName || "The Athenaeum member"}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#333333]/70">{currentUser?.role || "Member"}</p>
        </div>
        <Link
          href="/profile"
          className="mt-1 flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-[#111827] transition hover:bg-black/[0.06] hover:text-black"
        >
          My profile
          <span aria-hidden="true">&gt;</span>
        </Link>
        {!hasStaffAccess ? (
          <Link
            href="/user/loans"
            className="mt-1 flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-[#111827] transition hover:bg-black/[0.06] hover:text-black"
          >
            My loans
            <span aria-hidden="true">&gt;</span>
          </Link>
        ) : null}
        {!hasStaffAccess ? (
          <Link
            href="/user/holds"
            className="mt-1 flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-[#111827] transition hover:bg-black/[0.06] hover:text-black"
          >
            My holds
            <span aria-hidden="true">&gt;</span>
          </Link>
        ) : null}
        {!hasStaffAccess ? (
          <Link
            href="/my-ebooks"
            className="mt-1 flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-[#111827] transition hover:bg-black/[0.06] hover:text-black"
          >
            My E-Books
            <span aria-hidden="true">&gt;</span>
          </Link>
        ) : null}
        {hasStaffAccess ? (
          <>
            <div className="my-2 h-px bg-[#EDEDF2]" />
            <Link
              href="/staff/circulation"
              className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-[#111827] transition hover:bg-black/[0.06] hover:text-black"
            >
              Circulation
              <span aria-hidden="true">&gt;</span>
            </Link>
            <Link
              href="/staff/loans"
              className="mt-1 flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-[#111827] transition hover:bg-black/[0.06] hover:text-black"
            >
              Active loans
              <span aria-hidden="true">&gt;</span>
            </Link>
            <Link
              href="/staff/holds"
              className="mt-1 flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-[#111827] transition hover:bg-black/[0.06] hover:text-black"
            >
              Holds
              <span aria-hidden="true">&gt;</span>
            </Link>
            <Link
              href="/staff/books/import"
              className="mt-1 flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-[#111827] transition hover:bg-black/[0.06] hover:text-black"
            >
              Import CSV
              <span aria-hidden="true">&gt;</span>
            </Link>
          </>
        ) : null}
        {hasAdminAccess ? (
          <>
            <div className="my-2 h-px bg-[#EDEDF2]" />
            <Link
              href="/admin/dashboard"
              className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-[#E60028] transition hover:bg-[#E60028]/8"
            >
              Admin dashboard
              <span aria-hidden="true">&gt;</span>
            </Link>
            <Link
              href="/admin/books"
              className="mt-1 flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-[#E60028] transition hover:bg-[#E60028]/8"
            >
              Admin books
              <span aria-hidden="true">&gt;</span>
            </Link>
            <Link
              href="/admin/categories"
              className="mt-1 flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-[#E60028] transition hover:bg-[#E60028]/8"
            >
              Categories
              <span aria-hidden="true">&gt;</span>
            </Link>
          </>
        ) : null}
        <button
          type="button"
          className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-bold text-[#E60028] transition hover:bg-[#E60028]/8"
          onClick={onLogout}
        >
          Logout
          <span aria-hidden="true">&gt;</span>
        </button>
      </div>
    </div>
  );
}
