// src/features/ebook/types/ebook.type.ts

export type EbookLoanStatus = "ACTIVE" | "EXPIRED" | "RETURNED";

export type EbookLoan = {
  loanId?: number;
  id?: number;
  bookId?: number;
  bookTitle?: string;
  isbn?: string;
  status?: EbookLoanStatus;
  borrowedAt?: string;
  expiresAt?: string;
  returnedAt?: string | null;
  renewCount?: number;
  maxRenewals?: number;
  canRenew?: boolean;
  /** Chỉ có khi status === ACTIVE */
  ebookReadUrl?: string | null;
};

export type BorrowEbookRequest = {
  bookId: number;
};

export type EbookPageParams = {
  history?: boolean;
  page?: number;
  size?: number;
};
