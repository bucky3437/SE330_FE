"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { hasStaffAccessFromToken } from "@/features/auth/utils/authRoles";
import { CatalogShell, Notice, SecondaryAction } from "@/features/catalog/components/CatalogShell";
import { BookImportJob } from "../types/circulation.type";
import { getImportJob } from "../services/circulationService";

export function ImportJobPage() {
  const { accessToken, hasStaffAccess, refresh } = useAuth();
  const [jobId, setJobId] = useState("");
  const [job, setJob] = useState<BookImportJob | null>(null);
  const [error, setError] = useState("");
  const canUseStaffApi = hasStaffAccess || hasStaffAccessFromToken(accessToken);
  const refreshAccessToken = useCallback(async () => (await refresh())?.accessToken ?? null, [refresh]);

  useEffect(() => {
    if (!jobId || job?.status === "COMPLETED" || job?.status === "FAILED") return;

    let isCancelled = false;
    const timerId = window.setInterval(() => {
      getImportJob(jobId, accessToken, refreshAccessToken)
        .then((data) => {
          if (!isCancelled) {
            setJob(data);
            setError("");
          }
        })
        .catch((fetchError) => {
          if (!isCancelled) setError(fetchError instanceof Error ? fetchError.message : "Could not load import job.");
        });
    }, 2000);

    return () => {
      isCancelled = true;
      window.clearInterval(timerId);
    };
  }, [accessToken, job?.status, jobId, refreshAccessToken]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextJobId = String(formData.get("jobId") ?? "").trim();
    setJobId(nextJobId);

    if (!nextJobId) {
      setError("Job ID is required.");
      return;
    }

    try {
      const data = await getImportJob(nextJobId, accessToken, refreshAccessToken);
      setJob(data);
      setError("");
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Could not load import job.");
    }
  }

  const totalRows = job?.totalRows ?? 0;
  const processedRows = job?.processedRows ?? job?.successRows ?? 0;
  const progress = totalRows ? Math.min(100, Math.round((processedRows / totalRows) * 100)) : 0;

  return (
    <CatalogShell
      protectedPage
      eyebrow="Import progress"
      title="CSV import job status"
      description="Track asynchronous CSV import jobs by job ID."
      actions={<SecondaryAction href="/staff/books/import">Upload CSV</SecondaryAction>}
    >
      {!canUseStaffApi ? <Notice tone="error" message="This workspace requires LIBRARIAN or ADMIN access." /> : null}
      <form onSubmit={handleSubmit} className="max-w-xl rounded-xl border border-[#EDEDF2] bg-[#F8F9FA] p-5">
        <span className="text-xs font-bold uppercase tracking-wide text-[#000054]">Job ID</span>
        <input name="jobId" className="mt-2 w-full rounded-xl border border-[#D9DCE8] bg-white px-4 py-3 outline-none focus:border-[#337AB7]" />
        <button type="submit" disabled={!canUseStaffApi} className="mt-5 rounded-full bg-[#E60028] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">Track job</button>
      </form>
      {error ? <div className="mt-5"><Notice tone="error" message={error} /></div> : null}
      {job ? (
        <section className="mt-6 rounded-xl border border-[#EDEDF2] bg-white p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#000054]">{job.filename ?? `Job ${job.jobId ?? job.id ?? jobId}`}</h2>
              <p className="mt-1 text-sm font-semibold text-[#337AB7]">{job.status ?? "UNKNOWN"}</p>
            </div>
            <p className="text-2xl font-bold text-[#000054]">{progress}%</p>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#EDEDF2]">
            <div className="h-full rounded-full bg-[#E60028]" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Total", job.totalRows ?? 0],
              ["Processed", processedRows],
              ["Success", job.successRows ?? 0],
              ["Failed", job.failedRows ?? 0],
              ["Copies", job.createdCopies ?? 0],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-[#EDEDF2] bg-[#F8F9FA] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#337AB7]">{label}</p>
                <p className="mt-2 text-2xl font-bold text-[#000054]">{value}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </CatalogShell>
  );
}
