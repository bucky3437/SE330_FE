"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ApiError } from "@/types/api.type";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/features/auth/context/AuthContext";
import { ImportCsvResult } from "../types/catalog.type";
import { importBooksCsv } from "../services/catalogService";
import { CatalogShell, Notice, SecondaryAction } from "./CatalogShell";

export function ImportBooksPage() {
  const { accessToken, currentUser, hasStaffAccess, refresh } = useAuth();
  const [result, setResult] = useState<ImportCsvResult | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get("file");

    if (!(file instanceof File) || !file.size) {
      setError("Please select a CSV file.");
      return;
    }

    setIsSubmitting(true);
    setSelectedFileName(file.name);
    try {
      const data = await importBooksCsv(file, accessToken);
      setResult(data);
      setError("");
    } catch (submitError) {
      if (submitError instanceof ApiError && (submitError.status === 401 || submitError.status === 403)) {
        const refreshedSession = await refresh();

        if (refreshedSession?.accessToken) {
          try {
            const data = await importBooksCsv(file, refreshedSession.accessToken);
            setResult(data);
            setError("");
            return;
          } catch (retryError) {
            setError(getImportErrorMessage(retryError, currentUser?.role));
            return;
          }
        }
      }

      setError(submitError instanceof Error ? submitError.message : "Could not import CSV.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CatalogShell
      protectedPage
      eyebrow="CSV import"
      title="Import books and copies"
      description="Upload catalog records in bulk and review row-level errors returned by the backend."
      actions={<SecondaryAction href="/staff/books">Back to staff books</SecondaryAction>}
    >
      <div className="mb-6 grid gap-3 rounded-xl border border-[#EDEDF2] bg-white p-4 md:grid-cols-3">
        {[
          ["1", "Choose file", selectedFileName || "Select a CSV file"],
          ["2", "Import", isSubmitting ? "Backend is processing rows" : result ? "Import completed" : "Ready when file is selected"],
          ["3", "Review", result ? "Summary and row errors available" : "Waiting for result"],
        ].map(([step, title, body], index) => {
          const isActive = (index === 0 && !isSubmitting && !result) || (index === 1 && isSubmitting) || (index === 2 && result);

          return (
            <div key={step} className={`rounded-xl border px-4 py-3 transition ${isActive ? "border-[#337AB7] bg-[#337AB7]/8" : "border-[#EDEDF2] bg-[#F8F9FA]"}`}>
              <div className="flex items-center gap-3">
                <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${isActive ? "bg-[#E60028] text-white" : "bg-white text-[#000054]"}`}>{step}</span>
                <div>
                  <p className="font-bold text-[#000054]">{title}</p>
                  <p className="text-xs font-semibold text-[#333333]">{body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isSubmitting ? (
        <div className="mb-6 rounded-xl border border-[#D9DCE8] bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-[#000054]">Import in progress</p>
            <p className="text-xs font-semibold text-[#337AB7]">{selectedFileName}</p>
          </div>
          <ProgressBar indeterminate color="primary" size="md" />
        </div>
      ) : null}

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
        <form onSubmit={handleSubmit} className="min-w-0 rounded-xl border border-[#EDEDF2] bg-[#F8F9FA] p-5">
          <h2 className="text-lg font-bold text-[#000054]">Upload CSV</h2>
          {!hasStaffAccess ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              Your current role is {currentUser?.role ?? "unknown"}. CSV import requires LIBRARIAN or ADMIN.
            </div>
          ) : null}
          <input
            name="file"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => setSelectedFileName(event.target.files?.[0]?.name ?? "")}
            className="mt-4 w-full rounded-xl border border-[#D9DCE8] bg-white px-4 py-3 text-sm"
          />
          <button disabled={isSubmitting || !hasStaffAccess} className="mt-5 w-full rounded-full bg-[#E60028] px-5 py-3 text-sm font-bold text-white disabled:opacity-60" type="submit">
            {isSubmitting ? "Importing..." : "Import CSV"}
          </button>
          <div className="mt-5 rounded-xl border border-[#D9DCE8] bg-white p-4">
            <p className="text-sm font-bold text-[#000054]">Suggested columns</p>
            <code className="mt-3 block whitespace-pre-wrap rounded-lg bg-[#000054] p-3 text-xs leading-5 text-white">
              title,isbn,authors,category,barcode,condition,location,language,published_date,edition
            </code>
          </div>
        </form>

        <section className="min-w-0 rounded-xl border border-[#EDEDF2] bg-white p-5">
          <h2 className="text-lg font-bold text-[#000054]">Import result</h2>
          <div className="mt-4 grid gap-3">
            {error ? <Notice tone="error" message={error} /> : null}
            {!result && !error ? <Notice message="Result summary will appear after upload." /> : null}
          </div>
          {result ? (
            <>
              {result.jobId || result.id ? (
                <div className="mt-4 rounded-xl border border-[#D9DCE8] bg-[#F8F9FA] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#337AB7]">Import job</p>
                  <p className="mt-2 font-bold text-[#000054]">{result.jobId ?? result.id}</p>
                  <Link href="/staff/imports" className="mt-3 inline-flex rounded-full border border-[#D9DCE8] px-4 py-2 text-sm font-bold text-[#000054]">
                    Track job
                  </Link>
                </div>
              ) : null}
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                {[
                  ["Total rows", result.totalRows ?? 0],
                  ["Success", result.successRows ?? 0],
                  ["Failed", result.failedRows ?? 0],
                  ["Books", result.createdBooks ?? 0],
                  ["Copies", result.createdCopies ?? 0],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-[#EDEDF2] bg-[#F8F9FA] p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#337AB7]">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-[#000054]">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 max-w-full overflow-x-auto rounded-xl border border-[#EDEDF2]">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead className="bg-[#000054] text-white">
                    <tr>
                      {["Row", "ISBN", "Barcode", "Code", "Message"].map((heading) => (
                        <th key={heading} className="px-4 py-3 font-bold">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(result.errors ?? []).map((row, index) => (
                      <tr key={`${row.rowNumber}-${index}`} className="border-t border-[#EDEDF2]">
                        <td className="px-4 py-3">{row.rowNumber ?? "-"}</td>
                        <td className="px-4 py-3">{row.isbn ?? "-"}</td>
                        <td className="px-4 py-3">{row.barcode ?? "-"}</td>
                        <td className="px-4 py-3 font-bold text-[#E60028]">{row.code ?? "-"}</td>
                        <td className="px-4 py-3">{row.message ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </CatalogShell>
  );
}

function getImportErrorMessage(error: unknown, role?: string) {
  if (error instanceof ApiError && error.status === 403) {
    return `Import was forbidden by the backend. Current profile role is ${role ?? "unknown"}; backend may require the access token authority to include LIBRARIAN/ADMIN.`;
  }

  return error instanceof Error ? error.message : "Could not import CSV.";
}
