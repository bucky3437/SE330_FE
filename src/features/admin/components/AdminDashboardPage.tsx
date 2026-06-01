"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { hasAdminAccessFromToken } from "@/features/auth/utils/authRoles";
import { getStaffDashboardSummary } from "@/features/circulation/services/circulationService";
import { StaffDashboardSummary } from "@/features/circulation/types/circulation.type";
import { CatalogShell, Notice, SecondaryAction } from "@/features/catalog/components/CatalogShell";

type Metric = {
  label: string;
  value: string;
  helper: string;
  tone: "blue" | "red" | "green" | "gold";
};

type ActionItem = {
  title: string;
  description: string;
  value: number;
  href: string;
  tone: "red" | "green" | "gold";
};

export function AdminDashboardPage() {
  const { accessToken, hasAdminAccess, refresh } = useAuth();
  const [summary, setSummary] = useState<StaffDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const canUseAdminDashboard = hasAdminAccess || hasAdminAccessFromToken(accessToken);
  const refreshAccessToken = useCallback(async () => (await refresh())?.accessToken ?? null, [refresh]);

  useEffect(() => {
    if (!canUseAdminDashboard) return;

    let isMounted = true;
    const loadingTimerId = window.setTimeout(() => {
      if (isMounted) {
        setIsLoading(true);
      }
    }, 0);

    getStaffDashboardSummary(accessToken, refreshAccessToken)
      .then((data) => {
        if (!isMounted) return;
        setSummary(data);
        setError("");
      })
      .catch((fetchError) => {
        if (!isMounted) return;
        setError(fetchError instanceof Error ? fetchError.message : "Could not load admin dashboard summary.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      window.clearTimeout(loadingTimerId);
    };
  }, [accessToken, canUseAdminDashboard, refreshAccessToken]);

  const metrics = useMemo<Metric[]>(
    () => [
      {
        label: "Active loans",
        value: formatNumber(summary?.activeLoans),
        helper: "Books currently checked out.",
        tone: "blue",
      },
      {
        label: "Overdue loans",
        value: formatNumber(summary?.overdueLoans),
        helper: "Loans needing staff follow-up.",
        tone: "red",
      },
      {
        label: "Ready holds",
        value: formatNumber(summary?.holdsReadyForPickup),
        helper: "Reservations waiting at pickup.",
        tone: "green",
      },
      {
        label: "Unpaid fines",
        value: formatNumber(summary?.unpaidFineCount),
        helper: `${formatCurrency(summary?.unpaidFineTotal)} total outstanding.`,
        tone: "gold",
      },
      {
        label: "Borrowed today",
        value: formatNumber(summary?.borrowedToday),
        helper: "Checkout activity for today.",
        tone: "blue",
      },
      {
        label: "Returned today",
        value: formatNumber(summary?.returnedToday),
        helper: "Check-in activity for today.",
        tone: "green",
      },
    ],
    [summary],
  );

  const actions = useMemo<ActionItem[]>(
    () => [
      {
        title: "Overdue follow-up",
        description: "Review overdue loans and contact borrowers before fines keep accumulating.",
        value: numberOf(summary?.overdueLoans),
        href: "/staff/loans",
        tone: "red",
      },
      {
        title: "Ready reservations",
        description: "Prepare assigned copies and complete pickup checkout when members arrive.",
        value: numberOf(summary?.holdsReadyForPickup),
        href: "/staff/holds",
        tone: "green",
      },
      {
        title: "Unpaid fine records",
        description: "Use borrower profiles to review balances and explain outstanding charges.",
        value: numberOf(summary?.unpaidFineCount),
        href: "/staff/members",
        tone: "gold",
      },
    ],
    [summary],
  );

  return (
    <CatalogShell
      protectedPage
      wide
      eyebrow="Admin dashboard"
      title="Library command center"
      description="A focused operations dashboard for circulation health, reservation pickup work, fines, and today's desk activity."
      actions={
        <>
          <SecondaryAction href="/admin/books">Admin catalog</SecondaryAction>
          <SecondaryAction href="/staff/circulation">Circulation desk</SecondaryAction>
          <SecondaryAction href="/staff/members">Borrowers</SecondaryAction>
        </>
      }
    >
      {!canUseAdminDashboard ? <Notice tone="error" message="This dashboard requires ADMIN access." /> : null}
      {error ? <div className="mb-5"><Notice tone="error" message={error} /></div> : null}

      <section className="rounded-3xl border border-[#DDE5F4] bg-[#F4F7FB] p-4 shadow-[0_24px_60px_rgba(7,7,88,0.10)] md:p-6">
        <div className="rounded-2xl border border-white bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#337AB7]">Pages / Dashboard</p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-[#000054]">Main Dashboard</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#333333]">
                Metrics first, then action items. This view keeps staff work visible without digging through tables.
              </p>
            </div>
            <GeneratedAt value={summary?.generatedAt} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} isLoading={isLoading} />
          ))}
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-white bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#337AB7]">Action Center</p>
                <h3 className="mt-2 text-xl font-bold text-[#000054]">What needs attention</h3>
              </div>
              <Link href="/staff/loans" className="text-sm font-bold text-[#E60028] transition hover:text-[#000054]">
                Open loan monitor &gt;
              </Link>
            </div>
            <div className="mt-5 grid gap-3">
              {actions.map((item) => (
                <ActionCard key={item.title} item={item} />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#337AB7]">Today report</p>
                <h3 className="mt-2 text-xl font-bold text-[#000054]">Desk activity</h3>
              </div>
              <span className="rounded-full border border-[#DDE5F4] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#337AB7]">
                Live
              </span>
            </div>
            <div className="mt-6 grid gap-4">
              <ProgressRow label="Borrowed today" value={numberOf(summary?.borrowedToday)} max={maxActivity(summary)} color="#337AB7" />
              <ProgressRow label="Returned today" value={numberOf(summary?.returnedToday)} max={maxActivity(summary)} color="#28A745" />
              <ProgressRow label="Ready holds" value={numberOf(summary?.holdsReadyForPickup)} max={maxActivity(summary)} color="#D8B400" />
              <ProgressRow label="Overdue loans" value={numberOf(summary?.overdueLoans)} max={maxActivity(summary)} color="#E60028" />
            </div>
          </section>
        </div>

        <section className="mt-5 rounded-2xl border border-white bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-[#000054]">Admin shortcuts</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ShortcutCard title="Manage catalog" description="Edit metadata, inventory, and physical copies." href="/admin/books" />
            <ShortcutCard title="Category taxonomy" description="Maintain catalog classification." href="/admin/categories" />
            <ShortcutCard title="Borrower profiles" description="Inspect loans, holds, fines, and account status." href="/staff/members" />
            <ShortcutCard title="Import jobs" description="Review CSV import progress and errors." href="/staff/imports" />
          </div>
        </section>
      </section>
    </CatalogShell>
  );
}

function MetricCard({ metric, isLoading }: { metric: Metric; isLoading: boolean }) {
  const toneClass = {
    blue: "text-[#337AB7] bg-[#337AB7]/10",
    red: "text-rose-700 bg-rose-50",
    green: "text-emerald-700 bg-emerald-50",
    gold: "text-yellow-700 bg-yellow-50",
  }[metric.tone];

  return (
    <article className="group rounded-2xl border border-white bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#8A94AD]">{metric.label}</p>
          <p className="mt-2 font-serif text-3xl font-bold text-[#000054]">{isLoading ? "..." : metric.value}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-2xl text-sm font-black ${toneClass}`}>
          {metric.label.slice(0, 1)}
        </span>
      </div>
      <p className="mt-3 text-xs font-semibold leading-5 text-[#333333]/75">{metric.helper}</p>
    </article>
  );
}

function ActionCard({ item }: { item: ActionItem }) {
  const toneClass = {
    red: "border-l-[#E60028] bg-rose-50",
    green: "border-l-emerald-500 bg-emerald-50",
    gold: "border-l-yellow-500 bg-yellow-50",
  }[item.tone];

  return (
    <Link
      href={item.href}
      className={`group block rounded-2xl border border-[#E6ECF6] border-l-4 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md ${toneClass}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-bold text-[#000054] transition group-hover:text-[#337AB7]">{item.title}</h4>
          <p className="mt-1 text-sm leading-6 text-[#333333]">{item.description}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-[#000054] shadow-sm">{item.value}</span>
      </div>
    </Link>
  );
}

function ProgressRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const width = `${Math.max(4, Math.round((value / max) * 100))}%`;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-bold text-[#000054]">{label}</span>
        <span className="font-semibold text-[#333333]/75">{value.toLocaleString()}</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#E6ECF6]">
        <div className="h-full rounded-full transition-all duration-500" style={{ width, backgroundColor: color }} />
      </div>
    </div>
  );
}

function ShortcutCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-[#E6ECF6] bg-[#F8FAFE] p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md">
      <p className="font-bold text-[#000054] transition group-hover:text-[#337AB7]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#333333]">{description}</p>
      <span className="mt-3 inline-flex text-sm font-bold text-[#E60028] transition-transform duration-300 group-hover:translate-x-1">Open &gt;</span>
    </Link>
  );
}

function GeneratedAt({ value }: { value?: string }) {
  if (!value) {
    return <span className="rounded-full border border-[#DDE5F4] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#333333]/70">Waiting for data</span>;
  }

  return <span className="rounded-full border border-[#DDE5F4] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#337AB7]">{formatDateTime(value)}</span>;
}

function maxActivity(summary: StaffDashboardSummary | null) {
  return Math.max(
    numberOf(summary?.borrowedToday),
    numberOf(summary?.returnedToday),
    numberOf(summary?.holdsReadyForPickup),
    numberOf(summary?.overdueLoans),
    1,
  );
}

function numberOf(value?: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatNumber(value?: number) {
  return numberOf(value).toLocaleString();
}

function formatCurrency(value?: number) {
  return typeof value === "number" ? value.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "$0.00";
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
