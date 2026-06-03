"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { TableSkeleton } from "@/components/ui/TableRowSkeleton";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Book, BookSearchParams, Category } from "../types/catalog.type";
import { deleteBook, getBooks, getCategories } from "../services/catalogService";
import { authorLabel, availabilityLabel, bookIdOf, categoryLabel, entityIdOf } from "./catalogHelpers";
import { CatalogShell, Notice, PrimaryAction, SecondaryAction } from "./CatalogShell";
import { compareText, downloadCsv, SortableHeader, SortDirection } from "./tableUtilities";

type BookSortKey = "title" | "isbn" | "authors" | "category" | "language" | "copies";

type StaffBooksPageProps = {
  mode?: "staff" | "admin";
  initialQuery?: string;
};

const STAFF_BOOKS_PER_PAGE = "12";

function createStaffBookFilters(query = ""): BookSearchParams {
  return {
    q: query.trim(),
    page: "0",
    size: STAFF_BOOKS_PER_PAGE,
    sort: "title,asc",
  };
}

export function StaffBooksPage({ mode = "staff", initialQuery = "" }: StaffBooksPageProps) {
  const { accessToken } = useAuth();
  const normalizedInitialQuery = initialQuery.trim();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<BookSearchParams>(() => createStaffBookFilters(normalizedInitialQuery));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [pageInfo, setPageInfo] = useState({ page: 0, totalElements: 0, totalPages: 1 });
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [tableSort, setTableSort] = useState<{ key: BookSortKey; direction: SortDirection }>({
    key: "title",
    direction: "asc",
  });
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
        setSelectedBookIds((selectedIds) => selectedIds.filter((id) => bookPage.items.some((book) => bookIdOf(book) === id)));
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
  }, [filters, message]);

  useEffect(() => {
    return () => {
      if (filterTimerRef.current) {
        window.clearTimeout(filterTimerRef.current);
      }
    };
  }, []);

  function buildFilters(form: HTMLFormElement): BookSearchParams {
    const formData = new FormData(form);

    return {
      q: String(formData.get("q") ?? ""),
      author: String(formData.get("author") ?? ""),
      categoryId: String(formData.get("categoryId") ?? ""),
      availableOnly: formData.get("availableOnly") ? "true" : "",
      language: String(formData.get("language") ?? ""),
      page: "0",
      size: STAFF_BOOKS_PER_PAGE,
      sort: String(formData.get("sort") ?? "title,asc"),
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (filterTimerRef.current) {
      window.clearTimeout(filterTimerRef.current);
      filterTimerRef.current = null;
    }

    setIsLoading(true);
    setFilters(buildFilters(event.currentTarget));
  }

  function handleFilterChange() {
    const form = filterFormRef.current;
    if (!form) return;

    if (filterTimerRef.current) {
      window.clearTimeout(filterTimerRef.current);
    }

    filterTimerRef.current = window.setTimeout(() => {
      setIsLoading(true);
      setFilters(buildFilters(form));
      filterTimerRef.current = null;
    }, 350);
  }

  function handleResetFilters() {
    if (filterTimerRef.current) {
      window.clearTimeout(filterTimerRef.current);
      filterTimerRef.current = null;
    }

    filterFormRef.current?.reset();
    setShowAdvancedFilters(false);
    setIsLoading(true);
    setFilters(createStaffBookFilters());
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
      size: STAFF_BOOKS_PER_PAGE,
    }));
  }

  async function handleDelete(book: Book) {
    const id = bookIdOf(book);
    if (!id || !window.confirm(`Delete "${book.title}"? Backend will reject this if active copies are borrowed or reserved.`)) return;

    try {
      await deleteBook(id, accessToken);
      setMessage(`Deleted ${book.title}.`);
      setError("");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete book.");
    }
  }

  const isAdmin = mode === "admin";
  const sortedBooks = useMemo(() => {
    return [...books].sort((a, b) => {
      const valueOf = (book: Book) => {
        switch (tableSort.key) {
          case "authors":
            return (book.authors ?? []).map(authorLabel).join(", ");
          case "category":
            return categoryLabel(book.category);
          case "copies":
            return book.availableCopies ?? 0;
          default:
            return book[tableSort.key] ?? "";
        }
      };

      return compareText(valueOf(a), valueOf(b), tableSort.direction);
    });
  }, [books, tableSort]);
  const selectedBooks = sortedBooks.filter((book) => selectedBookIds.includes(bookIdOf(book)));
  const allVisibleSelected = sortedBooks.length > 0 && sortedBooks.every((book) => selectedBookIds.includes(bookIdOf(book)));
  const currentPage = Number(filters.page ?? pageInfo.page ?? 0);
  const totalPages = Math.max(pageInfo.totalPages || 1, 1);
  const paginationPages = buildPaginationPages(currentPage, totalPages);
  const activeFilters = [
    filters.q ? `Search: ${filters.q}` : "",
    filters.author ? `Author: ${filters.author}` : "",
    filters.categoryId ? `Category: ${categories.find((category) => entityIdOf(category) === filters.categoryId)?.name ?? filters.categoryId}` : "",
    filters.availableOnly ? "Available only" : "",
    filters.language ? `Language: ${filters.language}` : "",
  ].filter(Boolean);
  const hasAdvancedFilters = Boolean(filters.author || filters.language);

  function updateSort(key: BookSortKey) {
    setTableSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }

  function toggleBookSelection(bookId: string) {
    setSelectedBookIds((current) => (current.includes(bookId) ? current.filter((id) => id !== bookId) : [...current, bookId]));
  }

  function toggleVisibleSelection() {
    setSelectedBookIds(allVisibleSelected ? [] : sortedBooks.map(bookIdOf).filter(Boolean));
  }

  function exportBooks(target: Book[]) {
    downloadCsv(
      `${isAdmin ? "admin" : "staff"}-books.csv`,
      ["Title", "ISBN", "Authors", "Category", "Language", "Copies"],
      target.map((book) => [
        book.title,
        book.isbn,
        (book.authors ?? []).map(authorLabel).join(", "),
        categoryLabel(book.category),
        book.language || "",
        availabilityLabel(book),
      ]),
    );
  }

  async function handleBulkDelete() {
    if (!isAdmin || !selectedBooks.length) return;
    if (!window.confirm(`Delete ${selectedBooks.length} selected book records? Backend will reject records with active borrowed or reserved copies.`)) return;

    try {
      await Promise.all(selectedBooks.map((book) => deleteBook(bookIdOf(book), accessToken)));
      setMessage(`Deleted ${selectedBooks.length} selected book records.`);
      setSelectedBookIds([]);
      setError("");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete selected books.");
    }
  }

  return (
    <CatalogShell
      protectedPage
      eyebrow={isAdmin ? "Admin catalog" : "Librarian catalog"}
      title={isAdmin ? "Book administration" : "Staff book workspace"}
      description="Search, review, and manage the catalog records used by the library system."
      actions={
        <>
          <PrimaryAction href="/staff/books/new">Create Book</PrimaryAction>
          <SecondaryAction href="/staff/books/import">Import CSV</SecondaryAction>
          {!isAdmin ? <SecondaryAction href="/staff/authors">Authors</SecondaryAction> : <SecondaryAction href="/admin/categories">Categories</SecondaryAction>}
        </>
      }
    >
      <form ref={filterFormRef} onSubmit={handleSubmit} onChange={handleFilterChange} className="rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-[0_12px_28px_rgba(17,24,39,0.06)]">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(360px,2fr)_minmax(180px,0.85fr)_minmax(150px,0.75fr)_minmax(130px,0.65fr)_auto_auto] xl:items-center">
          <label className="relative min-w-0">
            <span className="sr-only">Search title, ISBN, or author</span>
            <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
              </svg>
            </span>
            <input name="q" defaultValue={normalizedInitialQuery} placeholder="Search title, ISBN, author..." className="h-12 w-full rounded-xl border border-[#D9DCE8] bg-white pl-11 pr-4 text-base outline-none transition focus:border-black focus:shadow-[0_0_0_4px_rgba(0,0,0,0.08)]" />
          </label>
          <label className="min-w-0">
            <span className="sr-only">Filter by category</span>
            <select name="categoryId" className="h-12 w-full rounded-xl border border-[#D9DCE8] bg-white px-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-black focus:shadow-[0_0_0_4px_rgba(0,0,0,0.08)]">
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={entityIdOf(category)} value={entityIdOf(category)}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-0">
            <span className="sr-only">Sort catalog</span>
            <select name="sort" defaultValue="title,asc" className="h-12 w-full rounded-xl border border-[#D9DCE8] bg-white px-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-black focus:shadow-[0_0_0_4px_rgba(0,0,0,0.08)]">
              <option value="title,asc">A-Z</option>
              <option value="publishedDate,desc">Newest</option>
            </select>
          </label>
          <label className="flex h-12 w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-[#D9DCE8] bg-white px-4 text-sm font-bold text-[#111827] transition hover:border-black">
              <input name="availableOnly" type="checkbox" className="h-4 w-4 accent-[#E60028]" />
              Available
          </label>
          <button
            type="button"
            onClick={() => setShowAdvancedFilters((current) => !current)}
            className="h-12 rounded-xl border border-[#D9DCE8] bg-white px-4 text-sm font-bold text-[#111827] transition hover:border-black hover:bg-[#F8F9FA]"
          >
            {showAdvancedFilters || hasAdvancedFilters ? "Hide filters" : "More filters"}
          </button>
          <button type="button" onClick={handleResetFilters} className="h-12 rounded-xl bg-black px-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#111827]">
            Reset
          </button>
        </div>

        <div className={`${showAdvancedFilters || hasAdvancedFilters ? "mt-3 grid gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-3 md:grid-cols-2" : "hidden"}`}>
          <label className="min-w-0">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#6B7280]">Author</span>
            <input
              name="author"
              placeholder="Find author..."
              className="h-11 w-full rounded-lg border border-[#D9DCE8] bg-white px-4 text-sm outline-none transition focus:border-black focus:shadow-[0_0_0_4px_rgba(0,0,0,0.08)]"
            />
          </label>
          <label className="min-w-0">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#6B7280]">Language</span>
            <input name="language" placeholder="Language" className="h-11 w-full rounded-lg border border-[#D9DCE8] bg-white px-4 text-sm outline-none transition focus:border-black focus:shadow-[0_0_0_4px_rgba(0,0,0,0.08)]" />
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
              Clear all
            </button>
          </div>
        ) : null}
      </form>

      <div className="mt-5 grid gap-3">
        {message && <Notice tone="success" message={message} />}
        {error && <Notice tone="error" message={error} />}
      </div>

      {!isLoading && books.length ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#EDEDF2] bg-white p-4">
          <p className="text-sm font-semibold text-[#333333]">
            {selectedBookIds.length ? `${selectedBookIds.length} selected` : `${books.length} records loaded`}
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => exportBooks(selectedBooks.length ? selectedBooks : sortedBooks)} className="rounded-full border border-[#D9DCE8] px-4 py-2 text-sm font-bold text-[#000054] hover:border-[#337AB7]">
              Export {selectedBooks.length ? "selected" : "visible"}
            </button>
            {isAdmin ? (
              <button type="button" onClick={handleBulkDelete} disabled={!selectedBooks.length} className="rounded-full border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">
                Delete selected
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-6">
          <TableSkeleton rows={8} columns={7} />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-[#EDEDF2]">
        <table className="w-full min-w-[980px] border-collapse bg-white text-left text-sm">
          <thead className="bg-[#000054] text-white">
            <tr>
              <th className="w-12 px-4 py-3">
                <input type="checkbox" checked={allVisibleSelected} onChange={toggleVisibleSelection} aria-label="Select all visible books" className="h-4 w-4 accent-[#E60028]" />
              </th>
              <th className="px-4 py-3"><SortableHeader active={tableSort.key === "title"} direction={tableSort.direction} onClick={() => updateSort("title")}>Title</SortableHeader></th>
              <th className="px-4 py-3"><SortableHeader active={tableSort.key === "isbn"} direction={tableSort.direction} onClick={() => updateSort("isbn")}>ISBN</SortableHeader></th>
              <th className="px-4 py-3"><SortableHeader active={tableSort.key === "authors"} direction={tableSort.direction} onClick={() => updateSort("authors")}>Authors</SortableHeader></th>
              <th className="px-4 py-3"><SortableHeader active={tableSort.key === "category"} direction={tableSort.direction} onClick={() => updateSort("category")}>Category</SortableHeader></th>
              <th className="px-4 py-3"><SortableHeader active={tableSort.key === "language"} direction={tableSort.direction} onClick={() => updateSort("language")}>Language</SortableHeader></th>
              <th className="px-4 py-3"><SortableHeader active={tableSort.key === "copies"} direction={tableSort.direction} onClick={() => updateSort("copies")}>Copies</SortableHeader></th>
              <th className="min-w-[260px] px-4 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedBooks.map((book) => {
              const id = bookIdOf(book);
              return (
                <tr key={id || book.isbn} className="border-t border-[#EDEDF2] align-top">
                  <td className="px-4 py-4">
                    <input type="checkbox" checked={selectedBookIds.includes(id)} onChange={() => toggleBookSelection(id)} aria-label={`Select ${book.title}`} className="h-4 w-4 accent-[#E60028]" />
                  </td>
                  <td className="px-4 py-4 font-bold text-[#000054]">{book.title}</td>
                  <td className="px-4 py-4 text-[#333333]">{book.isbn}</td>
                  <td className="px-4 py-4 text-[#333333]">{(book.authors ?? []).map(authorLabel).join(", ") || "N/A"}</td>
                  <td className="px-4 py-4 text-[#333333]">{categoryLabel(book.category)}</td>
                  <td className="px-4 py-4 text-[#333333]">{book.language || "N/A"}</td>
                  <td className="px-4 py-4 font-semibold text-[#111827]">{availabilityLabel(book)}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                      <Link href={`/staff/books/${id}/edit`} className="rounded-full border border-[#D9DCE8] px-3 py-1.5 font-bold text-[#000054] hover:border-[#337AB7]">
                        Edit
                      </Link>
                      <Link href={isAdmin ? `/admin/books/${id}/copies` : `/staff/books/${id}/copies`} className="rounded-full border border-[#D9DCE8] px-3 py-1.5 font-bold text-[#337AB7] hover:border-[#337AB7]">
                        Physical Copies
                      </Link>
                      {isAdmin ? (
                        <button type="button" onClick={() => handleDelete(book)} className="rounded-full border border-rose-200 px-3 py-1.5 font-bold text-rose-700 hover:bg-rose-50">
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      {!isLoading && !books.length && (
        <div className="mt-6">
          <Notice message="No catalog records found." />
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
