"use client";

import { ApiError, ApiResponse } from "@/types/api.type";
import { API_URL } from "@/features/auth/services/authService";
import { BookReview, BookReviewStats, CreateReviewPayload, UpdateReviewPayload } from "../types/review.type";

const REQUEST_TIMEOUT_MS = 15000;

async function reviewFetch<T>(path: string, init?: RequestInit, accessToken?: string | null) {
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

export async function getBookReviews(bookId: string, page: number = 0, size: number = 5) {
  const query = `?page=${page}&size=${size}`;
  const raw = await reviewFetch<unknown>(`/api/books/${bookId}/reviews${query}`);

  if (Array.isArray(raw)) {
    return { items: raw as BookReview[], totalElements: raw.length, totalPages: 1, page: 0, size };
  }

  if (raw && typeof raw === "object") {
    const source = raw as {
      content?: BookReview[];
      items?: BookReview[];
      data?: BookReview[];
      totalElements?: number;
      totalPages?: number;
      number?: number;
      page?: number;
      size?: number;
    };

    return {
      items: source.content ?? source.items ?? source.data ?? [],
      totalElements: source.totalElements ?? 0,
      totalPages: source.totalPages ?? 1,
      page: source.number ?? source.page ?? 0,
      size: source.size ?? size,
    };
  }

  return { items: [], totalElements: 0, totalPages: 1, page: 0, size };
}

export function getBookReviewStats(bookId: string) {
  return reviewFetch<BookReviewStats>(`/api/books/${bookId}/reviews/stats`);
}

export function getMyReview(bookId: string, accessToken: string | null) {
  return reviewFetch<BookReview | null>(`/api/books/${bookId}/reviews/my`, undefined, accessToken);
}

export function createReview(bookId: string, payload: CreateReviewPayload, accessToken: string | null) {
  return reviewFetch<BookReview>(
    `/api/books/${bookId}/reviews`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}

export function updateReview(bookId: string, payload: UpdateReviewPayload, accessToken: string | null) {
  return reviewFetch<BookReview>(
    `/api/books/${bookId}/reviews/my`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}

export function deleteReview(bookId: string, accessToken: string | null) {
  return reviewFetch<void>(
    `/api/books/${bookId}/reviews/my`,
    { method: "DELETE" },
    accessToken,
  );
}
