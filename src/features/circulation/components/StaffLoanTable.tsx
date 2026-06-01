"use client";

import Link from "next/link";
import { StaffLoanRecord } from "../types/circulation.type";
import { formatDate, money } from "./circulationHelpers";

type StaffLoanTableProps = {
  loans: StaffLoanRecord[];
  emptyMessage?: string;
};

export function StaffLoanTable({ loans, emptyMessage = "No loan records found." }: StaffLoanTableProps) {
  if (!loans.length) {
    return (
      <div className="rounded-xl border border-[#EDEDF2] bg-[#F8F9FA] p-5 text-sm font-semibold text-[#333333]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#EDEDF2]">
      <table className="w-full min-w-[1120px] border-collapse bg-white text-left text-sm">
        <thead className="bg-[#000054] text-white">
          <tr>
            {["Member", "Book", "Barcode", "Borrowed", "Due", "Returned", "Status", "Renewals", "Fine"].map((heading) => (
              <th key={heading} className="px-4 py-3 font-bold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => {
            const memberId = idOf(loan.memberId);
            const bookId = idOf(loan.bookId);

            return (
              <tr key={loanKey(loan)} className="border-t border-[#EDEDF2] align-top transition hover:bg-[#F8F9FA]">
                <td className="px-4 py-4">
                  <div className="font-bold text-[#000054]">
                    {memberId ? (
                      <Link href={`/staff/members/${memberId}`} className="hover:text-[#337AB7]">
                        {loan.memberName || `Member ${memberId}`}
                      </Link>
                    ) : (
                      loan.memberName || "-"
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#333333]/75">{loan.memberEmail || "-"}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="font-bold text-[#000054]">{loan.bookTitle ?? loan.title ?? "-"}</div>
                  {bookId ? (
                    <Link href={`/staff/books/${bookId}/copies`} className="mt-1 inline-flex text-xs font-bold text-[#337AB7] hover:text-[#E60028]">
                      Open physical copies
                    </Link>
                  ) : null}
                </td>
                <td className="px-4 py-4 font-mono text-xs font-semibold text-[#333333]">{loan.itemBarcode ?? loan.barcode ?? "-"}</td>
                <td className="px-4 py-4 text-[#333333]">{formatDate(loan.borrowedAt ?? loan.checkoutAt)}</td>
                <td className="px-4 py-4">
                  <span className={loan.overdue ? "font-bold text-[#E60028]" : "text-[#333333]"}>
                    {formatDate(loan.dueDate ?? loan.dueAt)}
                  </span>
                  {loan.daysOverdue ? <p className="mt-1 text-xs font-bold text-[#E60028]">{loan.daysOverdue} days overdue</p> : null}
                </td>
                <td className="px-4 py-4 text-[#333333]">{formatDate(loan.returnedAt)}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={loan.status} overdue={loan.overdue} />
                  {loan.copyStatus ? <p className="mt-2 text-xs font-semibold text-[#333333]/75">Copy: {loan.copyStatus}</p> : null}
                </td>
                <td className="px-4 py-4 font-semibold text-[#333333]">
                  {loan.renewCount ?? 0} / {loan.maxRenewals ?? "-"}
                </td>
                <td className="px-4 py-4">
                  <span className="font-semibold text-[#333333]">{money(loan.fineAmount ?? loan.fine)}</span>
                  {loan.fineStatus ? <p className="mt-1 text-xs font-bold uppercase text-[#337AB7]">{loan.fineStatus}</p> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function StaffPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const safeTotalPages = Math.max(totalPages || 1, 1);
  const pages = buildPaginationPages(currentPage, safeTotalPages);

  return (
    <nav className="mt-6 flex justify-center rounded-2xl border border-[#EDEDF2] bg-white px-5 py-4 shadow-sm" aria-label="Pagination">
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
          disabled={currentPage >= safeTotalPages - 1}
          className="rounded-full border border-[#D9DCE8] px-4 py-2 text-sm font-bold text-[#000054] transition hover:border-[#337AB7] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next
        </button>
      </div>
    </nav>
  );
}

export function StatusBadge({ status, overdue }: { status?: string; overdue?: boolean }) {
  const normalizedStatus = status || "UNKNOWN";
  const classes =
    overdue || normalizedStatus === "OVERDUE"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : normalizedStatus === "BORROWED"
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : normalizedStatus === "RETURNED"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-[#D9DCE8] bg-[#F8F9FA] text-[#333333]";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${classes}`}>
      {normalizedStatus}
    </span>
  );
}

export function loanKey(loan: StaffLoanRecord) {
  return String(loan.borrowId ?? loan.id ?? `${loan.memberId ?? "member"}-${loan.bookCopyId ?? loan.itemBarcode ?? "copy"}`);
}

function idOf(value?: number) {
  return value === undefined || value === null ? "" : String(value);
}

function buildPaginationPages(currentPage: number, totalPages: number) {
  const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
  const end = Math.min(totalPages, start + 5);
  return Array.from({ length: end - start }, (_, index) => start + index);
}
