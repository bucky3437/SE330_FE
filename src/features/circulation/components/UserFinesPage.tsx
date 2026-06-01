"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { CatalogShell, Notice } from "@/features/catalog/components/CatalogShell";
import { FineRecord } from "../types/circulation.type";
import { getMyFines } from "../services/circulationService";
import { formatDate, money, titleOf } from "./circulationHelpers";

export function UserFinesPage() {
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
        if (isMounted) setError(fetchError instanceof Error ? fetchError.message : "Could not load fines.");
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
      eyebrow="My fines"
      title="Fine ledger"
      description="Read-only summary of library fines. Payments are not available in this frontend yet."
    >
      {isLoading ? <Notice message="Loading fines..." /> : null}
      {error ? <div className="mt-3"><Notice tone="error" message={error} /></div> : null}
      <div className="mt-6 overflow-x-auto rounded-xl border border-[#EDEDF2]">
        <table className="w-full min-w-[860px] border-collapse bg-white text-left text-sm">
          <thead className="bg-[#000054] text-white">
            <tr>{["Book", "Borrow ID", "Amount", "Status", "Returned", "Note"].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr>
          </thead>
          <tbody>
            {fines.map((fine, index) => (
              <tr key={fine.fineId ?? fine.id ?? index} className="border-t border-[#EDEDF2]">
                <td className="px-4 py-4 font-bold text-[#000054]">{titleOf(fine)}</td>
                <td className="px-4 py-4">{fine.borrowId ?? "-"}</td>
                <td className="px-4 py-4">{money(fine.amount)}</td>
                <td className="px-4 py-4">{fine.status ?? "-"}</td>
                <td className="px-4 py-4">{formatDate(fine.returnedAt)}</td>
                <td className="px-4 py-4">{fine.note ?? fine.reason ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CatalogShell>
  );
}
