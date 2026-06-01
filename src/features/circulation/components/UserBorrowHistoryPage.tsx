"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { CatalogShell, Notice, SecondaryAction } from "@/features/catalog/components/CatalogShell";
import { BorrowRecord } from "../types/circulation.type";
import { getMyBorrowHistory } from "../services/circulationService";
import { formatDate, money, titleOf } from "./circulationHelpers";

export function UserBorrowHistoryPage() {
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
        if (isMounted) setError(fetchError instanceof Error ? fetchError.message : "Could not load borrow history.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken, refreshAccessToken]);

  return (
    <CatalogShell
      protectedPage
      eyebrow="Borrow history"
      title="Past library loans"
      description="Review returned loans and previous borrowing activity."
      actions={<SecondaryAction href="/user/loans">Current loans</SecondaryAction>}
    >
      {isLoading ? <Notice message="Loading borrow history..." /> : null}
      {error ? <div className="mt-3"><Notice tone="error" message={error} /></div> : null}
      <div className="mt-6 overflow-x-auto rounded-xl border border-[#EDEDF2]">
        <table className="w-full min-w-[860px] border-collapse bg-white text-left text-sm">
          <thead className="bg-[#000054] text-white">
            <tr>{["Book", "Barcode", "Borrowed", "Returned", "Status", "Fine"].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr>
          </thead>
          <tbody>
            {history.map((loan, index) => (
              <tr key={`${loan.borrowId ?? loan.id ?? index}-${loan.barcode}`} className="border-t border-[#EDEDF2]">
                <td className="px-4 py-4 font-bold text-[#000054]">{titleOf(loan)}</td>
                <td className="px-4 py-4">{loan.barcode ?? "-"}</td>
                <td className="px-4 py-4">{formatDate(loan.borrowedAt ?? loan.checkoutAt)}</td>
                <td className="px-4 py-4">{formatDate(loan.returnedAt)}</td>
                <td className="px-4 py-4">{loan.status ?? "-"}</td>
                <td className="px-4 py-4">{money(loan.fineAmount ?? loan.fine)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CatalogShell>
  );
}
