/**
 * Ebook types and interfaces
 */

export interface Ebook {
  id: number;
  bookId: number;
  bookTitle: string;
  fileFormat: "PDF" | "EPUB" | "MOBI" | "AZW3";
  fileSizeMb: number;
  allowDownload: boolean;
  allowPrint: boolean;
  enableWatermark: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EbookLoan {
  id: number;
  ebookId: number;
  ebookTitle: string;
  fileFormat: string;
  borrowedAt: string;
  dueDate: string;
  status: "ACTIVE" | "RETURNED" | "EXPIRED";
  renewalCount: number;
  maxRenewals: number;
  canRenew: boolean;
  lastAccessedAt: string | null;
  accessCount: number;
  isOverdue: boolean;
  // accessToken is stored locally after borrowing (not returned by getActiveLoans API)
  accessToken?: string;
}

export interface BorrowEbookResponse {
  loanId: number;
  ebookId: number;
  ebookTitle: string;
  fileFormat: string;
  dueDate: string;
  accessToken: string;
  tokenExpiresAt: string;
  downloadUrl: string;
  viewerUrl: string;
}

export interface RenewEbookResponse {
  loanId: number;
  newDueDate: string;
  renewalCount: number;
  maxRenewals: number;
  canRenewAgain: boolean;
}

export interface BorrowEbookRequest {
  bookId: number;
  accessDurationHours?: number;
}
