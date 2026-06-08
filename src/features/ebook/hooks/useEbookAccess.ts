'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Hook for Ebook access token management
 */
export const useEbookAccess = () => {
  const { accessToken: authToken } = useAuth();
  const [validating, setValidating] = useState(false);

  // Validate access token format (basic client-side check)
  const validateToken = useCallback(async (token: string) => {
    setValidating(true);
    try {
      if (!token || token.length < 20) {
        throw new Error('Invalid token format');
      }
      return true;
    } finally {
      setValidating(false);
    }
  }, []);

  // Generate secure download URL
  const generateDownloadUrl = useCallback((loanId: number, token: string) => {
    return `${API_BASE_URL}/ebooks/${loanId}/download?token=${token}`;
  }, []);

  // Generate viewer URL
  const generateViewerUrl = useCallback((loanId: number, token: string) => {
    return `${API_BASE_URL}/ebooks/${loanId}/view?token=${token}`;
  }, []);

  // FIX: refresh access token from server when opening reader without a stored token
  const refreshToken = useCallback(async (loanId: number): Promise<string | null> => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const response = await fetch(`${API_BASE_URL}/ebooks/loans/${loanId}/refresh-token`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data.data || null;
    } catch {
      return null;
    }
  }, [authToken]);

  return {
    validating,
    validateToken,
    generateDownloadUrl,
    generateViewerUrl,
    refreshToken,
  };
};
