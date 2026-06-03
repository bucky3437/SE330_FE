"use client";

import Link from "next/link";
import { useLanguage } from "@/features/i18n/context/LanguageContext";
import { StaffLoanRecord } from "../types/circulation.type";
import { formatDate, money, statusLabel } from "./circulationHelpers";

type StaffLoanTableProps = {
  loans: StaffLoanRecord[];
  emptyMessage?: string;
};

const copy = {
  en: {
    empty: "No loan records found.",
    headings: ["Member", "Book", "Barcode", "Borrowed", "Due", "Returned", "Status", "Renewals", "Fine"],
    member: "Member",
    openCopies: "Open physical copies",
    daysOverdue: "days overdue",
    copy: "Copy",
    pagination: "Pagination",
    previous: "Previous",
    next: "Next",
  },
  vi: {
    empty: "Không tìm thấy lượt mượn.",
    headings: ["Người mượn", "Sách", "Mã bản sao", "Ngày mượn", "Hạn trả", "Ngày trả", "Trạng thái", "Gia hạn", "Phạt"],
    member: "Thành viên",
    openCopies: "Mở bản sao vật lý",
    daysOverdue: "ngày quá hạn",
    copy: "Bản sao",
    pagination: "Phân trang",
    previous: "Trước",
    next: "Sau",
  },
};

export function StaffLoanTable({ loans, emptyMessage }: StaffLoanTableProps) {
  const { locale } = useLanguage();
  const text = copy[locale];
  if (!loans.length) {
    return (
      <div className="rounded-xl border border-[#EDEDF2] bg-[#F8F9FA] p-5 text-sm font-semibold text-[#333333]">
        {emptyMessage ?? text.empty}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#EDEDF2]">
      <table className="w-full min-w-[1120px] border-collapse bg-white text-left text-sm">
        <thead className="bg-[#000054] text-white">
          <tr>
            {text.headings.map((heading) => (
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
                        {loan.memberName || `${text.member} ${memberId}`}
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
                      {text.openCopies}
                    </Link>
                  ) : null}
                </td>
                <td className="px-4 py-4 font-mono text-xs font-semibold text-[#333333]">{loan.itemBarcode ?? loan.barcode ?? "-"}</td>
                <td className="px-4 py-4 text-[#333333]">{formatDate(loan.borrowedAt ?? loan.checkoutAt, locale)}</td>
                <td className="px-4 py-4">
                  <span className={loan.overdue ? "font-bold text-[#E60028]" : "text-[#333333]"}>
                    {formatDate(loan.dueDate ?? loan.dueAt, locale)}
                  </span>
                  {loan.daysOverdue ? <p className="mt-1 text-xs font-bold text-[#E60028]">{loan.daysOverdue} {text.daysOverdue}</p> : null}
                </td>
                <td className="px-4 py-4 text-[#333333]">{formatDate(loan.returnedAt, locale)}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={loan.status} overdue={loan.overdue} />
                  {loan.copyStatus ? <p className="mt-2 text-xs font-semibold text-[#333333]/75">{text.copy}: {statusLabel(loan.copyStatus, locale)}</p> : null}
                </td>
                <td className="px-4 py-4 font-semibold text-[#333333]">
                  {loan.renewCount ?? 0} / {loan.maxRenewals ?? "-"}
                </td>
                <td className="px-4 py-4">
                  <span className="font-semibold text-[#333333]">{money(loan.fineAmount ?? loan.fine, locale)}</span>
                  {loan.fineStatus ? <p className="mt-1 text-xs font-bold uppercase text-[#337AB7]">{statusLabel(loan.fineStatus, locale)}</p> : null}
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
  const { locale } = useLanguage();
  const text = copy[locale];
  const safeTotalPages = Math.max(totalPages || 1, 1);
  const pages = buildPaginationPages(currentPage, safeTotalPages);

  return (
    <nav className="mt-6 flex justify-center rounded-2xl border border-[#EDEDF2] bg-white px-5 py-4 shadow-sm" aria-label={text.pagination}>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 0}
          className="rounded-full border border-[#D9DCE8] px-4 py-2 text-sm font-bold text-[#000054] transition hover:border-[#337AB7] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {text.previous}
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
          {text.next}
        </button>
      </div>
    </nav>
  );
}

export function StatusBadge({ status, overdue }: { status?: string; overdue?: boolean }) {
  const { locale } = useLanguage();
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
      {statusLabel(normalizedStatus, locale)}
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
