"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { CatalogShell, Notice, SecondaryAction } from "@/features/catalog/components/CatalogShell";
import { useLanguage } from "@/features/i18n/context/LanguageContext";
import { BorrowRecord } from "../types/circulation.type";
import { getMyBorrowHistory } from "../services/circulationService";
import { formatDate, money, statusLabel, titleOf } from "./circulationHelpers";

const copy = {
  en: {
    eyebrow: "Borrow history",
    title: "Past library loans",
    description: "Review returned loans and previous borrowing activity.",
    currentLoans: "Current loans",
    loading: "Loading borrow history...",
    loadError: "Could not load borrow history.",
    empty: "No previous loans found.",
    headings: ["Book", "Barcode", "Borrowed", "Returned", "Status", "Fine"],
  },
  vi: {
    eyebrow: "Lịch sử mượn",
    title: "Các lượt mượn trước đây",
    description: "Xem lại sách đã trả và hoạt động mượn sách trước đó.",
    currentLoans: "Sách đang mượn",
    loading: "Đang tải lịch sử mượn...",
    loadError: "Không thể tải lịch sử mượn.",
    empty: "Chưa có lịch sử mượn sách.",
    headings: ["Sách", "Mã bản sao", "Ngày mượn", "Ngày trả", "Trạng thái", "Phạt"],
  },
};

export function UserBorrowHistoryPage() {
  const { locale } = useLanguage();
  const text = copy[locale];
  const { accessToken, refresh } = useAuth();
  const [history, setHistory] = useState<BorrowRecord[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const refreshAccessToken = useCallback(async () => (await refresh())?.accessToken ?? null, [refresh]);

  useEffect(() => {
    let isMounted = true;
    getMyBorrowHistory(accessToken, refreshAccessToken)
      .then((items) => {
        if (isMounted) setHistory(items ?? []);
      })
      .catch((fetchError) => {
        if (isMounted) setError(fetchError instanceof Error ? fetchError.message : text.loadError);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken, refreshAccessToken, text.loadError]);

  return (
    <CatalogShell
      protectedPage
      eyebrow={text.eyebrow}
      title={text.title}
      description={text.description}
      actions={<SecondaryAction href="/user/loans">{text.currentLoans}</SecondaryAction>}
    >
      {isLoading ? <Notice message={text.loading} /> : null}
      {error ? <div className="mt-3"><Notice tone="error" message={error} /></div> : null}
      <div className="mt-6 overflow-x-auto rounded-xl border border-[#EDEDF2]">
        <table className="w-full min-w-[860px] border-collapse bg-white text-left text-sm">
          <thead className="bg-[#000054] text-white">
            <tr>{text.headings.map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr>
          </thead>
          <tbody>
            {history.map((loan, index) => (
              <tr key={`${loan.borrowId ?? loan.id ?? index}-${loan.barcode}`} className="border-t border-[#EDEDF2]">
                <td className="px-4 py-4 font-bold text-[#000054]">{titleOf(loan)}</td>
                <td className="px-4 py-4">{loan.barcode ?? "-"}</td>
                <td className="px-4 py-4">{formatDate(loan.borrowedAt ?? loan.checkoutAt, locale)}</td>
                <td className="px-4 py-4">{formatDate(loan.returnedAt, locale)}</td>
                <td className="px-4 py-4">{statusLabel(loan.status, locale)}</td>
                <td className="px-4 py-4">{money(loan.fineAmount ?? loan.fine, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!isLoading && !history.length ? <div className="mt-5"><Notice message={text.empty} /></div> : null}
    </CatalogShell>
  );
}
