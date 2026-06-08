'use client';

import React from 'react';
import { Ebook } from '../types/ebook';

interface EbookCardProps {
  ebook: Ebook;
  onBorrow?: (bookId: number) => void;
  isLoading?: boolean;
}

/**
 * Component: EbookCard - Display ebook information in card format
 */
export const EbookCard: React.FC<EbookCardProps> = ({ ebook, onBorrow, isLoading = false }) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg line-clamp-2">{ebook.bookTitle}</h3>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
          {ebook.fileFormat}
        </span>
      </div>

      {/* File info */}
      <div className="text-sm text-gray-600 mb-3 space-y-1">
        <p>📦 Size: {ebook.fileSizeMb?.toFixed(1)} MB</p>
        <p>
          🔒 Restrictions:
          <span className="ml-2">
            {ebook.allowDownload ? '✓ Download' : '✗ No Download'}
            {' | '}
            {ebook.allowPrint ? '✓ Print' : '✗ No Print'}
          </span>
        </p>
      </div>

      {/* Action button */}
      <button
        onClick={() => onBorrow?.(ebook.bookId)}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Loading...' : '📚 Borrow Now'}
      </button>
    </div>
  );
};
