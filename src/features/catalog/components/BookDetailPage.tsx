"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/features/auth/context/AuthContext";
import { createHold } from "@/features/circulation/services/circulationService";
import { Book } from "../types/catalog.type";
import { getBook } from "../services/catalogService";
import { authorLabel, availabilityLabel, availabilityTone, categoryLabel } from "./catalogHelpers";
import { CatalogShell, Notice } from "./CatalogShell";

export function BookDetailPage() {
  const params = useParams<{ bookId: string }>();
  const { accessToken, isAuthenticated, refresh } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isPlacingHold, setIsPlacingHold] = useState(false);
  const refreshAccessToken = useCallback(async () => (await refresh())?.accessToken ?? null, [refresh]);
  const hasAvailabilityCount = typeof book?.availableCopies === "number";
  const hasAvailableCopies = hasAvailabilityCount && Number(book?.availableCopies) > 0;
  const canPlaceHold = hasAvailabilityCount && Number(book?.availableCopies) <= 0;

  useEffect(() => {
    let isMounted = true;

    getBook(params.bookId)
      .then((data) => {
        if (!isMounted) return;
        setBook(data);
        setError("");
      })
      .catch((fetchError) => {
        if (!isMounted) return;
        setError(fetchError instanceof Error ? fetchError.message : "Could not load book details.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [params.bookId]);

  async function handlePlaceHold() {
    if (isPlacingHold) return;

    if (!isAuthenticated) {
      setError("Please log in before placing a hold.");
      return;
    }

    try {
      setIsPlacingHold(true);
      await createHold(params.bookId, accessToken, refreshAccessToken);
      setMessage("Hold was placed. You can track it in My Holds.");
      setError("");
    } catch (holdError) {
      setError(holdError instanceof Error ? holdError.message : "Could not place hold.");
    } finally {
      setIsPlacingHold(false);
    }
  }

  return (
    <CatalogShell
      eyebrow="Book detail"
      title={book?.title ?? "Library record"}
      description="Inspect metadata and availability for this title."
      actions={<AnimatedActionLink href="/books">Back to books</AnimatedActionLink>}
    >
      {message && (
        <div className="mb-5">
          <Notice tone="success" message={message} />
        </div>
      )}
      {error && (
        <div className="mb-5">
          <Notice tone="error" message={error} />
        </div>
      )}

      {isLoading ? (
        <BookDetailSkeleton />
      ) : book ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-xl border border-[#EDEDF2] bg-[#F8F9FA] p-6">
            <span className="rounded-full bg-[#000054]/8 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#000054]">
              {categoryLabel(book.category)}
            </span>
            <h2 className="mt-5 font-serif text-3xl font-bold text-[#000054]">{book.title}</h2>
            <p className="mt-3 text-[#333333]">by {(book.authors ?? []).map(authorLabel).join(", ") || "Unknown author"}</p>
            <div className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-[#E60028] ring-1 ring-[#EDEDF2]">
              ISBN {book.isbn}
            </div>
          </section>

          <section className="rounded-xl border border-[#EDEDF2] bg-white p-6">
            <h3 className="text-lg font-bold text-[#000054]">Availability</h3>
            <span className={`mt-4 inline-flex rounded-full px-4 py-2 text-sm font-bold ring-1 ${availabilityTone(book)}`}>
              {availabilityLabel(book)} copies available
            </span>
            {hasAvailableCopies ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 text-sm leading-6 text-emerald-900 shadow-sm">
                <p className="font-bold">Copies are available on the shelf.</p>
                <p className="mt-1 text-emerald-800">
                  Please visit the circulation desk to borrow this title. Holds are opened only when all copies are checked out.
                </p>
              </div>
            ) : canPlaceHold ? (
              <div className="mt-5 rounded-2xl border border-[#D9DCE8] bg-[#F8F9FA] p-5">
                <p className="text-sm font-bold text-[#000054]">All copies are currently checked out.</p>
                <p className="mt-1 text-sm leading-6 text-[#333333]">
                  Place a hold and we will reserve the next available copy for you.
                </p>
                <button
                  type="button"
                  onClick={handlePlaceHold}
                  disabled={isPlacingHold}
                  className="group relative mt-5 inline-flex w-full items-center justify-center overflow-hidden rounded-full bg-[#E60028] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#E60028]/20 outline-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#E60028]/30 active:translate-y-0 active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-[#E60028]/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                >
                  <span className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/25 opacity-0 transition-all duration-500 group-hover:left-[120%] group-hover:opacity-100" />
                  {isPlacingHold ? (
                    <span className="relative inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                      Placing hold...
                    </span>
                  ) : (
                    <span className="relative inline-flex items-center gap-2">
                      Place Hold
                      <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  )}
                </button>
                <Link
                  href="/user/holds"
                  className="group mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#D9DCE8] bg-white px-5 py-3 text-sm font-bold text-[#000054] outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-[#337AB7] hover:text-[#E60028] hover:shadow-lg hover:shadow-[#000054]/10 active:translate-y-0 active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-[#337AB7]/20"
                >
                  My Holds
                  <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-[#D9DCE8] bg-[#F8F9FA] p-5 text-sm leading-6 text-[#333333]">
                Availability is being verified. Please check with the circulation desk for the latest copy status.
              </div>
            )}
          </section>

          <section className="rounded-xl border border-[#EDEDF2] bg-white p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-[#000054]">Bibliographic details</h3>
            <dl className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                ["Published date", book.publishedDate || "N/A"],
                ["Language", book.language || "N/A"],
                ["Edition", book.edition || "N/A"],
                ["Total copies", String(book.totalCopies ?? 0)],
                ["Available copies", String(book.availableCopies ?? 0)],
                ["Category", categoryLabel(book.category)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[#EDEDF2] bg-[#F8F9FA] p-4">
                  <dt className="text-xs font-bold uppercase tracking-wide text-[#337AB7]">{label}</dt>
                  <dd className="mt-2 font-semibold text-[#111827]">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      ) : null}
    </CatalogShell>
  );
}

function AnimatedActionLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#D9DCE8] px-5 py-3 text-sm font-bold text-[#000054] outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-[#337AB7] hover:bg-white hover:text-[#E60028] hover:shadow-lg hover:shadow-[#000054]/10 active:translate-y-0 active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-[#337AB7]/20"
    >
      <span aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-x-1">
        ←
      </span>
      {children}
    </Link>
  );
}

function BookDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-xl border border-[#EDEDF2] bg-[#F8F9FA] p-6">
        <Skeleton variant="rectangular" className="h-6 w-32 rounded-full" />
        <Skeleton variant="text" className="mt-5 h-9 w-3/4" />
        <Skeleton variant="text" className="mt-3 h-5 w-1/2" />
        <Skeleton variant="rectangular" className="mt-6 h-8 w-40 rounded-full" />
      </section>

      <section className="rounded-xl border border-[#EDEDF2] bg-white p-6">
        <Skeleton variant="text" className="h-6 w-32" />
        <Skeleton variant="rectangular" className="mt-4 h-8 w-40 rounded-full" />
        <Skeleton variant="rectangular" className="mt-5 h-12 w-full rounded-full" />
        <Skeleton variant="rectangular" className="mt-3 h-12 w-full rounded-full" />
      </section>

      <section className="rounded-xl border border-[#EDEDF2] bg-white p-6 lg:col-span-2">
        <Skeleton variant="text" className="h-6 w-48" />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-[#EDEDF2] bg-[#F8F9FA] p-4">
              <Skeleton variant="text" className="h-3 w-24" />
              <Skeleton variant="text" className="mt-2 h-5 w-32" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
