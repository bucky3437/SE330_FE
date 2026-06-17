"use client";

import { ApiError, ApiResponse } from "@/types/api.type";
import { API_URL } from "@/features/auth/services/authService";
import {
  AdminPaymentRowResponse,
  CreatePaymentPayload,
  Payment,
  PaymentDashboardSummaryResponse,
  PaymentReceiptResponse,
  VnpayReturnConfirmResponse,
} from "../types/payment.type";

const REQUEST_TIMEOUT_MS = 30000;

type AccessTokenRefresher = () => Promise<string | null>;

async function paymentFetch<T>(path: string, init?: RequestInit, accessToken?: string | null): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const headers = new Headers(init?.headers);

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
      signal: controller.signal,
    });
    const responseText = await response.text();
    const body = responseText ? (tryParseJson(responseText) as ApiResponse<T> | T | null) : null;

    if (!body) {
      if (response.ok) {
        return undefined as T;
      }

      throw new ApiError(responseText || `Request failed with status ${response.status}.`, response.status);
    }

    if (isApiResponse<T>(body)) {
      if (!response.ok || !body.success) {
        throw new ApiError(body.message || "Request failed.", response.status, body.code, body.traceId);
      }

      return body.data as T;
    }

    if (!response.ok) {
      throw new ApiError("Request failed.", response.status);
    }

    return body as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Request timed out. Please try again.", 408, "REQUEST_TIMEOUT");
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function paymentFetchWithRetry<T>(
  path: string,
  init: RequestInit | undefined,
  accessToken?: string | null,
  refreshAccessToken?: AccessTokenRefresher,
) {
  try {
    return await paymentFetch<T>(path, init, accessToken);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403) && refreshAccessToken) {
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        return paymentFetch<T>(path, init, refreshed);
      }
    }

    throw error;
  }
}

export function createPayment(
  payload: CreatePaymentPayload,
  idempotencyKey: string,
  accessToken: string | null,
  refreshAccessToken?: AccessTokenRefresher,
) {
  return paymentFetchWithRetry<Payment>(
    "/api/payments",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(payload),
    },
    accessToken,
    refreshAccessToken,
  );
}

export function getPayment(paymentId: string, accessToken: string | null, refreshAccessToken?: AccessTokenRefresher) {
  return paymentFetchWithRetry<Payment>(`/api/payments/${paymentId}`, undefined, accessToken, refreshAccessToken);
}

export function getPaymentByCode(paymentCode: string, accessToken: string | null, refreshAccessToken?: AccessTokenRefresher) {
  return paymentFetchWithRetry<Payment>(`/api/payments/by-code/${paymentCode}`, undefined, accessToken, refreshAccessToken);
}

export function confirmVnpayReturn(
  params: Record<string, string>,
  accessToken: string | null,
  refreshAccessToken?: AccessTokenRefresher,
) {
  return paymentFetchWithRetry<VnpayReturnConfirmResponse>(
    "/api/payments/return/vnpay/confirm",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ params }),
    },
    accessToken,
    refreshAccessToken,
  );
}

// ─────────────────────────────────────────────
// Receipt & Admin APIs
// ─────────────────────────────────────────────

/** Lấy danh sách hóa đơn của tôi (chỉ các giao dịch thành công) */
export function getMyReceipts(
  params: { page?: number; size?: number },
  accessToken: string | null,
  refreshAccessToken?: AccessTokenRefresher,
): Promise<PaymentReceiptResponse[]> {
  const { page = 0, size = 20 } = params;
  return paymentFetchWithRetry<PaymentReceiptResponse[]>(
    `/api/payments/receipts?page=${page}&size=${size}`,
    undefined,
    accessToken,
    refreshAccessToken,
  );
}

/** Lấy chi tiết hóa đơn theo mã thanh toán */
export function getReceiptByCode(
  paymentCode: string,
  accessToken: string | null,
  refreshAccessToken?: AccessTokenRefresher,
): Promise<PaymentReceiptResponse> {
  return paymentFetchWithRetry<PaymentReceiptResponse>(
    `/api/payments/receipts/${paymentCode}`,
    undefined,
    accessToken,
    refreshAccessToken,
  );
}

/** [ADMIN] Lấy tổng quan thống kê thanh toán */
export function getAdminPaymentSummary(
  accessToken: string | null,
  refreshAccessToken?: AccessTokenRefresher,
): Promise<PaymentDashboardSummaryResponse> {
  return paymentFetchWithRetry<PaymentDashboardSummaryResponse>(
    "/api/admin/payments/summary",
    undefined,
    accessToken,
    refreshAccessToken,
  );
}

/** [ADMIN] Lấy danh sách giao dịch thanh toán với bộ lọc */
export function getAdminPayments(
  params: { q?: string; status?: string; paidFrom?: string; paidTo?: string; page?: number; size?: number },
  accessToken: string | null,
  refreshAccessToken?: AccessTokenRefresher,
): Promise<AdminPaymentRowResponse[]> {
  const { q = "", status = "", paidFrom = "", paidTo = "", page = 0, size = 20 } = params;
  const searchParams = new URLSearchParams();
  if (q) searchParams.set("q", q);
  if (status) searchParams.set("status", status);
  if (paidFrom) searchParams.set("paidFrom", paidFrom);
  if (paidTo) searchParams.set("paidTo", paidTo);
  searchParams.set("page", page.toString());
  searchParams.set("size", size.toString());

  return paymentFetchWithRetry<AdminPaymentRowResponse[]>(
    `/api/admin/payments?${searchParams.toString()}`,
    undefined,
    accessToken,
    refreshAccessToken,
  );
}

/** [ADMIN] Lấy chi tiết hóa đơn (cho bất kỳ thành viên nào) */
export function getAdminReceiptByCode(
  paymentCode: string,
  accessToken: string | null,
  refreshAccessToken?: AccessTokenRefresher,
): Promise<PaymentReceiptResponse> {
  return paymentFetchWithRetry<PaymentReceiptResponse>(
    `/api/admin/payments/receipts/${paymentCode}`,
    undefined,
    accessToken,
    refreshAccessToken,
  );
}

function isApiResponse<T>(body: ApiResponse<T> | T): body is ApiResponse<T> {
  return typeof body === "object" && body !== null && "success" in body && "timestamp" in body;
}

function tryParseJson(text: string) {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}
