"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { CatalogShell, Notice } from "@/features/catalog/components/CatalogShell";
import { useLanguage } from "@/features/i18n/context/LanguageContext";
import { FineRecord } from "../types/circulation.type";
import { getMyFines } from "../services/circulationService";
import { formatDate, money, statusLabel, titleOf } from "./circulationHelpers";

const copy = {
  en: {
    eyebrow: "My fines",
    title: "Fine ledger",
    description: "Read-only summary of library fines. Payments are not available in this frontend yet.",
    loading: "Loading fines...",
    loadError: "Could not load fines.",
    empty: "You do not have any fines.",
    headings: ["Book", "Borrow ID", "Amount", "Status", "Returned", "Note"],
  },
  vi: {
    eyebrow: "Tiền phạt",
    title: "Sổ tiền phạt",
    description: "Tóm tắt tiền phạt thư viện ở chế độ chỉ đọc. Chức năng thanh toán chưa có trên giao diện này.",
    loading: "Đang tải tiền phạt...",
    loadError: "Không thể tải danh sách tiền phạt.",
    empty: "Bạn chưa có khoản phạt nào.",
    headings: ["Sách", "Mã mượn", "Số tiền", "Trạng thái", "Ngày trả", "Ghi chú"],
  },
};

export function UserFinesPage() {
  const { locale } = useLanguage();
  const text = copy[locale];
  const { accessToken, refresh } = useAuth();
  const [fines, setFines] = useState<FineRecord[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const refreshAccessToken = useCallback(async () => (await refresh())?.accessToken ?? null, [refresh]);

  useEffect(() => {
    let isMounted = true;
    getMyFines(accessToken, refreshAccessToken)
      .then((items) => {
        if (isMounted) setFines(items ?? []);
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
    >
      {isLoading ? <Notice message={text.loading} /> : null}
      {error ? <div className="mt-3"><Notice tone="error" message={error} /></div> : null}
      <div className="mt-6 overflow-x-auto rounded-xl border border-[#EDEDF2]">
        <table className="w-full min-w-[860px] border-collapse bg-white text-left text-sm">
          <thead className="bg-[#000054] text-white">
            <tr>{text.headings.map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr>
          </thead>
          <tbody>
            {fines.map((fine, index) => (
              <tr key={fine.fineId ?? fine.id ?? index} className="border-t border-[#EDEDF2]">
                <td className="px-4 py-4 font-bold text-[#000054]">{titleOf(fine)}</td>
                <td className="px-4 py-4">{fine.borrowId ?? "-"}</td>
                <td className="px-4 py-4">{money(fine.amount, locale)}</td>
                <td className="px-4 py-4">{statusLabel(fine.status, locale)}</td>
                <td className="px-4 py-4">{formatDate(fine.returnedAt, locale)}</td>
                <td className="px-4 py-4">{fine.note ?? fine.reason ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!isLoading && !fines.length ? <div className="mt-5"><Notice message={text.empty} /></div> : null}
    </CatalogShell>
  );
}
