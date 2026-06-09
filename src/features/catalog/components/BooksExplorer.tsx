"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BookCardSkeleton } from "@/components/ui/BookCardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Book, BookSearchParams, Category } from "../types/catalog.type";
import { getBooks, getCategories } from "../services/catalogService";
import { authorLabel, availabilityLabel, availabilityTone, bookIdOf, categoryLabel, entityIdOf } from "./catalogHelpers";
import { CatalogShell, Notice } from "./CatalogShell";

const BOOKS_PER_PAGE = "20";

type BooksExplorerProps = {
  initialQuery?: string;
};

function createBaseFilters(query = ""): BookSearchParams {
  return {
    q: query.trim(),
    page: "0",
    size: BOOKS_PER_PAGE,
    sort: "title,asc",
  };
}

export function BooksExplorer({ initialQuery = "" }: BooksExplorerProps) {
  const normalizedInitialQuery = initialQuery.trim();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<BookSearchParams>(() => createBaseFilters(normalizedInitialQuery));
  const [draftFilters, setDraftFilters] = useState<BookSearchParams>(() => createBaseFilters(normalizedInitialQuery));
  const [pageInfo, setPageInfo] = useState({ page: 0, totalElements: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const filterFormRef = useRef<HTMLFormElement | null>(null);
  const filterTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getBooks(filters), getCategories().catch(() => [])])
      .then(([bookPage, categoryList]) => {
        if (!isMounted) return;
        setBooks(bookPage.items);
        setPageInfo({
          page: bookPage.page ?? Number(filters.page ?? 0),
          totalElements: bookPage.totalElements ?? bookPage.items.length,
          totalPages: bookPage.totalPages ?? 1,
        });
        setCategories(categoryList);
        setError("");
      })
      .catch((fetchError) => {
        if (!isMounted) return;
        setError(fetchError instanceof Error ? fetchError.message : "Could not load books.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [filters]);

  useEffect(() => {
    if (filterTimerRef.current) {
      window.clearTimeout(filterTimerRef.current);
    }

    filterTimerRef.current = window.setTimeout(() => {
      setIsLoading(true);
      setFilters(draftFilters);
      filterTimerRef.current = null;
    }, 350);

    return () => {
      if (filterTimerRef.current) {
        window.clearTimeout(filterTimerRef.current);
        filterTimerRef.current = null;
      }
    };
  }, [draftFilters]);

  function buildFilters(form: HTMLFormElement): BookSearchParams {
    const formData = new FormData(form);

    return {
      q: String(formData.get("q") ?? ""),
      author: String(formData.get("author") ?? ""),
      categoryId: String(formData.get("categoryId") ?? ""),
      availableOnly: String(formData.get("availableOnly") ?? ""),
      language: String(formData.get("language") ?? ""),
      page: "0",
      size: BOOKS_PER_PAGE,
      sort: String(formData.get("sort") ?? "title,asc"),
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDraftFilters(buildFilters(event.currentTarget));
  }

  function handleFilterChange() {
    if (!filterFormRef.current) return;
    setDraftFilters(buildFilters(filterFormRef.current));
  }

  function handleResetFilters() {
    filterFormRef.current?.reset();
    setIsLoading(true);
    setDraftFilters({ page: "0", size: BOOKS_PER_PAGE, sort: "title,asc" });
    setFilters({ page: "0", size: BOOKS_PER_PAGE, sort: "title,asc" });
  }

  function handlePageChange(nextPage: number) {
    const page = Math.max(0, Math.min(nextPage, Math.max(pageInfo.totalPages - 1, 0)));

    if (filterTimerRef.current) {
      window.clearTimeout(filterTimerRef.current);
      filterTimerRef.current = null;
    }

    setIsLoading(true);
    setFilters((currentFilters) => ({
      ...currentFilters,
      page: String(page),
      size: BOOKS_PER_PAGE,
    }));
  }

  const activeFilters = [
    filters.q ? `Search: ${filters.q}` : "",
    filters.author ? `Author: ${filters.author}` : "",
    filters.categoryId ? `Category: ${categories.find((category) => entityIdOf(category) === filters.categoryId)?.name ?? filters.categoryId}` : "",
    filters.availableOnly ? "Available" : "",
    filters.language ? `Language: ${filters.language}` : "",
  ].filter(Boolean);
  const currentPage = Number(filters.page ?? pageInfo.page ?? 0);
  const totalPages = Math.max(pageInfo.totalPages || 1, 1);
  const paginationPages = buildPaginationPages(currentPage, totalPages);

  return (
    <CatalogShell
      wide
      eyebrow="Library catalog"
      title="Find your next source"
      description="Search public book records, filter by author or category, and check availability before you visit the library."
    >
      <form ref={filterFormRef} onSubmit={handleSubmit} onChange={handleFilterChange} className="rounded-2xl border border-[#EDEDF2] bg-white p-4 shadow-[0_16px_34px_rgba(7,7,88,0.08)]">
        <div className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-[minmax(320px,2fr)_minmax(160px,1fr)_minmax(140px,0.8fr)_minmax(140px,0.8fr)_minmax(130px,0.75fr)_minmax(130px,0.75fr)_90px] xl:items-center">
          <label className="relative min-w-0">
            <span className="sr-only">Search books</span>
            <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#337AB7]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
              </svg>
            </span>
            <input name="q" defaultValue={normalizedInitialQuery} placeholder="Search by title, author, ISBN..." className="h-14 w-full rounded-xl border border-[#D9DCE8] bg-[#F8F9FA] pl-11 pr-4 text-base outline-none transition focus:border-[#337AB7] focus:bg-white focus:shadow-[0_0_0_4px_rgba(51,122,183,0.12)]" />
          </label>
          <label className="min-w-0">
            <span className="sr-only">Author name</span>
            <input name="author" placeholder="Author name" className="h-14 w-full rounded-xl border border-[#D9DCE8] bg-[#F8F9FA] px-4 text-sm outline-none transition focus:border-[#337AB7] focus:bg-white focus:shadow-[0_0_0_4px_rgba(51,122,183,0.12)]" />
          </label>
          <label className="min-w-0">
            <span className="sr-only">Category</span>
            <select name="categoryId" className="h-14 w-full rounded-xl border border-[#D9DCE8] bg-[#F8F9FA] px-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-[#337AB7] focus:bg-white focus:shadow-[0_0_0_4px_rgba(51,122,183,0.12)]">
              <option value="">Category</option>
              {categories.map((category) => (
                <option key={entityIdOf(category)} value={entityIdOf(category)}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-0">
            <span className="sr-only">Availability</span>
            <select name="availableOnly" className="h-14 w-full rounded-xl border border-[#D9DCE8] bg-[#F8F9FA] px-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-[#337AB7] focus:bg-white focus:shadow-[0_0_0_4px_rgba(51,122,183,0.12)]">
              <option value="">Availability</option>
              <option value="true">Available</option>
            </select>
          </label>
          <label className="min-w-0">
            <span className="sr-only">Language</span>
            <input name="language" placeholder="Language" className="h-14 w-full rounded-xl border border-[#D9DCE8] bg-[#F8F9FA] px-4 text-sm outline-none transition focus:border-[#337AB7] focus:bg-white focus:shadow-[0_0_0_4px_rgba(51,122,183,0.12)]" />
          </label>
          <label className="min-w-0">
            <span className="sr-only">Sort by</span>
            <select name="sort" defaultValue="title,asc" className="h-14 w-full rounded-xl border border-[#D9DCE8] bg-[#F8F9FA] px-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-[#337AB7] focus:bg-white focus:shadow-[0_0_0_4px_rgba(51,122,183,0.12)]">
              <option value="title,asc">Sort A-Z</option>
              <option value="title,desc">Sort Z-A</option>
              <option value="publishedDate,desc">Newest</option>
            </select>
          </label>
          <button type="button" onClick={handleResetFilters} className="h-14 rounded-xl bg-[#000054] px-4 text-sm font-bold text-white shadow-lg shadow-[#000054]/15 transition hover:-translate-y-0.5 hover:bg-[#090970]">
            Reset
          </button>
        </div>
        {activeFilters.length ? (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-[#EDEDF2] pt-4" aria-label="Active filters">
            {activeFilters.map((filter) => (
              <span key={filter} className="rounded-full border border-[#B8D7F0] bg-[#EAF5FF] px-3 py-1.5 text-xs font-bold text-[#000054]">
                {filter}
              </span>
            ))}
          </div>
        ) : null}
      </form>

      {error && (
        <div className="mt-6">
          <Notice tone="error" message={error} />
        </div>
      )}

      {isLoading ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <BookCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {books.map((book) => (
            <Link
              key={bookIdOf(book) || book.isbn}
              href={`/books/${bookIdOf(book)}`}
              aria-label={`View details for ${book.title}`}
              className="group block overflow-hidden rounded-xl border border-[#EDEDF2] bg-white shadow-sm outline-none transition-all duration-300 hover:-translate-y-2 hover:border-[#337AB7]/40 hover:shadow-xl focus-visible:border-[#337AB7] focus-visible:shadow-[0_0_0_4px_rgba(51,122,183,0.16)]"
            >
              <article>
                <div className="relative overflow-hidden bg-gradient-mesh p-5 text-white">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#000054] via-[#337AB7] to-[#51D2FF] opacity-90" />
                  <div className="relative">
                    <span className="inline-block rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wide backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-white/30">
                      {categoryLabel(book.category)}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h2 className="line-clamp-2 min-h-14 text-xl font-bold text-[#000054]">
                    {book.title}
                  </h2>
                  <p className="mt-2 text-sm text-[#333333]">
                    by {(book.authors ?? []).map(authorLabel).join(", ") || "Unknown author"}
                  </p>

                  <dl className="mt-5 grid gap-3 text-sm">
                    <div className="flex justify-between border-t border-[#EDEDF2] pt-3">
                      <dt className="font-semibold text-[#000054]">ISBN</dt>
                      <dd className="text-right text-[#333333]">{book.isbn}</dd>
                    </div>
                    <div className="flex justify-between border-t border-[#EDEDF2] pt-3">
                      <dt className="font-semibold text-[#000054]">Language</dt>
                      <dd>{book.language || "N/A"}</dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition-all duration-200 group-hover:scale-105 ${availabilityTone(book)}`}>
                      {availabilityLabel(book)} copies
                    </span>
                    {book.ebookUrl && (
                      <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-200">
                        Ebook available
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && books.length ? (
        <PaginationBar
          currentPage={currentPage}
          pages={paginationPages}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      ) : null}

      {!isLoading && !books.length && !error && (
        <div className="mt-6">
          <EmptyState
            variant="search"
            title="No books found"
            description="We couldn't find any books matching your search criteria. Try adjusting your filters or search terms."
            action={
              <button
                onClick={() => {
                  setDraftFilters({ page: "0", size: BOOKS_PER_PAGE, sort: "title,asc" });
                  setFilters({ page: "0", size: BOOKS_PER_PAGE, sort: "title,asc" });
                  setIsLoading(true);
                }}
                className="rounded-full bg-[#337AB7] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#337AB7]/20 transition hover:-translate-y-0.5"
              >
                Clear all filters
              </button>
            }
          />
        </div>
      )}
    </CatalogShell>
  );
}

function buildPaginationPages(currentPage: number, totalPages: number) {
  const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
  const end = Math.min(totalPages, start + 5);
  return Array.from({ length: end - start }, (_, index) => start + index);
}

function PaginationBar({
  currentPage,
  pages,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  pages: number[];
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav className="mt-8 flex justify-center rounded-2xl border border-[#EDEDF2] bg-white px-5 py-4 shadow-sm" aria-label="Books pagination">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 0}
          className="rounded-full border border-[#D9DCE8] px-4 py-2 text-sm font-bold text-[#000054] transition hover:border-[#337AB7] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Previous
        </button>
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold transition ${
              page === currentPage
                ? "bg-[#E60028] text-white shadow-lg shadow-[#E60028]/20"
                : "border border-[#D9DCE8] text-[#000054] hover:border-[#337AB7]"
            }`}
          >
            {page + 1}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="rounded-full border border-[#D9DCE8] px-4 py-2 text-sm font-bold text-[#000054] transition hover:border-[#337AB7] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
