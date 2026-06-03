"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BookCardSkeleton } from "@/components/ui/BookCardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLanguage } from "@/features/i18n/context/LanguageContext";
import { Book, BookSearchParams, Category } from "../types/catalog.type";
import { getBooks, getCategories } from "../services/catalogService";
import { authorLabel, availabilityLabel, availabilityTone, bookIdOf, categoryLabel, entityIdOf } from "./catalogHelpers";
import { CatalogShell, Notice } from "./CatalogShell";

const BOOKS_PER_PAGE = "20";

const booksExplorerCopy = {
  en: {
    eyebrow: "Library catalog",
    title: "Find your next source",
    description: "Search public book records, filter by author or category, and check availability before you visit the library.",
    searchLabel: "Search books",
    searchPlaceholder: "Search by title, author, ISBN...",
    authorLabel: "Author name",
    authorPlaceholder: "Author name",
    categoryLabel: "Category",
    availabilityLabel: "Availability",
    available: "Available",
    languageLabel: "Language",
    languagePlaceholder: "Language",
    sortLabel: "Sort by",
    sortAz: "Sort A-Z",
    sortZa: "Sort Z-A",
    newest: "Newest",
    reset: "Reset",
    moreFilters: "More filters",
    hideFilters: "Hide filters",
    filterSearch: "Search",
    filterAuthor: "Author",
    filterCategory: "Category",
    filterAvailable: "Available",
    viewDetails: "View details",
    by: "by",
    unknownAuthor: "Unknown author",
    isbn: "ISBN",
    notAvailable: "N/A",
    copies: "copies",
    previous: "Previous",
    next: "Next",
    noBooksTitle: "No books found",
    noBooksDescription: "We couldn't find any books matching your search criteria. Try adjusting your filters or search terms.",
    clearFilters: "Clear all filters",
  },
  vi: {
    eyebrow: "Danh mục thư viện",
    title: "Tìm nguồn tài liệu tiếp theo",
    description: "Tìm sách công khai, lọc theo tác giả hoặc danh mục, và kiểm tra tình trạng trước khi đến thư viện.",
    searchLabel: "Tìm sách",
    searchPlaceholder: "Tìm theo tên sách, tác giả, ISBN...",
    authorLabel: "Tên tác giả",
    authorPlaceholder: "Tên tác giả",
    categoryLabel: "Danh mục",
    availabilityLabel: "Tình trạng",
    available: "Có sẵn",
    languageLabel: "Ngôn ngữ",
    languagePlaceholder: "Ngôn ngữ",
    sortLabel: "Sắp xếp",
    sortAz: "Sắp xếp A-Z",
    sortZa: "Sắp xếp Z-A",
    newest: "Mới nhất",
    reset: "Đặt lại",
    moreFilters: "Bộ lọc thêm",
    hideFilters: "Ẩn bộ lọc",
    filterSearch: "Tìm kiếm",
    filterAuthor: "Tác giả",
    filterCategory: "Danh mục",
    filterAvailable: "Có sẵn",
    viewDetails: "Xem chi tiết",
    by: "bởi",
    unknownAuthor: "Chưa rõ tác giả",
    isbn: "ISBN",
    notAvailable: "Chưa có",
    copies: "bản",
    previous: "Trước",
    next: "Sau",
    noBooksTitle: "Không tìm thấy sách",
    noBooksDescription: "Không có sách nào khớp với điều kiện tìm kiếm. Hãy thử đổi bộ lọc hoặc từ khóa.",
    clearFilters: "Xóa bộ lọc",
  },
};

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
  const { locale } = useLanguage();
  const copy = booksExplorerCopy[locale];
  const normalizedInitialQuery = initialQuery.trim();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<BookSearchParams>(() => createBaseFilters(normalizedInitialQuery));
  const [draftFilters, setDraftFilters] = useState<BookSearchParams>(() => createBaseFilters(normalizedInitialQuery));
  const [pageInfo, setPageInfo] = useState({ page: 0, totalElements: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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
    filters.q ? `${copy.filterSearch}: ${filters.q}` : "",
    filters.author ? `${copy.filterAuthor}: ${filters.author}` : "",
    filters.categoryId ? `${copy.filterCategory}: ${categories.find((category) => entityIdOf(category) === filters.categoryId)?.name ?? filters.categoryId}` : "",
    filters.availableOnly ? copy.filterAvailable : "",
    filters.language ? `${copy.languageLabel}: ${filters.language}` : "",
  ].filter(Boolean);
  const hasAdvancedFilters = Boolean(filters.author || filters.language);
  const currentPage = Number(filters.page ?? pageInfo.page ?? 0);
  const totalPages = Math.max(pageInfo.totalPages || 1, 1);
  const paginationPages = buildPaginationPages(currentPage, totalPages);

  return (
    <CatalogShell
      wide
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
    >
      <form ref={filterFormRef} onSubmit={handleSubmit} onChange={handleFilterChange} className="rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-[0_12px_28px_rgba(17,24,39,0.06)]">
        <div className="grid w-full gap-2 md:grid-cols-2 xl:grid-cols-[minmax(360px,2fr)_minmax(170px,0.8fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)_auto_auto] xl:items-center">
          <label className="relative min-w-0">
            <span className="sr-only">{copy.searchLabel}</span>
            <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
              </svg>
            </span>
            <input name="q" defaultValue={normalizedInitialQuery} placeholder={copy.searchPlaceholder} className="h-12 w-full rounded-xl border border-[#D9DCE8] bg-white pl-11 pr-4 text-base outline-none transition focus:border-black focus:shadow-[0_0_0_4px_rgba(0,0,0,0.08)]" />
          </label>
          <label className="min-w-0">
            <span className="sr-only">{copy.categoryLabel}</span>
            <select name="categoryId" className="h-12 w-full rounded-xl border border-[#D9DCE8] bg-white px-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-black focus:shadow-[0_0_0_4px_rgba(0,0,0,0.08)]">
              <option value="">{copy.categoryLabel}</option>
              {categories.map((category) => (
                <option key={entityIdOf(category)} value={entityIdOf(category)}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-0">
            <span className="sr-only">{copy.availabilityLabel}</span>
            <select name="availableOnly" className="h-12 w-full rounded-xl border border-[#D9DCE8] bg-white px-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-black focus:shadow-[0_0_0_4px_rgba(0,0,0,0.08)]">
              <option value="">{copy.availabilityLabel}</option>
              <option value="true">{copy.available}</option>
            </select>
          </label>
          <label className="min-w-0">
            <span className="sr-only">{copy.sortLabel}</span>
            <select name="sort" defaultValue="title,asc" className="h-12 w-full rounded-xl border border-[#D9DCE8] bg-white px-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-black focus:shadow-[0_0_0_4px_rgba(0,0,0,0.08)]">
              <option value="title,asc">{copy.sortAz}</option>
              <option value="title,desc">{copy.sortZa}</option>
              <option value="publishedDate,desc">{copy.newest}</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => setShowAdvancedFilters((current) => !current)}
            className="h-12 rounded-xl border border-[#D9DCE8] bg-white px-4 text-sm font-bold text-[#111827] transition hover:border-black hover:bg-[#F8F9FA]"
          >
            {showAdvancedFilters || hasAdvancedFilters ? copy.hideFilters : copy.moreFilters}
          </button>
          <button type="button" onClick={handleResetFilters} className="h-12 rounded-xl bg-black px-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#111827]">
            {copy.reset}
          </button>
        </div>

        <div className={`${showAdvancedFilters || hasAdvancedFilters ? "mt-3 grid gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-3 md:grid-cols-2" : "hidden"}`}>
          <label className="min-w-0">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#6B7280]">{copy.authorLabel}</span>
            <input name="author" placeholder={copy.authorPlaceholder} className="h-11 w-full rounded-lg border border-[#D9DCE8] bg-white px-4 text-sm outline-none transition focus:border-black focus:shadow-[0_0_0_4px_rgba(0,0,0,0.08)]" />
          </label>
          <label className="min-w-0">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#6B7280]">{copy.languageLabel}</span>
            <input name="language" placeholder={copy.languagePlaceholder} className="h-11 w-full rounded-lg border border-[#D9DCE8] bg-white px-4 text-sm outline-none transition focus:border-black focus:shadow-[0_0_0_4px_rgba(0,0,0,0.08)]" />
          </label>
        </div>

        {activeFilters.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#EDEDF2] pt-3" aria-label="Active filters">
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <span key={filter} className="rounded-full border border-[#D9DCE8] bg-[#F8F9FA] px-3 py-1.5 text-xs font-bold text-[#111827]">
                  {filter}
                </span>
              ))}
            </div>
            <button type="button" onClick={handleResetFilters} className="rounded-full px-3 py-1.5 text-xs font-bold text-[#E60028] transition hover:bg-[#E60028]/8">
              {copy.clearFilters}
            </button>
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
              aria-label={`${copy.viewDetails}: ${book.title}`}
              className="group block overflow-hidden rounded-xl border border-[#EDEDF2] bg-white shadow-sm outline-none transition-all duration-300 hover:-translate-y-2 hover:border-[#337AB7]/40 hover:shadow-xl focus-visible:border-[#337AB7] focus-visible:shadow-[0_0_0_4px_rgba(51,122,183,0.16)]"
            >
              <article>
                <div className="relative min-h-44 overflow-hidden bg-black p-5 text-white">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.16),transparent_34%),linear-gradient(135deg,#111827_0%,#27272a_55%,#000000_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
                  <div className="relative flex min-h-34 flex-col justify-between">
                    <span className="w-fit rounded-full bg-white/14 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white ring-1 ring-white/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-white/22">
                      {categoryLabel(book.category)}
                    </span>
                    <h2 className="line-clamp-2 text-xl font-bold leading-snug text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
                      {book.title}
                    </h2>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm text-[#333333]">
                    {copy.by} {(book.authors ?? []).map(authorLabel).join(", ") || copy.unknownAuthor}
                  </p>

                  <dl className="mt-5 grid gap-3 text-sm">
                    <div className="flex justify-between border-t border-[#EDEDF2] pt-3">
                      <dt className="font-semibold text-[#000054]">{copy.isbn}</dt>
                      <dd className="text-right text-[#333333]">{book.isbn}</dd>
                    </div>
                    <div className="flex justify-between border-t border-[#EDEDF2] pt-3">
                      <dt className="font-semibold text-[#000054]">{copy.languageLabel}</dt>
                      <dd>{book.language || copy.notAvailable}</dd>
                    </div>
                  </dl>

                  <div className="mt-5">
                    <span className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition-all duration-200 group-hover:scale-105 ${availabilityTone(book)}`}>
                      {availabilityLabel(book)} {copy.copies}
                    </span>
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
          copy={copy}
        />
      ) : null}

      {!isLoading && !books.length && !error && (
        <div className="mt-6">
          <EmptyState
            variant="search"
            title={copy.noBooksTitle}
            description={copy.noBooksDescription}
            action={
              <button
                onClick={handleResetFilters}
                className="rounded-full bg-[#337AB7] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#337AB7]/20 transition hover:-translate-y-0.5"
              >
                {copy.clearFilters}
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
  copy,
}: {
  currentPage: number;
  pages: number[];
  totalPages: number;
  onPageChange: (page: number) => void;
  copy: typeof booksExplorerCopy.en;
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
          {copy.previous}
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
          {copy.next}
        </button>
      </div>
    </nav>
  );
}
