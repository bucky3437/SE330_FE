export type BorrowRecord = {
  borrowId?: number;
  id?: number;
  bookTitle?: string;
  title?: string;
  barcode?: string;
  borrowedAt?: string;
  checkoutAt?: string;
  dueAt?: string;
  dueDate?: string;
  returnedAt?: string | null;
  status?: string;
  renewCount?: number;
  maxRenewals?: number;
  fineAmount?: number;
  fine?: number;
};

export type RenewBorrowResponse = BorrowRecord & {
  message?: string;
  newDueAt?: string;
  newDueDate?: string;
};

export type HoldRecord = {
  holdId?: number;
  id?: number;
  bookId?: number;
  bookTitle?: string;
  title?: string;
  status?: string;
  queuePosition?: number;
  assignedBarcode?: string | null;
  barcode?: string | null;
  placedAt?: string;
  createdAt?: string;
  expiresAt?: string | null;
  pickupExpiresAt?: string | null;
};

export type FineRecord = {
  fineId?: number;
  id?: number;
  borrowId?: number;
  bookTitle?: string;
  title?: string;
  amount?: number;
  status?: string;
  returnedAt?: string | null;
  note?: string | null;
  reason?: string | null;
};

export type CheckoutRequest = {
  memberId: number;
  itemBarcode: string;
};

export type CheckoutPreviewResponse = {
  allowed?: boolean;
  memberId?: number;
  memberName?: string;
  memberEmail?: string;
  bookId?: number;
  bookTitle?: string;
  title?: string;
  bookCopyId?: number;
  itemBarcode?: string;
  itemStatus?: string;
  loanPeriodDays?: number;
  barcode?: string;
  dueAt?: string;
  dueDate?: string;
  maxRenewals?: number;
  warnings?: string[];
  reasons?: string[];
};

export type CheckoutResponse = BorrowRecord & {
  memberName?: string;
};

export type CheckinResponse = {
  barcode?: string;
  bookTitle?: string;
  returnedAt?: string;
  overdueDays?: number;
  fineAmount?: number;
  copyStatus?: string;
  nextHoldId?: number | null;
  nextHoldStatus?: string | null;
};

export type BookImportJob = {
  jobId?: string;
  id?: string;
  filename?: string;
  status?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | string;
  totalRows?: number;
  processedRows?: number;
  successRows?: number;
  failedRows?: number;
  createdBooks?: number;
  createdCopies?: number;
  errors?: Array<{
    rowNumber?: number;
    isbn?: string;
    barcode?: string;
    code?: string;
    message?: string;
  }>;
};

export type StaffLoanRecord = {
  borrowId?: number;
  id?: number;
  memberId?: number;
  memberName?: string;
  memberEmail?: string;
  bookId?: number;
  bookTitle?: string;
  title?: string;
  bookCopyId?: number;
  itemBarcode?: string;
  barcode?: string;
  copyStatus?: string;
  borrowedAt?: string;
  checkoutAt?: string;
  dueDate?: string;
  dueAt?: string;
  returnedAt?: string | null;
  status?: string;
  renewCount?: number;
  maxRenewals?: number;
  fineAmount?: number;
  fine?: number;
  fineStatus?: string;
  overdue?: boolean;
  daysOverdue?: number;
};

export type StaffLoanSearchParams = {
  q?: string;
  status?: string;
  openOnly?: string;
  overdue?: string;
  dueFrom?: string;
  dueTo?: string;
  page?: string;
  size?: string;
};

export type StaffMemberSummary = {
  memberId?: number;
  id?: number;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  maxBorrowLimit?: number;
  membershipExpiresAt?: string | null;
  activeLoansCount?: number;
  overdueLoansCount?: number;
  activeHoldsCount?: number;
  unpaidFineTotal?: number;
  createdAt?: string;
};

export type StaffMemberDetail = StaffMemberSummary & {
  openLoansCount?: number;
  borrowHistoryCount?: number;
  updatedAt?: string;
};

export type StaffMemberSearchParams = {
  q?: string;
  status?: string;
  hasOverdue?: string;
  page?: string;
  size?: string;
};

export type StaffMemberLoansParams = {
  status?: string;
  openOnly?: string;
  overdue?: string;
  page?: string;
  size?: string;
};

export type StaffHoldRecord = {
  holdId?: number;
  id?: number;
  memberId?: number;
  memberName?: string;
  memberEmail?: string;
  bookId?: number;
  bookTitle?: string;
  title?: string;
  status?: string;
  queuePosition?: number;
  assignedCopyId?: number | null;
  assignedCopyBarcode?: string | null;
  assignedBarcode?: string | null;
  barcode?: string | null;
  reservedAt?: string;
  notifiedAt?: string | null;
  expiresAt?: string | null;
};

export type StaffHoldSearchParams = {
  status?: string;
  page?: string;
  size?: string;
};

export type StaffDashboardSummary = {
  activeLoans?: number;
  overdueLoans?: number;
  holdsReadyForPickup?: number;
  unpaidFineCount?: number;
  unpaidFineTotal?: number;
  borrowedToday?: number;
  returnedToday?: number;
  generatedAt?: string;
};

export type StaffPageResult<T> = {
  items: T[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
};
