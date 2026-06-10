"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { borrowEbook } from "../services/ebookService";
import { EbookLoan } from "../types/ebook.type";

type Props = {
  bookId: number;
  bookTitle?: string;
  /** Truyền vào nếu book detail page đã biết book có ebook hay chưa */
  hasEbook?: boolean;
};

/**
 * Nút "Mượn ebook" nhúng vào BookDetailPage.
 * Sau khi mượn thành công, hiển thị link đọc luôn.
 */
export function EbookBorrowButton({ bookId, bookTitle, hasEbook }: Props) {
  const { accessToken, refresh, isAuthenticated } = useAuth();
  const [loan, setLoan] = useState<EbookLoan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!hasEbook) return null;

  async function handleBorrow() {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    setError("");
    try {
      const refreshToken = async () => (await refresh())?.accessToken ?? null;
      const result = await borrowEbook(bookId, accessToken, refreshToken);
      setLoan(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể mượn ebook lúc này.");
    } finally {
      setLoading(false);
    }
  }

  // Đã mượn thành công → hiển thị link đọc
  if (loan?.status === "ACTIVE" && loan.ebookReadUrl) {
    return (
      <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-semibold text-green-800 mb-2">
          ✅ Mượn ebook thành công!
        </p>
        <p className="text-xs text-green-700 mb-3">
          Hết hạn:{" "}
          {loan.expiresAt
            ? new Date(loan.expiresAt).toLocaleDateString("vi-VN")
            : "–"}
        </p>
        <a
          href={loan.ebookReadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#000054] px-4 py-2 text-sm font-semibold text-white hover:bg-[#000080] transition-colors"
        >
          📖 Đọc ebook ngay
        </a>
        <a
          href="/user/ebook-loans"
          className="ml-3 text-xs text-[#337AB7] hover:underline"
        >
          Quản lý ebook
        </a>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {error && (
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <button
        onClick={handleBorrow}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border-2 border-[#000054] px-5 py-2.5 text-sm font-bold text-[#000054] hover:bg-[#000054] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Đang xử lý...
          </>
        ) : (
          <>📱 Mượn ebook miễn phí</>
        )}
      </button>
      {!isAuthenticated && (
        <p className="mt-1.5 text-xs text-gray-500">
          Bạn cần{" "}
          <a href="/login" className="text-[#337AB7] hover:underline font-medium">
            đăng nhập
          </a>{" "}
          để mượn ebook.
        </p>
      )}
    </div>
  );
}
