"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Author, Book, Category } from "../types/catalog.type";
import { createBook, getAuthors, getBook, getCategories, updateBook, updateBookAuthors } from "../services/catalogService";
import { authorLabel, entityIdOf } from "./catalogHelpers";
import { CatalogShell, Notice, SecondaryAction } from "./CatalogShell";

export function BookFormPage({ mode }: { mode: "create" | "edit" }) {
  const router = useRouter();
  const params = useParams<{ bookId?: string }>();
  const { accessToken } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [authorSearch, setAuthorSearch] = useState("");
  const isEdit = mode === "edit";

  useEffect(() => {
    let isMounted = true;
    const tasks: Promise<unknown>[] = [getAuthors(authorSearch ? { q: authorSearch } : {}), getCategories()];

    if (isEdit && params.bookId) {
      tasks.push(getBook(params.bookId));
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
  }, [authorSearch, isEdit, params.bookId]);

  const selectedAuthorIds = useMemo(() => {
    return new Set((book?.authors ?? []).map((author) => (typeof author === "string" ? "" : entityIdOf(author))).filter(Boolean));
  }, [book]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const authorIds = formData
      .getAll("authorIds")
      .map((value) => Number(value))
      .filter(Boolean);
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

    try {
      if (isEdit && params.bookId) {
        await updateBook(params.bookId, metadataPayload, accessToken);
        await updateBookAuthors(params.bookId, authorIds, accessToken);
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
    }
  }

  return (
    <CatalogShell
      protectedPage
      eyebrow={isEdit ? "Edit catalog record" : "Create catalog record"}
      title={isEdit ? "Update book metadata" : "Create a new book"}
      description="Book metadata is managed separately from physical copies, matching the backend catalog workflow."
      actions={<SecondaryAction href="/staff/books">Back to staff books</SecondaryAction>}
    >
      <div className="grid gap-3">
        {isLoading ? <Notice message="Loading form data..." /> : null}
        {message ? <Notice tone="success" message={message} /> : null}
        {error ? <Notice tone="error" message={error} /> : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-6 rounded-xl border border-[#EDEDF2] bg-[#F8F9FA] p-5 lg:grid-cols-2">
        <Field label="Title" name="title" defaultValue={book?.title} required />
        {isEdit ? (
          <div className="rounded-xl border border-[#D9DCE8] bg-white px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[#000054]">ISBN</p>
            <p className="mt-2 font-semibold text-[#333333]">{book?.isbn || "N/A"}</p>
          </div>
        ) : (
          <Field label="ISBN" name="isbn" defaultValue={book?.isbn} required />
        )}
        <Field label="Published date" name="publishedDate" type="date" defaultValue={book?.publishedDate ?? ""} />
        <Field label="Language" name="language" defaultValue={book?.language ?? ""} />
        <Field label="Edition" name="edition" defaultValue={book?.edition ?? ""} />
        <label>
          <span className="text-xs font-bold uppercase tracking-wide text-[#000054]">Category</span>
          <select name="categoryId" defaultValue={book?.categoryId ?? ""} className="mt-2 w-full rounded-xl border border-[#D9DCE8] bg-white px-4 py-3 outline-none focus:border-[#337AB7]">
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={entityIdOf(category)} value={entityIdOf(category)}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <section className="lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#000054]">Authors</h2>
              <p className="mt-1 text-sm text-[#333333]">For edit mode, this calls the separate author relationship endpoint.</p>
            </div>
            <a href="/staff/authors" className="text-sm font-bold text-[#E60028] hover:text-[#000054]">
              Manage authors
            </a>
          </div>
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#EDEDF2] bg-white p-4 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1">
              <span className="text-xs font-bold uppercase tracking-wide text-[#000054]">Search author name</span>
              <input
                value={authorSearch}
                onChange={(event) => setAuthorSearch(event.target.value)}
                placeholder="Filter author choices..."
                className="mt-2 h-12 w-full rounded-xl border border-[#D9DCE8] bg-[#F8F9FA] px-4 outline-none transition focus:border-[#337AB7]"
              />
            </label>
            <button type="button" onClick={() => setAuthorSearch("")} className="h-12 rounded-full border border-[#D9DCE8] px-5 text-sm font-bold text-[#000054]">
              Clear
            </button>
          </div>
          <div className="mt-4 grid gap-3 rounded-xl border border-[#EDEDF2] bg-white p-4 md:grid-cols-2 lg:grid-cols-3">
            {authors.map((author) => {
              const id = entityIdOf(author);
              return (
                <label key={id} className="flex items-center gap-3 rounded-lg border border-[#EDEDF2] px-3 py-2 text-sm font-semibold text-[#111827]">
                  <input name="authorIds" value={id} type="checkbox" defaultChecked={selectedAuthorIds.has(id)} className="h-4 w-4 accent-[#E60028]" />
                  {authorLabel(author)}
                </label>
              );
            })}
          </div>
        </section>

        <div className="lg:col-span-2">
          <button type="submit" className="rounded-full bg-[#E60028] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#E60028]/20 transition hover:-translate-y-0.5">
            {isEdit ? "Save changes" : "Create book"}
          </button>
        </div>
      </form>
    </CatalogShell>
  );
}

function Field({ label, name, defaultValue = "", type = "text", required = false }: { label: string; name: string; defaultValue?: string | null; type?: string; required?: boolean }) {
  return (
    <label>
      <span className="text-xs font-bold uppercase tracking-wide text-[#000054]">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="mt-2 w-full rounded-xl border border-[#D9DCE8] bg-white px-4 py-3 outline-none focus:border-[#337AB7]"
      />
    </label>
  );
}
