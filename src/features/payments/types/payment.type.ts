export type PaymentPurpose = "EBOOK_PAYMENT" | "OVERDUE_FINE" | string;

export type PaymentTargetType = "BOOK_EBOOK" | "BORROW_RECORD" | string;

export type PaymentProvider = "VNPAY";

export type PaymentStatus = "PENDING" | "PAID" | "SUCCESS" | "CANCELLED" | "EXPIRED" | "FAILED" | string;

export type PaymentReceiptResponse = {
  paymentId: number;
  receiptNumber: string;
  paymentCode: string;
  memberId: number;
  memberName: string;
  memberEmail: string;
  provider: string;
  providerTransactionId: string | null;
  providerResponseCode: string | null;
  providerTransactionStatus: string | null;
  purpose: string;
  targetType: string;
  targetId: number;
  itemTitle: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string;
  createdAt: string;
};

export type PaymentDashboardSummaryResponse = {
  totalPayments: number;
  successPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalRevenue: number;
  todayRevenue: number;
  todaySuccessPayments: number;
  currency: string;
  generatedAt: string;
};

export type AdminPaymentRowResponse = {
  paymentId: number;
  paymentCode: string;
  memberId: number;
  memberName: string;
  memberEmail: string;
  provider: string;
  providerTransactionId: string | null;
  purpose: string;
  targetType: string;
  targetId: number;
  itemTitle: string;
  amount: number;
  currency: string;
  status: string;
  providerResponseCode: string | null;
  providerTransactionStatus: string | null;
  paidAt: string | null;
  expiredAt: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePaymentPayload = {
  purpose: PaymentPurpose;
  targetType: PaymentTargetType;
  targetId: number;
  provider: PaymentProvider;
  bankCode?: string;
  locale?: string;
};

export type Payment = {
  paymentId?: number;
  paymentCode?: string;
  provider?: string;
  purpose?: string;
  targetType?: string;
  targetId?: number;
  status?: PaymentStatus;
  amount?: number;
  currency?: string;
  paymentUrl?: string;
  providerResponseCode?: string | null;
  providerTransactionStatus?: string | null;
  paidAt?: string | null;
  cancelledAt?: string | null;
  expiredAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type VnpayReturnConfirmResponse = {
  paymentCode?: string;
  status?: PaymentStatus;
};
