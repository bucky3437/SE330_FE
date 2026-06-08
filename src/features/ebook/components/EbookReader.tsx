'use client';

import React, { useEffect, useState } from 'react';

interface EbookReaderProps {
  loanId: number;         // FIX: use loanId (not ebookId) for view/download endpoints
  accessToken: string;
  fileFormat: string;
  ebookTitle?: string;
  onClose?: () => void;
}

/**
 * Component: EbookReader - Embed ebook viewer
 * Supports PDF (iframe), EPUB (epub.js), etc.
 */
export const EbookReader: React.FC<EbookReaderProps> = ({
  loanId,
  accessToken,
  fileFormat,
  ebookTitle,
  onClose,
}) => {
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setTokenError('Access token is missing. Please borrow the ebook again to get a valid token.');
      setIsLoading(false);
      return;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    // FIX: use loanId in URL path (endpoint is /{loanId}/view)
    const url = `${baseUrl}/ebooks/${loanId}/view?token=${accessToken}`;
    setViewerUrl(url);
    setIsLoading(false);
  }, [loanId, accessToken]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading {fileFormat} reader...</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="w-full h-screen flex flex-col bg-gray-900 items-center justify-center">
        <div className="bg-red-900 border border-red-500 rounded-lg p-6 max-w-md text-center">
          <p className="text-red-200 text-lg mb-2">⚠️ Access Error</p>
          <p className="text-red-300 text-sm mb-4">{tokenError}</p>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  const downloadUrl = `${baseUrl}/ebooks/${loanId}/download?token=${accessToken}`;

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          📖 {ebookTitle || 'E-Book Reader'}{' '}
          <span className="text-sm text-gray-400">({fileFormat})</span>
        </h1>
        <div className="space-x-2">
          <button
            onClick={() => window.open(downloadUrl, '_blank')}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
          >
            ⬇️ Download
          </button>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Viewer Container */}
      <div className="flex-1 overflow-hidden bg-gray-900">
        {fileFormat === 'PDF' ? (
          <iframe
            src={viewerUrl}
            className="w-full h-full border-0"
            title={`PDF Viewer - ${ebookTitle}`}
          />
        ) : fileFormat === 'EPUB' ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <p className="text-lg mb-2">📕 EPUB Format</p>
              <p className="text-sm text-gray-400 mb-4">
                EPUB inline viewer not yet integrated. Use download to read offline.
              </p>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded transition-colors inline-block"
              >
                ⬇️ Download EPUB
              </a>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <p className="text-lg mb-2">📗 {fileFormat} Format</p>
              <p className="text-sm text-gray-400 mb-4">
                Viewer for {fileFormat} is not yet implemented. Use download to read offline.
              </p>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded transition-colors inline-block"
              >
                ⬇️ Download {fileFormat}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white p-2 text-center text-sm text-gray-400">
        Tip: Use keyboard shortcuts — Space to scroll, Q to quit
      </div>
    </div>
  );
};
