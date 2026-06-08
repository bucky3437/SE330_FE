'use client';

import React from 'react';
import { EbookLoan } from '../types/ebook';
import { formatDistanceToNow, formatDate } from '@/components/utils/dateUtils';

interface EbookLoanCardProps {
  loan: EbookLoan;
  onRenew?: (loanId: number) => void;
  onReturn?: (loanId: number) => void;
  onView?: (loan: EbookLoan) => void;  // FIX: pass full loan object so viewer has all needed data
  isLoading?: boolean;
}

/**
 * Component: EbookLoanCard - Display ebook loan information
 */
export const EbookLoanCard: React.FC<EbookLoanCardProps> = ({
  loan,
  onRenew,
  onReturn,
  onView,
  isLoading = false,
}) => {
  const daysUntilDue = Math.ceil(
    (new Date(loan.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = loan.isOverdue;
  const isDueSoon = daysUntilDue <= 3 && daysUntilDue > 0;

  return (
    <div
      className={`border rounded-lg p-4 ${
        isOverdue ? 'border-red-300 bg-red-50' : isDueSoon ? 'border-yellow-300 bg-yellow-50' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{loan.ebookTitle}</h3>
          <p className="text-sm text-gray-600">{loan.fileFormat}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded font-medium ${
            isOverdue
              ? 'bg-red-200 text-red-800'
              : isDueSoon
                ? 'bg-yellow-200 text-yellow-800'
                : 'bg-green-200 text-green-800'
          }`}
        >
          {isOverdue ? '⚠️ OVERDUE' : isDueSoon ? '⏰ DUE SOON' : '✓ ACTIVE'}
        </span>
      </div>

      {/* Timeline info */}
      <div className="text-sm text-gray-600 mb-3 space-y-1">
        <p>📅 Borrowed: {formatDate(new Date(loan.borrowedAt))}</p>
        <p className={isOverdue ? 'text-red-600 font-medium' : isDueSoon ? 'text-yellow-600 font-medium' : ''}>
          📌 Due: {formatDate(new Date(loan.dueDate))} ({daysUntilDue > 0 ? `${daysUntilDue} days left` : 'Overdue'})
        </p>
        <p>👀 Accessed: {loan.accessCount} times</p>
      </div>

      {/* Renewal info */}
      <div className="text-sm text-gray-600 mb-4 p-2 bg-white rounded border border-gray-200">
        <p>
          Renewals: <span className="font-semibold">{loan.renewalCount}</span> /{' '}
          <span className="font-semibold">{loan.maxRenewals}</span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onView?.(loan)}  // FIX: pass full loan object
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
        >
          📖 Read
        </button>

        {loan.canRenew && (
          <button
            onClick={() => onRenew?.(loan.id)}
            disabled={isLoading}
            className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
          >
            🔄 Renew
          </button>
        )}

        <button
          onClick={() => onReturn?.(loan.id)}
          disabled={isLoading}
          className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm"
        >
          ↩️ Return
        </button>
      </div>
    </div>
  );
};
