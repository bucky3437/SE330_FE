"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { CatalogShell, Notice, SecondaryAction } from "@/features/catalog/components/CatalogShell";
import { BorrowRecord } from "../types/circulation.type";
import { getMyBorrows, renewMyBorrow } from "../services/circulationService";
import { formatDate, money, recordId, titleOf } from "./circulationHelpers";

export function UserLoansPage() {
  const { accessToken, refresh } = useAuth();
  const [loans, setLoans] = useState<BorrowRecord[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [renewingBorrowId, setRenewingBorrowId] = useState<string | null>(null);
  const refreshAccessToken = useCallback(async () => (await refresh())?.accessToken ?? null, [refresh]);

  useEffect(() => {
    let isMounted = true;
    getMyBorrows(accessToken, refreshAccessToken)
      .then((items) => {
        if (isMounted) {
          setLoans(items ?? []);
          setError("");
        }
      })
      .catch((fetchError) => {
        if (isMounted) setError(fetchError instanceof Error ? fetchError.message : "Could not load loans.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken, message, refreshAccessToken]);

  async function handleRenew(borrowId: string) {
    if (!borrowId || renewingBorrowId) return;

    setRenewingBorrowId(borrowId);
    try {
      await renewMyBorrow(borrowId, accessToken, refreshAccessToken);
      setMessage("Borrow was renewed.");
      setError("");
    } catch (renewError) {
      setError(renewError instanceof Error ? renewError.message : "Could not renew borrow.");
    } finally {
      setRenewingBorrowId(null);
    }
  }

  return (
    <CatalogShell
      protectedPage
      eyebrow="My loans"
      title="Current borrowed books"
      description="Track active loans, due dates, renewals, and any fines attached to your current borrowing."
      actions={<SecondaryAction href="/user/loans/history">Borrow history</SecondaryAction>}
    >
      <div className="grid gap-3">
        {isLoading ? <Notice message="Loading your current loans..." /> : null}
        {message ? <Notice tone="success" message={message} /> : null}
        {error ? <Notice tone="error" message={error} /> : null}
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-[#EDEDF2]">
        <table className="w-full min-w-[980px] border-collapse bg-white text-left text-sm">
          <thead className="bg-[#000054] text-white">
            <tr>
              {["Book", "Barcode", "Borrowed", "Due", "Status", "Renewals", "Fine", "Action"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-bold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => {
              const id = recordId(loan);
              return (
                <tr key={id || loan.barcode} className="border-t border-[#EDEDF2]">
                  <td className="px-4 py-4 font-bold text-[#000054]">{titleOf(loan)}</td>
                  <td className="px-4 py-4">{loan.barcode ?? "-"}</td>
                  <td className="px-4 py-4">{formatDate(loan.borrowedAt ?? loan.checkoutAt)}</td>
                  <td className="px-4 py-4">{formatDate(loan.dueAt ?? loan.dueDate)}</td>
                  <td className="px-4 py-4">{loan.status ?? "-"}</td>
                  <td className="px-4 py-4">{loan.renewCount ?? 0} / {loan.maxRenewals ?? "-"}</td>
                  <td className="px-4 py-4">{money(loan.fineAmount ?? loan.fine)}</td>
                  <td className="px-4 py-4">
                    <button type="button" onClick={() => handleRenew(id)} disabled={!id || renewingBorrowId !== null} className="rounded-full border border-[#D9DCE8] px-3 py-1.5 font-bold text-[#000054] disabled:opacity-50">
                      {renewingBorrowId === id ? "Renewing..." : "Renew"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!isLoading && !loans.length ? <div className="mt-5"><Notice message="You do not have active loans." /></div> : null}
    </CatalogShell>
  );
}
