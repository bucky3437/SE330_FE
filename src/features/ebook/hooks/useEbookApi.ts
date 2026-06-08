'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Ebook, EbookLoan, BorrowEbookResponse, RenewEbookResponse, BorrowEbookRequest } from '../types/ebook';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Helper: Get fetch headers with auth token
 */
const getAuthHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Hook for Ebook API calls
 */
export const useEbookApi = () => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Search ebooks
  const searchEbooks = useCallback(async (page = 0, size = 20) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/ebooks?page=${page}&size=${size}`,
        { 
          credentials: 'include',
          headers: getAuthHeaders(accessToken),
        }
      );
      // 404 on this endpoint means no ebooks exist yet — not a real error
      if (response.status === 404) {
        return [];
      }
      if (!response.ok) {
        const text = await response.text();
        const data = text ? JSON.parse(text) : { message: `Error: ${response.status}` };
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ebooks');
      return [];
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Get ebook by id
  const getEbook = useCallback(async (ebookId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ebooks/${ebookId}`, {
        credentials: 'include',
        headers: getAuthHeaders(accessToken),
      });
      if (!response.ok) {
        const text = await response.text();
        const data = text ? JSON.parse(text) : { message: `Error: ${response.status}` };
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ebook');
      return null;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Get active loans
  const getActiveLoans = useCallback(async (page = 0, size = 20) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/ebooks/my/active?page=${page}&size=${size}`,
        { 
          credentials: 'include',
          headers: getAuthHeaders(accessToken),
        }
      );
      if (!response.ok) {
        const text = await response.text();
        const data = text ? JSON.parse(text) : { message: `Error: ${response.status}` };
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load active loans');
      return [];
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Get loan history
  const getLoanHistory = useCallback(async (page = 0, size = 20) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/ebooks/my/history?page=${page}&size=${size}`,
        { 
          credentials: 'include',
          headers: getAuthHeaders(accessToken),
        }
      );
      if (!response.ok) {
        const text = await response.text();
        const data = text ? JSON.parse(text) : { message: `Error: ${response.status}` };
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load loan history');
      return [];
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Borrow ebook
  const borrowEbook = useCallback(async (request: BorrowEbookRequest) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ebooks/borrow`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify(request),
        credentials: 'include',
      });
      if (!response.ok) {
        const text = await response.text();
        const data = text ? JSON.parse(text) : { message: `Error: ${response.status}` };
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to borrow ebook');
      return null;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Renew loan
  const renewLoan = useCallback(async (loanId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ebooks/loans/${loanId}/renew`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(accessToken),
      });
      if (!response.ok) {
        const text = await response.text();
        const data = text ? JSON.parse(text) : { message: `Error: ${response.status}` };
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to renew loan');
      return null;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Return ebook
  const returnEbook = useCallback(async (loanId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ebooks/loans/${loanId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(accessToken),
      });
      if (!response.ok) {
        const text = await response.text();
        const data = text ? JSON.parse(text) : { message: `Error: ${response.status}` };
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to return ebook');
      return false;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  return {
    loading,
    error,
    clearError,
    searchEbooks,
    getEbook,
    getActiveLoans,
    getLoanHistory,
    borrowEbook,
    renewLoan,
    returnEbook,
  };
};
