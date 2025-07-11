"use client";
import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, ZoomIn, ZoomOut, RotateCw, AlertCircle, RefreshCw } from 'lucide-react';

export default function EnhancedPDFReader({ pdfUrl, bookTitle = "PDF Document", onClose }) {
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('iframe'); // 'iframe', 'embed', 'object'

  console.log('EnhancedPDFReader received pdfUrl:', pdfUrl);

  useEffect(() => {
    // Reset states when PDF URL changes
    setLoading(true);
    setError(null);
  }, [pdfUrl]);

  if (!pdfUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No PDF Available</h3>
          <p className="text-gray-600 mb-4">PDF file path not found</p>
          <button onClick={onClose} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleIframeLoad = () => {
    console.log('PDF loaded successfully');
    setLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    console.log('PDF failed to load');
    setLoading(false);
    setError('Failed to load PDF. The file might not exist or be corrupted.');
  };

  const retryLoad = () => {
    setLoading(true);
    setError(null);
    // Force reload by changing view mode
    setViewMode(viewMode === 'iframe' ? 'embed' : 'iframe');
  };

  const renderPDFViewer = () => {
    // Mobile-optimized PDF parameters
    const isMobile = window.innerWidth < 768;
    const mobileParams = isMobile 
      ? `#toolbar=1&navpanes=0&scrollbar=1&page=1&view=FitV&zoom=page-width`
      : `#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH&zoom=${zoom}`;
    
    const pdfUrlWithParams = `${pdfUrl}${mobileParams}`;
    
    switch (viewMode) {
      case 'embed':
        return (
          <embed
            src={pdfUrlWithParams}
            type="application/pdf"
            className="w-full h-full"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        );
      case 'object':
        return (
          <object
            data={pdfUrlWithParams}
            type="application/pdf"
            className="w-full h-full"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          >
            <div className="p-4 text-center">
              <p className="text-gray-600 mb-4">Your browser doesn't support PDF viewing.</p>
              <div className="space-y-2">
                <a 
                  href={pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Open PDF in New Tab
                </a>
                <a 
                  href={pdfUrl} 
                  download
                  className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Download PDF
                </a>
              </div>
            </div>
          </object>
        );
      default:
        return (
          <iframe
            src={pdfUrlWithParams}
            className="w-full h-full border-none bg-white rounded-none sm:rounded shadow-lg"
            title={bookTitle}
            style={{ 
              minHeight: isMobile ? '400px' : '600px',
              height: '100%'
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allowFullScreen
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-2 sm:p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded flex-shrink-0">
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <h1 className="text-sm sm:text-lg font-semibold truncate">{bookTitle}</h1>
          {loading && (
            <div className="hidden sm:flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </div>

        {/* Desktop Controls */}
        <div className="hidden lg:flex items-center space-x-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="bg-gray-700 text-white text-sm px-2 py-1 rounded"
          >
            <option value="iframe">IFrame</option>
            <option value="embed">Embed</option>
            <option value="object">Object</option>
          </select>

          <button
            onClick={retryLoad}
            className="p-2 hover:bg-gray-700 rounded"
            title="Retry Loading"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={() => setZoom(Math.max(50, zoom - 25))}
            className="p-2 hover:bg-gray-700 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          
          <span className="text-sm px-2">{zoom}%</span>
          
          <button
            onClick={() => setZoom(Math.min(200, zoom + 25))}
            className="p-2 hover:bg-gray-700 rounded"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setZoom(100)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            Reset
          </button>
          
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-700 rounded"
            title="Open in New Tab"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          
          <a
            href={pdfUrl}
            download
            className="p-2 hover:bg-gray-700 rounded"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>

        {/* Mobile Controls */}
        <div className="flex lg:hidden items-center space-x-1">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-700 rounded"
            title="Open in Browser"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          
          <a
            href={pdfUrl}
            download
            className="p-2 hover:bg-gray-700 rounded"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Mobile Loading Indicator */}
      {loading && (
        <div className="sm:hidden bg-gray-700 text-white text-center py-2 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Loading PDF...</span>
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      <div className="flex-1 bg-gray-700 overflow-auto relative">
        <div className="h-full flex items-center justify-center p-2 sm:p-4">
          {loading && (
            <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center text-white px-4">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-sm sm:text-base">Loading PDF...</p>
                <p className="text-xs sm:text-sm text-gray-300 mt-2">Using {viewMode} viewer</p>
              </div>
            </div>
          )}
          
          {error ? (
            <div className="bg-white rounded-lg p-4 sm:p-8 text-center max-w-lg mx-2 sm:mx-4 w-full">
              <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-red-600 mb-2">Error Loading PDF</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
              
              <div className="bg-gray-100 p-3 sm:p-4 rounded-lg mb-4">
                <p className="text-xs sm:text-sm text-gray-700 mb-2"><strong>PDF URL:</strong></p>
                <p className="text-xs text-gray-600 break-all">{pdfUrl}</p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:flex gap-2 justify-center">
                  <button 
                    onClick={retryLoad}
                    className="bg-green-600 text-white px-3 py-2 text-sm rounded hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="hidden sm:inline">Retry</span>
                  </button>
                  <button 
                    onClick={() => window.open(pdfUrl, '_blank')}
                    className="bg-blue-600 text-white px-3 py-2 text-sm rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="hidden sm:inline">Open</span>
                  </button>
                  <a
                    href={pdfUrl}
                    download
                    className="bg-purple-600 text-white px-3 py-2 text-sm rounded hover:bg-purple-700 flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                  <button 
                    onClick={onClose}
                    className="bg-gray-600 text-white px-3 py-2 text-sm rounded hover:bg-gray-700 col-span-2 sm:col-span-1"
                  >
                    Close
                  </button>
                </div>
                
                <div className="text-xs sm:text-sm text-gray-500">
                  <p className="hidden sm:block">Try switching viewer modes above or use direct link/download options</p>
                  <p className="sm:hidden">Use the buttons above to access the PDF</p>
                </div>
              </div>
            </div>
          ) : (
            renderPDFViewer()
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white p-2 text-center text-xs sm:text-sm">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="hidden sm:inline">Enhanced PDF Reader</span>
            <span className="sm:hidden">PDF Reader</span>
            <span className="hidden lg:inline">•</span>
            <span className="hidden lg:inline">Viewer: {viewMode}</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="hidden sm:inline">Use browser controls for navigation</span>
            <span className="hidden lg:inline">•</span>
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              <span className="sm:hidden">Open in Browser</span>
              <span className="hidden sm:inline">Open in full browser</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}