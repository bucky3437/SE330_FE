'use client';

import React, { useEffect, useState } from 'react';
import { EbookLoan, RenewEbookResponse } from '../types/ebook';
import { EbookLoanCard } from '../components/EbookLoanCard';
import { EbookReader } from '../components/EbookReader';
import { useEbookApi } from '../hooks/useEbookApi';
import { useEbookAccess } from '../hooks/useEbookAccess';

/**
 * Page: MyEbooksPage - Member's borrowed ebooks library
 */
export default function MyEbooksPage() {
  const { loading, error, getActiveLoans, getLoanHistory, renewLoan, returnEbook } = useEbookApi();
  const { refreshToken } = useEbookAccess();
  const [loans, setLoans] = useState<EbookLoan[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [selectedLoan, setSelectedLoan] = useState<EbookLoan | null>(null);
  const [readerOpen, setReaderOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshingToken, setRefreshingToken] = useState(false);

  useEffect(() => {
    loadLoans();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadLoans = async () => {
    // FIX: load correct data based on active tab
    const result = activeTab === 'active'
      ? await getActiveLoans(0, 20)
      : await getLoanHistory(0, 20);
    if (Array.isArray(result)) {
      setLoans(result);
    }
  };

  const handleRenew = async (loanId: number) => {
    setActionLoading(true);
    try {
      const response = await renewLoan(loanId);
      if (response) {
        alert('✓ Loan renewed successfully!');
        loadLoans();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async (loanId: number) => {
    setActionLoading(true);
    try {
      const success = await returnEbook(loanId);
      if (success) {
        alert('✓ Ebook returned successfully!');
        loadLoans();
      }
    } finally {
      setActionLoading(false);
    }
  };

  // FIX: onView receives full EbookLoan object; refresh token if needed
  const handleView = async (loan: EbookLoan) => {
    // If loan has no stored access token, try to refresh it from the server
    if (!loan.accessToken) {
      setRefreshingToken(true);
      try {
        const newToken = await refreshToken(loan.id);
        if (newToken) {
          const loanWithToken: EbookLoan = { ...loan, accessToken: newToken };
          setSelectedLoan(loanWithToken);
          setReaderOpen(true);
        } else {
          alert('Unable to retrieve access token. Please contact support.');
        }
      } finally {
        setRefreshingToken(false);
      }
      return;
    }
    setSelectedLoan(loan);
    setReaderOpen(true);
  };

  if (readerOpen && selectedLoan) {
    return (
      <EbookReader
        loanId={selectedLoan.id}                          // FIX: use loanId (not ebookId)
        accessToken={selectedLoan.accessToken || ''}      // FIX: use stored token
        fileFormat={selectedLoan.fileFormat}
        ebookTitle={selectedLoan.ebookTitle}
        onClose={() => {
          setReaderOpen(false);
          setSelectedLoan(null);
        }}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📖 My E-Books</h1>
        <p className="text-gray-600">Your borrowed digital library</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'active'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📚 Currently Reading ({loans.filter((l) => l.status === 'ACTIVE').length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'history'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📜 History
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6 text-red-800">
          {error}
        </div>
      )}

      {/* Loading state */}
      {(loading || refreshingToken) && (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>{refreshingToken ? 'Retrieving access token...' : 'Loading your e-books...'}</p>
          </div>
        </div>
      )}

      {/* Loans grid */}
      {!loading && !refreshingToken && loans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map((loan) => (
            <EbookLoanCard
              key={loan.id}
              loan={loan}
              isLoading={actionLoading}
              onRenew={handleRenew}
              onReturn={handleReturn}
              onView={handleView}   // FIX: now correctly typed to receive EbookLoan
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !refreshingToken && loans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">
            {activeTab === 'active'
              ? "You haven't borrowed any ebooks yet"
              : 'No reading history'}
          </p>
          {activeTab === 'active' && (
            <a
              href="/ebook-catalog"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Browse E-Book Catalog
            </a>
          )}
        </div>
      )}
    </div>
  );
}
