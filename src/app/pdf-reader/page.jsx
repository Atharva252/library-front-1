"use client";
import React, { useState } from 'react';
import EnhancedPDFReader from '../../components/EnhancedPDFReader';
import { BookOpen, Upload, FileText } from 'lucide-react';

export default function PDFReaderPage() {
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [bookTitle, setBookTitle] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setBookTitle(file.name.replace('.pdf', ''));
      setSelectedPDF(file);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (pdfUrl) {
      setSelectedPDF({ name: bookTitle || 'PDF Document' });
    }
  };

  const closePDFReader = () => {
    setSelectedPDF(null);
    if (pdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl('');
    setBookTitle('');
  };

  if (selectedPDF) {
    return (
      <EnhancedPDFReader
        pdfUrl={pdfUrl}
        bookTitle={bookTitle || selectedPDF.name}
        onClose={closePDFReader}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <BookOpen className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">PDF Reader</h1>
          <p className="text-xl text-gray-600">
            Read PDF documents directly in your browser with advanced features
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Upload PDF File */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Upload className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload PDF</h2>
              <p className="text-gray-600">Select a PDF file from your device</p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Click to select PDF file
                </p>
                <p className="text-sm text-gray-500">
                  Supports all standard PDF files
                </p>
              </label>
            </div>
          </div>

          {/* Enter PDF URL */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Open PDF URL</h2>
              <p className="text-gray-600">Enter a direct link to a PDF file</p>
            </div>

            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF URL
                </label>
                <input
                  type="url"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="https://example.com/document.pdf"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book Title (Optional)
                </label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="Enter book title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Open PDF
              </button>
            </form>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Reader Features</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Easy Navigation</h3>
              <p className="text-sm text-gray-600">Navigate through pages with keyboard shortcuts or buttons</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Zoom & Rotate</h3>
              <p className="text-sm text-gray-600">Zoom in/out and rotate pages for better reading experience</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Upload className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Fullscreen Mode</h3>
              <p className="text-sm text-gray-600">Immersive reading experience with fullscreen support</p>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Keyboard Shortcuts:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">← / →</span> - Navigate pages
              </div>
              <div>
                <span className="font-medium">+ / -</span> - Zoom in/out
              </div>
              <div>
                <span className="font-medium">0</span> - Reset zoom
              </div>
              <div>
                <span className="font-medium">R</span> - Rotate page
              </div>
              <div>
                <span className="font-medium">F</span> - Toggle fullscreen
              </div>
              <div>
                <span className="font-medium">Esc</span> - Close reader
              </div>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Test with Sample PDF:</h4>
            <button
              onClick={() => {
                setPdfUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
                setBookTitle('Sample PDF Document');
                setSelectedPDF({ name: 'Sample PDF' });
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Load Sample PDF
            </button>
          </div>
        </div>

        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <span>← Back to Library</span>
          </a>
        </div>
      </div>
    </div>
  );
}