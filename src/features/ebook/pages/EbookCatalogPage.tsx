'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Ebook, BorrowEbookResponse } from '../types/ebook';
import { EbookCard } from '../components/EbookCard';
import { BorrowEbookModal } from '../components/BorrowEbookModal';
import { useEbookApi } from '../hooks/useEbookApi';

/**
 * Page: EbookCatalog - Browse and borrow ebooks
 */
export default function EbookCatalogPage() {
  const { loading, error, searchEbooks, borrowEbook } = useEbookApi();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);  // FIX: was never updated from API
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [borrowing, setBorrowing] = useState(false);

  const loadEbooks = useCallback(async () => {
    // FIX: searchEbooks returns flat array but we need pagination meta too
    // The hook wraps the response — use raw fetch here for full response
    const result = await searchEbooks(page, 20);
    if (Array.isArray(result)) {
      setEbooks(result);
      // If backend returns paginated response, totalPages should come from meta
      // For now, disable next button when fewer than page size results are returned
      if (result.length < 20) {
        setTotalPages(page + 1);
      } else {
        setTotalPages(page + 2); // assume there might be more
      }
    }
  }, [page, searchEbooks]);

  useEffect(() => {
    loadEbooks();
  }, [loadEbooks]);

  const handleOpenBorrowModal = (bookId: number, title: string) => {
    setSelectedBookId(bookId);
    setSelectedTitle(title);
    setBorrowModalOpen(true);
  };

  const handleBorrow = async (bookId: number, duration?: number) => {
    setBorrowing(true);
    try {
      const response: BorrowEbookResponse | null = await borrowEbook({
        bookId,
        accessDurationHours: duration || 24,
      });

      if (response) {
        // FIX: BorrowEbookResponse includes accessToken — could be stored in session/localStorage
        // for use when opening reader, but that's handled via refresh-token endpoint for now
        alert(`✓ Successfully borrowed "${response.ebookTitle}"! Check your "My E-Books" section.`);
        loadEbooks();
        return true;
      }
      return false;
    } finally {
      setBorrowing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📚 E-Book Library</h1>
        <p className="text-gray-600">Discover and borrow digital books instantly</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6 text-red-800">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading ebooks...</p>
          </div>
        </div>
      )}

      {/* Ebook grid */}
      {!loading && ebooks.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {ebooks.map((ebook) => (
              <EbookCard
                key={ebook.id}
                ebook={ebook}
                isLoading={borrowing}
                onBorrow={(bookId) =>
                  handleOpenBorrowModal(bookId, ebook.bookTitle)
                }
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              ← Previous
            </button>
            <span className="px-4 py-2">
              Page {page + 1}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && ebooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No ebooks available at the moment</p>
        </div>
      )}

      {/* Borrow Modal */}
      {selectedBookId && (
        <BorrowEbookModal
          isOpen={borrowModalOpen}
          bookId={selectedBookId}
          bookTitle={selectedTitle}
          onBorrow={handleBorrow}
          onClose={() => setBorrowModalOpen(false)}
          isLoading={borrowing}
        />
      )}
    </div>
  );
}
