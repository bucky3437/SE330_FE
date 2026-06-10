"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DragEvent, FormEvent, ReactNode, RefObject, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ApiError } from "@/types/api.type";
import { useAuth } from "@/features/auth/context/AuthContext";
import { hasStaffAccessFromToken } from "@/features/auth/utils/authRoles";
import { Author, Book, BookCoverImage, Category } from "../types/catalog.type";
import {
  addBookCover,
  createBook,
  getAuthors,
  getBook,
  getCategories,
  updateBook,
  updateBookAuthors,
  updateBookCover,
} from "../services/catalogService";
import { authorLabel, bookCoverAlt, bookCoverUrl, categoryIdOf, entityIdOf } from "./catalogHelpers";
import { CatalogShell, Notice } from "./CatalogShell";

const MAX_COVER_SIZE_BYTES = 5 * 1024 * 1024;
const AUTHOR_PICKER_PAGE_SIZE = 6;
const SAVE_BAR_FOOTER_HIDE_OFFSET = 96;
const SCROLL_DIRECTION_THRESHOLD = 4;
const ACCEPTED_COVER_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function BookFormPage({ mode }: { mode: "create" | "edit" }) {
  const router = useRouter();
  const params = useParams<{ bookId?: string }>();
  const { accessToken, currentUser, hasStaffAccess, refresh } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSaving, setIsSaving] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isSaveBarVisible, setIsSaveBarVisible] = useState(true);
  const [authorSearch, setAuthorSearch] = useState("");
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<Set<string>>(() => new Set());
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const authorSelectionSourceRef = useRef("");
  const lastScrollYRef = useRef(0);
  const isEdit = mode === "edit";
  const bookId = params.bookId ?? "";

  useEffect(() => {
    let isMounted = true;
    const tasks: Promise<unknown>[] = [getAuthors(authorSearch ? { q: authorSearch } : {}), getCategories()];

    if (isEdit && bookId) {
      tasks.push(getBook(bookId));
    }

    Promise.all(tasks)
      .then(([authorList, categoryList, bookRecord]) => {
        if (!isMounted) return;
        setAuthors(authorList as Author[]);
        setCategories(categoryList as Category[]);
        if (bookRecord) {
          setBook(bookRecord as Book);
        }
      })
      .catch((fetchError) => {
        if (!isMounted) return;
        setError(fetchError instanceof Error ? fetchError.message : "Could not load form data.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [authorSearch, bookId, isEdit]);

  useEffect(() => {
    const sourceKey = book ? `book:${entityIdOf(book)}` : `mode:${mode}`;

    if (authorSelectionSourceRef.current === sourceKey) {
      return;
    }

    authorSelectionSourceRef.current = sourceKey;
    setSelectedAuthorIds(new Set((book?.authors ?? []).map((author) => (typeof author === "string" ? "" : entityIdOf(author))).filter(Boolean)));
  }, [book, mode]);

  useEffect(() => {
    let frameId = 0;

    function updateSaveBarVisibility() {
      frameId = 0;

      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollYRef.current;
      const isScrollingDown = scrollDelta > SCROLL_DIRECTION_THRESHOLD;
      const isScrollingUp = scrollDelta < -SCROLL_DIRECTION_THRESHOLD;
      const footer = document.querySelector("footer");
      const footerTop = footer?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      const isNearFooter = footerTop <= window.innerHeight + SAVE_BAR_FOOTER_HIDE_OFFSET;

      if (!isNearFooter || isScrollingUp) {
        setIsSaveBarVisible(true);
      } else if (isScrollingDown) {
        setIsSaveBarVisible(false);
      }

      if (isScrollingDown || isScrollingUp) {
        lastScrollYRef.current = currentScrollY;
      }
    }

    function requestVisibilityUpdate() {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateSaveBarVisibility);
    }

    lastScrollYRef.current = window.scrollY;
    requestVisibilityUpdate();
    window.addEventListener("scroll", requestVisibilityUpdate, { passive: true });
    window.addEventListener("resize", requestVisibilityUpdate);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("scroll", requestVisibilityUpdate);
      window.removeEventListener("resize", requestVisibilityUpdate);
    };
  }, []);

  const visibleAuthors = useMemo(() => authors.slice(0, AUTHOR_PICKER_PAGE_SIZE), [authors]);

  const coverUrl = book ? bookCoverUrl(book, "detail") : "";
  const hasCover = Boolean(coverUrl);
  const currentCategoryId = book ? categoryIdOf(book) : "";
  const currentLanguage = book?.language ?? "";
  const canUseCoverUploadApi = hasStaffAccess || hasStaffAccessFromToken(accessToken);
  const coverUploadPermissionNotice = canUseCoverUploadApi
    ? ""
    : `Cover upload requires LIBRARIAN or ADMIN. Current role is ${currentUser?.role ?? "unknown"}.`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const authorIds = Array.from(selectedAuthorIds).map((value) => Number(value)).filter(Boolean);
    const categoryId = Number(formData.get("categoryId")) || null;
    const metadataPayload = {
      title: String(formData.get("title") ?? "").trim(),
      publishedDate: String(formData.get("publishedDate") ?? ""),
      language: String(formData.get("language") ?? "").trim(),
      edition: String(formData.get("edition") ?? "").trim(),
      categoryId,
    };
    const isbn = String(formData.get("isbn") ?? "").trim();

    if (!metadataPayload.title || (!isEdit && !isbn)) {
      setError(isEdit ? "Title is required." : "Title and ISBN are required.");
      return;
    }

    setIsSaving(true);
    try {
      if (isEdit && bookId) {
        const updatedBook = await updateBook(bookId, metadataPayload, accessToken);
        await updateBookAuthors(bookId, authorIds, accessToken);
        setBook((current) => ({
          ...(current ?? updatedBook),
          ...updatedBook,
          coverImage: current?.coverImage ?? updatedBook.coverImage,
          imageUrl: current?.imageUrl ?? updatedBook.imageUrl,
        }));
        setMessage("Book metadata and authors were updated.");
      } else {
        const created = await createBook({ ...metadataPayload, authorIds, isbn }, accessToken);
        setMessage("Book was created. You can now add physical copies.");
        const createdId = entityIdOf(created);
        if (createdId) {
          router.push(`/staff/books/${createdId}/copies`);
        }
      }
      setError("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save book.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCoverFile(file?: File | null) {
    if (!file) return;

    if (!isEdit || !bookId) {
      setError("Save this book before uploading a cover image.");
      return;
    }

    if (!ACCEPTED_COVER_TYPES.has(file.type)) {
      setError("Cover image must be JPG, PNG, or WEBP.");
      return;
    }

    if (file.size > MAX_COVER_SIZE_BYTES) {
      setError("Cover image must be 5MB or smaller.");
      return;
    }

    if (!canUseCoverUploadApi) {
      setError(coverUploadPermissionNotice);
      return;
    }

    const shouldReplace = Boolean(book && bookCoverUrl(book, "detail"));
    setIsCoverUploading(true);
    try {
      const coverImage = await uploadCoverImage(bookId, file, shouldReplace, accessToken);

      setBook((current) => {
        if (!current) return current;
        return applyCoverToBook(current, coverImage);
      });
      setMessage(shouldReplace ? "Book cover was replaced." : "Book cover was uploaded.");
      setError("");
    } catch (uploadError) {
      if (uploadError instanceof ApiError && (uploadError.status === 401 || uploadError.status === 403)) {
        const refreshedSession = await refresh();

        if (refreshedSession?.accessToken) {
          try {
            const coverImage = await uploadCoverImage(bookId, file, shouldReplace, refreshedSession.accessToken);

            setBook((current) => {
              if (!current) return current;
              return applyCoverToBook(current, coverImage);
            });
            setMessage(shouldReplace ? "Book cover was replaced." : "Book cover was uploaded.");
            setError("");
            return;
          } catch (retryError) {
            setError(getCoverUploadErrorMessage(retryError, currentUser?.role));
            return;
          }
        }
      }

      setError(getCoverUploadErrorMessage(uploadError, currentUser?.role));
    } finally {
      setIsCoverUploading(false);
    }
  }

  function handleCoverInputChange(event: FormEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    void handleCoverFile(input.files?.item(0));
    input.value = "";
  }

  function handleCoverDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    void handleCoverFile(event.dataTransfer.files.item(0));
  }

  function handleAuthorToggle(authorId: string, checked: boolean) {
    setSelectedAuthorIds((current) => {
      const next = new Set(current);

      if (checked) {
        next.add(authorId);
      } else {
        next.delete(authorId);
      }

      return next;
    });
  }

  return (
    <CatalogShell
      protectedPage
      wide
      frameless
      eyebrow={isEdit ? "Edit catalog record" : "Create catalog record"}
      title={isEdit ? "Update book metadata" : "Create a new book"}
      description="Book metadata is managed separately from physical copies, matching the backend catalog workflow."
      actions={<BackToStaffBooks />}
    >
      <div className="grid gap-3">
        {isLoading ? <Notice message="Loading form data..." /> : null}
        {message ? <Notice tone="success" message={message} /> : null}
        {error ? <Notice tone="error" message={error} /> : null}
      </div>

      <form
        key={book ? `${entityIdOf(book)}-${currentLanguage}-${currentCategoryId}` : mode}
        id="book-metadata-form"
        onSubmit={handleSubmit}
        className="mt-6 space-y-6 pb-28"
      >
        <div className="flex flex-col gap-6 lg:flex-row">
          <section className="min-w-0 rounded-2xl border border-[#E1E6F0] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)] lg:flex-1">
            <h2 className="text-lg font-black text-[#0B1026]">Bibliographic details</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="Title" name="title" defaultValue={book?.title} required />
              {isEdit ? (
                <ReadonlyField label="ISBN" value={book?.isbn || "N/A"} />
              ) : (
                <Field label="ISBN" name="isbn" defaultValue={book?.isbn} required />
              )}
              <Field label="Published date" name="publishedDate" type="date" defaultValue={book?.publishedDate ?? ""} />
              <SelectField label="Language" name="language" defaultValue={currentLanguage}>
                <option value="">No language</option>
                {currentLanguage && !["en", "vi", "English", "Vietnamese"].includes(currentLanguage) ? (
                  <option value={currentLanguage}>{currentLanguage}</option>
                ) : null}
                <option value="English">English</option>
                <option value="Vietnamese">Vietnamese</option>
                <option value="en">English (en)</option>
                <option value="vi">Vietnamese (vi)</option>
              </SelectField>
              <Field label="Edition" name="edition" defaultValue={book?.edition ?? ""} placeholder="e.g., 1st, 2nd revised" />
              <SelectField label="Category" name="categoryId" defaultValue={currentCategoryId}>
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={entityIdOf(category)} value={entityIdOf(category)}>
                    {category.name}
                  </option>
                ))}
              </SelectField>
            </div>

            <section className="mt-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#0B1026]">Authors</h2>
                  <p className="mt-1 text-sm text-[#59637A]">Select the catalog authors attached to this title.</p>
                </div>
                <Link href="/staff/authors" className="inline-flex items-center gap-2 text-sm font-black text-[#E60028] transition hover:text-[#0B1026]">
                  Manage authors
                  <Icon name="chevron-right" size={17} aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-4 rounded-2xl border border-[#E1E6F0] bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <label className="min-w-0 flex-1">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#0B1026]">Search author name</span>
                    <input
                      value={authorSearch}
                      onChange={(event) => setAuthorSearch(event.target.value)}
                      placeholder="Filter author choices..."
                      className="mt-2 h-12 w-full rounded-xl border border-[#D5DBE8] bg-white px-4 text-sm outline-none transition focus:border-[#111827] focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)]"
                    />
                  </label>
                  <button type="button" onClick={() => setAuthorSearch("")} className="h-12 rounded-xl border border-[#D5DBE8] px-5 text-sm font-black text-[#0B1026] transition hover:border-[#111827]">
                    Clear
                  </button>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {visibleAuthors.map((author) => {
                    const id = entityIdOf(author);
                    if (!id) return null;

                    return (
                      <label key={id} className="flex items-center gap-3 rounded-xl border border-[#E1E6F0] bg-white px-3 py-3 text-sm font-semibold text-[#111827]">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#F6F8FC] text-[#61708F]">
                          <Icon name="menu" size={15} aria-hidden="true" />
                        </span>
                        <input
                          name="authorIds"
                          value={id}
                          type="checkbox"
                          checked={selectedAuthorIds.has(id)}
                          onChange={(event) => handleAuthorToggle(id, event.target.checked)}
                          className="h-4 w-4 accent-[#E60028]"
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-bold">{authorLabel(author)}</span>
                          <span className="block text-xs font-medium text-[#61708F]">Author</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </section>
          </section>

          <BookCoverPanel
            book={book}
            coverUrl={coverUrl}
            hasCover={hasCover}
            isCoverUploading={isCoverUploading}
            isEdit={isEdit}
            permissionNotice={coverUploadPermissionNotice}
            fileInputRef={coverFileInputRef}
            onDrop={handleCoverDrop}
            onFile={handleCoverFile}
            onOpenFilePicker={() => coverFileInputRef.current?.click()}
            onInputChange={handleCoverInputChange}
          />
        </div>

        <div
          aria-hidden={!isSaveBarVisible}
          style={{ transform: isSaveBarVisible ? "translateY(0)" : "translateY(calc(100% + 1rem))" }}
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-[#E1E6F0] bg-white/95 px-5 py-5 shadow-[0_-18px_40px_rgba(15,23,42,0.08)] backdrop-blur transition-[opacity,transform] duration-300 ease-out will-change-transform md:px-8 ${
            isSaveBarVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between 2xl:max-w-[1720px]">
            <Link
              href="/staff/books"
              tabIndex={isSaveBarVisible ? undefined : -1}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[#D5DBE8] px-8 text-sm font-black text-[#0B1026] transition hover:border-[#111827]"
            >
              Cancel
            </Link>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="text-sm font-medium text-[#61708F]">Unsaved changes</span>
              <button
                type="submit"
                disabled={isSaving || isLoading || !isSaveBarVisible}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#E60028] px-8 text-sm font-black text-white shadow-[0_14px_28px_rgba(230,0,40,0.22)] transition hover:-translate-y-0.5 hover:bg-[#c90022] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon name="file" size={17} aria-hidden="true" />
                {isSaving ? "Saving..." : isEdit ? "Save changes" : "Create book"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </CatalogShell>
  );
}

function BackToStaffBooks() {
  return (
    <Link href="/staff/books" className="inline-flex h-12 items-center gap-3 rounded-xl border border-[#D5DBE8] bg-white px-5 text-sm font-black text-[#0B1026] transition hover:border-[#111827]">
      <Icon name="arrow-left" size={18} aria-hidden="true" />
      Back to staff books
    </Link>
  );
}

function BookCoverPanel({
  book,
  coverUrl,
  hasCover,
  isCoverUploading,
  isEdit,
  permissionNotice,
  fileInputRef,
  onDrop,
  onFile,
  onOpenFilePicker,
  onInputChange,
}: {
  book: Book | null;
  coverUrl: string;
  hasCover: boolean;
  isCoverUploading: boolean;
  isEdit: boolean;
  permissionNotice: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onDrop: (event: DragEvent<HTMLButtonElement>) => void;
  onFile: (file?: File | null) => void;
  onOpenFilePicker: () => void;
  onInputChange: (event: FormEvent<HTMLInputElement>) => void;
}) {
  const coverImage = book?.coverImage ?? null;
  const coverName = coverFileName(book, coverImage);

  return (
    <section className="min-w-0 rounded-2xl border border-[#E1E6F0] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)] lg:flex-1">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={onInputChange}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-[#0B1026]">Book cover & images</h2>
          <p className="mt-2 text-sm text-[#59637A]">One image can be marked as the primary cover displayed to patrons.</p>
          {permissionNotice ? (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">
              {permissionNotice}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onOpenFilePicker}
          disabled={!isEdit || isCoverUploading || Boolean(permissionNotice)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#E60028] px-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(230,0,40,0.22)] transition hover:-translate-y-0.5 hover:bg-[#c90022] disabled:cursor-not-allowed disabled:opacity-55"
        >
          <Icon name="upload" size={17} aria-hidden="true" />
          {isCoverUploading ? "Uploading..." : hasCover ? "Replace image" : "Upload image"}
        </button>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_230px]">
        <div className="rounded-2xl border border-[#E1E6F0] bg-white p-4">
          {hasCover && book ? (
            <div className="flex flex-col gap-4 sm:flex-row">
              <CoverPreview book={book} coverUrl={coverUrl} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-black text-[#0B1026]">{coverName}</p>
                  <StatusPill status={coverImage?.status ?? "ACTIVE"} />
                </div>
                <p className="mt-2 text-sm font-medium text-[#59637A]">
                  {formatProvider(coverImage?.provider)} <span aria-hidden="true">·</span> Primary cover
                </p>
                <label className="mt-5 block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#0B1026]">Alt text / caption</span>
                  <textarea
                    value={coverImage?.altText ?? bookCoverAlt(book)}
                    readOnly
                    rows={3}
                    className="mt-2 w-full resize-none rounded-xl border border-[#D5DBE8] bg-[#F8FAFC] px-4 py-3 text-sm text-[#334155] outline-none"
                  />
                </label>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={onOpenFilePicker}
                    disabled={!isEdit || isCoverUploading || Boolean(permissionNotice)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#D5DBE8] px-5 text-sm font-black text-[#0B1026] transition hover:border-[#111827] disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <Icon name="upload" size={16} aria-hidden="true" />
                    Replace
                  </button>
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-rose-200 px-5 text-sm font-black text-rose-500 opacity-55"
                  >
                    <Icon name="trash" size={16} aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <EmptyCoverState
              disabled={!isEdit || Boolean(permissionNotice)}
              onOpenFilePicker={onOpenFilePicker}
            />
          )}
        </div>

        <DropZone
          disabled={!isEdit || isCoverUploading || Boolean(permissionNotice)}
          onDrop={onDrop}
          onFile={onFile}
          onOpenFilePicker={onOpenFilePicker}
        />
      </div>

      <div className="mt-6">
        <p className="text-sm font-black text-[#0B1026]">Image gallery</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <GalleryCard book={book} coverUrl={coverUrl} isPrimary />
          <GalleryPlaceholder label="Back cover" />
          <GalleryPlaceholder label="Sample page" />
          <button
            type="button"
            onClick={onOpenFilePicker}
            disabled={!isEdit || isCoverUploading || Boolean(permissionNotice)}
            className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#C9D1DE] bg-white p-4 text-sm font-black text-[#0B1026] transition hover:border-[#111827] disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Icon name="plus" size={28} aria-hidden="true" />
            Add more images
          </button>
        </div>
      </div>
    </section>
  );
}

function CoverPreview({ book, coverUrl }: { book: Book; coverUrl: string }) {
  return (
    <div className="relative h-64 w-36 shrink-0 overflow-hidden rounded-lg bg-[#EEF1F6] ring-1 ring-black/5">
      <Image src={coverUrl} alt={bookCoverAlt(book)} fill unoptimized sizes="144px" className="object-cover" />
      <span className="absolute left-2 top-2 rounded-full bg-[#E60028] px-2 py-1 text-[11px] font-black text-white">Primary</span>
    </div>
  );
}

function EmptyCoverState({ disabled, onOpenFilePicker }: { disabled: boolean; onOpenFilePicker: () => void }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl bg-[#F8FAFC] p-6 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-[#61708F] shadow-sm">
        <Icon name="book-open" size={25} aria-hidden="true" />
      </span>
      <p className="mt-4 text-base font-black text-[#0B1026]">No cover image</p>
      <p className="mt-2 max-w-xs text-sm text-[#59637A]">Upload a JPG, PNG, or WEBP image for the primary catalog cover.</p>
      <button
        type="button"
        onClick={onOpenFilePicker}
        disabled={disabled}
        className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl border border-[#D5DBE8] px-5 text-sm font-black text-[#0B1026] transition hover:border-[#111827] disabled:cursor-not-allowed disabled:opacity-55"
      >
        <Icon name="upload" size={16} aria-hidden="true" />
        Upload cover
      </button>
    </div>
  );
}

function DropZone({
  disabled,
  onDrop,
  onFile,
  onOpenFilePicker,
}: {
  disabled: boolean;
  onDrop: (event: DragEvent<HTMLButtonElement>) => void;
  onFile: (file?: File | null) => void;
  onOpenFilePicker: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpenFilePicker}
      onDrop={onDrop}
      onDragOver={(event) => event.preventDefault()}
      onPaste={(event) => onFile(event.clipboardData.files.item(0))}
      disabled={disabled}
      className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#C9D1DE] bg-white p-6 text-center text-sm transition hover:border-[#111827] disabled:cursor-not-allowed disabled:opacity-55"
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F6F8FC] text-[#61708F]">
        <Icon name="upload" size={23} aria-hidden="true" />
      </span>
      <span className="mt-4 font-semibold text-[#334155]">Drag and drop images here</span>
      <span className="font-black text-[#E60028]">or browse files</span>
      <span className="mt-2 text-xs font-medium text-[#61708F]">PNG, JPG, WEBP up to 5MB</span>
    </button>
  );
}

function GalleryCard({ book, coverUrl, isPrimary }: { book: Book | null; coverUrl: string; isPrimary?: boolean }) {
  if (!book || !coverUrl) {
    return <GalleryPlaceholder label="Primary cover" />;
  }

  return (
    <article className="rounded-2xl border border-[#E1E6F0] bg-white p-3">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#EEF1F6]">
        <Image src={coverUrl} alt={bookCoverAlt(book)} fill unoptimized sizes="180px" className="object-cover" />
        {isPrimary ? <span className="absolute left-2 top-2 rounded-full bg-[#E60028] px-2 py-1 text-[11px] font-black text-white">Primary</span> : null}
      </div>
      <p className="mt-3 truncate text-xs font-black text-[#0B1026]">{coverFileName(book, book.coverImage ?? null)}</p>
      <p className="mt-1 text-xs text-[#61708F]">{formatProvider(book.coverImage?.provider)}</p>
      <StatusPill status={book.coverImage?.status ?? "ACTIVE"} />
    </article>
  );
}

function GalleryPlaceholder({ label }: { label: string }) {
  return (
    <article className="rounded-2xl border border-[#E1E6F0] bg-white p-3 opacity-70">
      <div className="flex aspect-[3/4] items-center justify-center rounded-xl bg-[#F6F8FC] text-[#94A3B8]">
        <Icon name="file" size={28} aria-hidden="true" />
      </div>
      <p className="mt-3 text-xs font-black text-[#0B1026]">{label}</p>
      <p className="mt-1 text-xs text-[#61708F]">Pending</p>
    </article>
  );
}

function Field({
  label,
  name,
  defaultValue = "",
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#0B1026]">
        {label}
        {required ? <span className="text-[#E60028]"> *</span> : null}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-xl border border-[#D5DBE8] bg-white px-4 text-sm text-[#0B1026] outline-none transition placeholder:text-[#8A94A6] focus:border-[#111827] focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)]"
      />
    </label>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#0B1026]">{label}</p>
      <div className="mt-2 flex h-12 items-center rounded-xl border border-[#D5DBE8] bg-[#F8FAFC] px-4 text-sm font-semibold text-[#334155]">
        {value}
      </div>
    </div>
  );
}

function SelectField({
  children,
  defaultValue = "",
  label,
  name,
}: {
  children: ReactNode;
  defaultValue?: string | number | null;
  label: string;
  name: string;
}) {
  return (
    <label className="relative">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#0B1026]">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="mt-2 h-12 w-full appearance-none rounded-xl border border-[#D5DBE8] bg-white px-4 pr-10 text-sm font-semibold text-[#0B1026] outline-none transition focus:border-[#111827] focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)]"
      >
        {children}
      </select>
      <Icon name="chevron-down" size={17} aria-hidden="true" className="pointer-events-none absolute bottom-4 right-4 text-[#0B1026]" />
    </label>
  );
}

function StatusPill({ status }: { status?: string | null }) {
  const normalizedStatus = (status || "ACTIVE").replace(/_/g, " ").toLowerCase();

  return (
    <span className="inline-flex w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black capitalize text-emerald-700">
      {normalizedStatus}
    </span>
  );
}

function applyCoverToBook(book: Book, coverImage: BookCoverImage): Book {
  const imageUrl = coverImage.thumbnailUrl ?? coverImage.detailUrl ?? coverImage.originalUrl ?? book.imageUrl ?? null;

  return {
    ...book,
    imageUrl,
    coverImage,
  };
}

function uploadCoverImage(bookId: string, file: File, shouldReplace: boolean, accessToken: string | null) {
  return shouldReplace ? updateBookCover(bookId, file, accessToken) : addBookCover(bookId, file, accessToken);
}

function getCoverUploadErrorMessage(error: unknown, role?: string | null) {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return `Cover upload was forbidden by the backend. Current profile role is ${role ?? "unknown"}; this API requires LIBRARIAN or ADMIN authority in the access token.`;
    }

    if (error.status === 401) {
      return "Your session expired while uploading the cover. Please sign in again and retry.";
    }
  }

  return error instanceof Error ? error.message : "Could not upload cover image.";
}

function coverFileName(book: Book | null, coverImage: BookCoverImage | null) {
  if (coverImage?.publicId) {
    return `${coverImage.publicId.split("/").pop()}.jpg`;
  }

  const sourceUrl = coverImage?.originalUrl ?? coverImage?.detailUrl ?? coverImage?.thumbnailUrl;
  if (sourceUrl) {
    const fileName = sourceUrl.split("?")[0]?.split("/").pop();
    if (fileName) return fileName;
  }

  const isbn = book?.isbn?.trim();
  return isbn ? `${isbn}_cover_primary.jpg` : "cover_primary.jpg";
}

function formatProvider(provider?: string | null) {
  if (!provider) return "Cloudinary";
  return provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase();
}
