"use client";

import { FormEvent, useMemo, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Author } from "../types/catalog.type";
import { createAuthor, getAuthors, updateAuthor } from "../services/catalogService";
import { entityIdOf } from "./catalogHelpers";
import { CatalogShell, Notice, SecondaryAction } from "./CatalogShell";
import { compareText, downloadCsv, SortableHeader, SortDirection } from "./tableUtilities";

type AuthorSortKey = "name" | "bio";

export function AuthorsAdminPage() {
  const { accessToken } = useAuth();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [editing, setEditing] = useState<Author | null>(null);
  const [formValues, setFormValues] = useState({ bio: "", name: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [authorSearch, setAuthorSearch] = useState("");
  const [dirtyAuthorIds, setDirtyAuthorIds] = useState<string[]>([]);
  const [tableSort, setTableSort] = useState<{ key: AuthorSortKey; direction: SortDirection }>({
    key: "name",
    direction: "asc",
  });

  useEffect(() => {
    let isMounted = true;
    getAuthors(authorSearch ? { name: authorSearch } : {})
      .then((items) => {
        if (isMounted) setAuthors(items);
      })
      .catch((fetchError) => {
        if (isMounted) setError(fetchError instanceof Error ? fetchError.message : "Could not load authors.");
      });
    return () => {
      isMounted = false;
    };
  }, [authorSearch, message]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      name: formValues.name.trim(),
      bio: formValues.bio.trim(),
    };

    if (!payload.name) {
      setError("Author name is required.");
      return;
    }

    try {
      if (editing) {
        await updateAuthor(entityIdOf(editing), payload, accessToken);
        setMessage("Author updated.");
      } else {
        await createAuthor(payload, accessToken);
        setMessage("Author created.");
      }
      setEditing(null);
      setFormValues({ bio: "", name: "" });
      setError("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save author.");
    }
  }

  async function handleInlineSave(author: Author, form: HTMLFormElement) {
    const authorId = entityIdOf(author);
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      bio: String(formData.get("bio") ?? "").trim(),
    };

    if (!payload.name) {
      setError("Author name is required.");
      return;
    }

    try {
      await updateAuthor(authorId, payload, accessToken);
      setMessage(`Updated ${payload.name}.`);
      setDirtyAuthorIds((current) => current.filter((id) => id !== authorId));
      setError("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not update author.");
    }
  }

  const sortedAuthors = useMemo(
    () => [...authors].sort((a, b) => compareText(a[tableSort.key] ?? "", b[tableSort.key] ?? "", tableSort.direction)),
    [authors, tableSort],
  );

  function updateSort(key: AuthorSortKey) {
    setTableSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }

  function markAuthorDirty(authorId: string) {
    setDirtyAuthorIds((current) => (current.includes(authorId) ? current : [...current, authorId]));
  }

  function exportAuthors() {
    downloadCsv(
      "authors.csv",
      ["Name", "Bio"],
      sortedAuthors.map((author) => [author.name, author.bio || ""]),
    );
  }

  function handleSearchAuthors(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setAuthorSearch(String(formData.get("authorSearch") ?? "").trim());
  }

  return (
    <CatalogShell
      protectedPage
      eyebrow="Author registry"
      title="Manage authors"
      description="Create and edit author records used by catalog metadata."
      actions={
        <>
          <button type="button" onClick={exportAuthors} className="rounded-full bg-[#E60028] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#E60028]/20 transition hover:-translate-y-0.5">
            Export authors
          </button>
          <SecondaryAction href="/staff/books">Back to staff books</SecondaryAction>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={handleSubmit} className="rounded-xl border border-[#EDEDF2] bg-[#F8F9FA] p-5">
          <h2 className="text-lg font-bold text-[#000054]">{editing ? "Edit author" : "Create author"}</h2>
          <label className="mt-4 block">
            <span className="text-xs font-bold uppercase tracking-wide text-[#000054]">Name</span>
            <input
              name="name"
              value={formValues.name}
              onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-[#D9DCE8] bg-white px-4 py-3 outline-none focus:border-[#337AB7]"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-bold uppercase tracking-wide text-[#000054]">Bio</span>
            <textarea
              name="bio"
              value={formValues.bio}
              onChange={(event) => setFormValues((current) => ({ ...current, bio: event.target.value }))}
              rows={4}
              className="mt-2 w-full rounded-xl border border-[#D9DCE8] bg-white px-4 py-3 outline-none focus:border-[#337AB7]"
            />
          </label>
          <button type="submit" className="mt-5 rounded-full bg-[#E60028] px-5 py-3 text-sm font-bold text-white">
            {editing ? "Save author" : "Create author"}
          </button>
        </form>

        <section>
          <div className="grid gap-3">
            {message ? <Notice tone="success" message={message} /> : null}
            {error ? <Notice tone="error" message={error} /> : null}
          </div>
          <form onSubmit={handleSearchAuthors} className="mt-4 flex flex-col gap-3 rounded-xl border border-[#EDEDF2] bg-[#F8F9FA] p-4 sm:flex-row">
            <label className="min-w-0 flex-1">
              <span className="text-xs font-bold uppercase tracking-wide text-[#000054]">Search author name</span>
              <input
                name="authorSearch"
                defaultValue={authorSearch}
                placeholder="Type author name..."
                className="mt-2 h-12 w-full rounded-xl border border-[#D9DCE8] bg-white px-4 outline-none transition focus:border-[#337AB7]"
              />
            </label>
            <div className="flex items-end gap-2">
              <button type="submit" className="h-12 rounded-full bg-[#000054] px-5 text-sm font-bold text-white">Search</button>
              <button type="button" onClick={() => setAuthorSearch("")} className="h-12 rounded-full border border-[#D9DCE8] px-5 text-sm font-bold text-[#000054]">Clear</button>
            </div>
          </form>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#EDEDF2] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#337AB7]">Authors shown</p>
              <p className="mt-2 text-3xl font-bold text-[#000054]">{authors.length}</p>
              <p className="mt-1 text-sm text-[#333333]">{authorSearch ? `Filtered by "${authorSearch}"` : "Full author registry"}</p>
            </div>
            <div className="rounded-xl border border-[#EDEDF2] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#337AB7]">Unsaved edits</p>
              <p className="mt-2 text-3xl font-bold text-[#000054]">{dirtyAuthorIds.length}</p>
              <p className="mt-1 text-sm text-[#333333]">{dirtyAuthorIds.length ? "Save changes in the table below." : "All visible rows are clean."}</p>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-[#EDEDF2]">
            <table className="w-full border-collapse bg-white text-left text-sm">
              <thead className="bg-[#000054] text-white">
                <tr>
                  <th className="px-4 py-3"><SortableHeader active={tableSort.key === "name"} direction={tableSort.direction} onClick={() => updateSort("name")}>Name</SortableHeader></th>
                  <th className="px-4 py-3"><SortableHeader active={tableSort.key === "bio"} direction={tableSort.direction} onClick={() => updateSort("bio")}>Bio</SortableHeader></th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedAuthors.map((author) => {
                  const authorId = entityIdOf(author);

                  return (
                  <tr key={authorId} className="border-t border-[#EDEDF2] align-top">
                    <td className="px-4 py-3">
                      <form id={`author-${authorId}`} onSubmit={(event) => event.preventDefault()}>
                        <input name="name" defaultValue={author.name} onChange={() => markAuthorDirty(authorId)} className="w-full rounded-lg border border-[#D9DCE8] px-3 py-2 font-bold text-[#000054] outline-none focus:border-[#337AB7]" />
                      </form>
                    </td>
                    <td className="px-4 py-3 text-[#333333]">
                      <textarea form={`author-${authorId}`} name="bio" defaultValue={author.bio || ""} onChange={() => markAuthorDirty(authorId)} rows={3} className="w-full rounded-lg border border-[#D9DCE8] px-3 py-2 outline-none focus:border-[#337AB7]" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleInlineSave(author, document.getElementById(`author-${authorId}`) as HTMLFormElement)}
                          className="rounded-full border border-[#D9DCE8] px-3 py-1.5 font-bold text-[#000054]"
                        >
                          {dirtyAuthorIds.includes(authorId) ? "Save changes" : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(author);
                            setFormValues({ bio: author.bio ?? "", name: author.name });
                          }}
                          className="rounded-full border border-[#D9DCE8] px-3 py-1.5 font-bold text-[#337AB7]"
                        >
                          Open form
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </CatalogShell>
  );
}
