'use client';

import React, { useState } from 'react';
import { EbookLoan } from '../types/ebook';

interface BorrowEbookModalProps {
  isOpen: boolean;
  bookId: number;
  bookTitle: string;
  onBorrow: (bookId: number, duration?: number) => Promise<boolean>;
  onClose: () => void;
  isLoading?: boolean;
}

/**
 * Component: BorrowEbookModal - Modal dialog for borrowing ebook
 */
export const BorrowEbookModal: React.FC<BorrowEbookModalProps> = ({
  isOpen,
  bookId,
  bookTitle,
  onBorrow,
  onClose,
  isLoading = false,
}) => {
  const [duration, setDuration] = useState(24);
  const [error, setError] = useState<string | null>(null);

  const handleBorrow = async () => {
    setError(null);
    const success = await onBorrow(bookId, duration);
    if (success) {
      onClose();
    } else {
      setError('Failed to borrow ebook. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">📚 Borrow E-Book</h2>
          <p className="text-gray-600">{bookTitle}</p>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          {/* Duration selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Access Duration (hours)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            >
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
              <option value={72}>72 hours (3 days)</option>
              <option value={168}>7 days</option>
              <option value={720}>30 days</option>
            </select>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
            <p className="font-semibold mb-1">ℹ️ Borrow Terms</p>
            <ul className="list-disc list-inside space-y-1">
              <li>You can renew up to 2 times</li>
              <li>Access token expires after {duration} hours</li>
              <li>You can borrow up to 5 ebooks at once</li>
            </ul>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 border border-gray-300 rounded py-2 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleBorrow}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? '⏳ Borrowing...' : '✓ Confirm Borrow'}
          </button>
        </div>
      </div>
    </div>
  );
};
