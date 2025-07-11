"use client";
import React, { useState } from 'react';
import { Upload, BookOpen, Image, FileText, User, Tag, MessageSquare, Check, AlertCircle, Star, Globe, Shield, Zap, Crown, Sparkles, ChevronDown, Loader, Wand2, RefreshCw, Trash2, Eye } from 'lucide-react';
import { watermarkRemover } from '../utils/watermarkRemover';

const API_BASE_URL = 'http://localhost:5000/api';

export default function EnhancedPDFUpload() {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    description: '',
    coverImage: '',
    pdfFile: '',
    isbn: '',
    publishYear: '',
    language: 'English',
    tags: []
  });
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [extractionProgress, setExtractionProgress] = useState('');
  const [pdfMetadata, setPdfMetadata] = useState(null);
  const [watermarkDetected, setWatermarkDetected] = useState(false);

  const categories = [
    'Fiction', 'Non-Fiction', 'Science Fiction', 'Mystery & Thriller', 'Romance', 'Fantasy',
    'Biography', 'History', 'Science', 'Technology', 'Business', 'Self-Help', 'Arts & Culture',
    'Philosophy', 'Religion', 'Children\'s Books', 'Young Adult', 'Poetry', 'Drama', 'Reference'
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Enhanced PDF processing with watermark removal
  const extractPDFCoverWithWatermarkRemoval = async (file) => {
    try {
      setExtractionProgress('Loading PDF.js library...');
      console.log('📖 Starting enhanced PDF processing with watermark removal...');
      
      // Dynamic import of PDF.js to avoid build issues
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      setExtractionProgress('Reading PDF file...');
      const arrayBuffer = await file.arrayBuffer();
      
      setExtractionProgress('Loading PDF document...');
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log('📄 PDF loaded successfully, pages:', pdf.numPages);
      
      // Extract metadata first
      setExtractionProgress('Extracting metadata...');
      const metadata = await watermarkRemover.extractCleanMetadata(pdf);
      setPdfMetadata(metadata);
      console.log('📋 Extracted metadata:', metadata);
      
      setExtractionProgress('Processing first page...');
      const page = await pdf.getPage(1);
      
      setExtractionProgress('Removing watermarks...');
      // Use watermark remover to process the page
      const coverImage = await watermarkRemover.processPDFPage(page, 1.5);
      
      setExtractionProgress('Finalizing...');
      console.log('✅ PDF processing completed with watermark removal');
      
      return {
        coverImage,
        metadata,
        hasWatermarks: watermarkDetected
      };
      
    } catch (error) {
      console.error('❌ Enhanced PDF processing failed:', error);
      setExtractionProgress('Processing failed, generating fallback...');
      
      // Generate clean fallback cover
      const cleanTitle = watermarkRemover.cleanFilename(file.name);
      const fallbackCover = watermarkRemover.generateCleanFallbackCover(cleanTitle);
      
      return {
        coverImage: fallbackCover,
        metadata: {},
        hasWatermarks: false
      };
    }
  };

  // Enhanced data extraction with watermark removal
  const extractPDFDataEnhanced = async (file) => {
    try {
      setExtracting(true);
      setExtractionProgress('Starting enhanced extraction...');
      console.log('🔄 Starting enhanced PDF data extraction...');
      
      // Clean filename first
      const cleanedFilename = watermarkRemover.cleanFilename(file.name);
      console.log('🧹 Cleaned filename:', cleanedFilename);
      
      // Extract cover and metadata
      const { coverImage, metadata, hasWatermarks } = await extractPDFCoverWithWatermarkRemoval(file);
      setWatermarkDetected(hasWatermarks);
      
      // Determine title - priority: metadata title, cleaned filename
      let finalTitle = '';
      if (metadata.title && metadata.title.trim()) {
        finalTitle = metadata.title;
      } else {
        finalTitle = cleanedFilename;
      }
      
      // Determine author - use extracted metadata author or leave empty
      let finalAuthor = '';
      if (metadata.author && metadata.author.trim()) {
        finalAuthor = metadata.author;
        console.log('👤 Author extracted from PDF:', finalAuthor);
      } else {
        console.log('👤 No valid author found in PDF metadata');
      }
      
      // Generate description
      let description = '';
      if (metadata.subject && metadata.subject.trim()) {
        description = `${metadata.subject}\n\nThis is "${finalTitle}"`;
        if (finalAuthor) {
          description += ` by ${finalAuthor}`;
        }
        description += ' - a comprehensive book with valuable content. Please update this description with more specific details about the content and themes.';
      } else {
        description = `This is "${finalTitle}"`;
        if (finalAuthor) {
          description += ` by ${finalAuthor}`;
        }
        description += ' - a comprehensive book that offers valuable insights and knowledge. Please update this description with more specific details about the content, themes, and what readers can expect to learn from this book.';
      }
      
      // Determine publish year
      let publishYear = new Date().getFullYear().toString();
      if (metadata.creationDate) {
        try {
          const date = new Date(metadata.creationDate);
          if (!isNaN(date.getFullYear()) && date.getFullYear() > 1900) {
            publishYear = date.getFullYear().toString();
          }
        } catch (e) {
          console.warn('Could not parse creation date:', metadata.creationDate);
        }
      }
      
      console.log('✅ Enhanced PDF extraction completed successfully');
      
      return {
        title: finalTitle,
        author: finalAuthor, // Will be empty string if no valid author found
        category: 'Non-Fiction',
        description: description,
        coverImage: coverImage,
        publishYear: publishYear,
        metadata: metadata,
        watermarkRemoved: hasWatermarks
      };
      
    } catch (error) {
      console.error('❌ Error in enhanced PDF extraction:', error);
      const cleanedFilename = watermarkRemover.cleanFilename(file.name);
      return {
        title: cleanedFilename || 'Untitled Book',
        author: '', // Empty instead of "Unknown Author"
        category: 'Non-Fiction',
        description: 'Please add a description for this book.',
        coverImage: watermarkRemover.generateCleanFallbackCover(cleanedFilename || 'Untitled Book'),
        publishYear: new Date().getFullYear().toString(),
        metadata: {},
        watermarkRemoved: false
      };
    } finally {
      setExtracting(false);
      setExtractionProgress('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'coverImage') {
      setImagePreview(value);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      console.log('📄 PDF file selected:', file.name);
      setPdfFile(file);
      setFormData(prev => ({
        ...prev,
        pdfFile: `uploads/${file.name}`
      }));
      
      // Extract data from PDF with enhanced processing
      const extractedData = await extractPDFDataEnhanced(file);
      setFormData(prev => ({
        ...prev,
        ...extractedData
      }));
      setImagePreview(extractedData.coverImage);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
        setFormData(prev => ({
          ...prev,
          pdfFile: `uploads/${file.name}`
        }));
        
        // Extract data from PDF with enhanced processing
        const extractedData = await extractPDFDataEnhanced(file);
        setFormData(prev => ({
          ...prev,
          ...extractedData
        }));
        setImagePreview(extractedData.coverImage);
      }
    }
  };

  // Regenerate PDF cover with watermark removal
  const regeneratePDFCover = async () => {
    if (!pdfFile) return;
    
    setExtracting(true);
    try {
      const { coverImage } = await extractPDFCoverWithWatermarkRemoval(pdfFile);
      setFormData(prev => ({
        ...prev,
        coverImage: coverImage
      }));
      setImagePreview(coverImage);
    } catch (error) {
      console.error('❌ Error regenerating cover:', error);
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setUploading(true);
    setSubmitStatus('loading');
    
    try {
      const headers = getAuthHeaders();
      
      const bookData = {
        title: formData.title,
        author: formData.author || undefined, // Don't send empty string
        description: formData.description,
        category: formData.category,
        coverImage: formData.coverImage,
        pdfFile: formData.pdfFile
      };

      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bookData)
      });

      if (response.ok) {
        const newBook = await response.json();
        setSubmitStatus('success');
        
        // Reset form after success
        setTimeout(() => {
          setSubmitStatus('');
          setFormData({
            title: '',
            author: '',
            category: '',
            description: '',
            coverImage: '',
            pdfFile: '',
            isbn: '',
            publishYear: '',
            language: 'English',
            tags: []
          });
          setImagePreview('');
          setCurrentStep(1);
          setPdfFile(null);
          setPdfMetadata(null);
          setWatermarkDetected(false);
        }, 3000);
      } else {
        const error = await response.json();
        setSubmitStatus('error');
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error uploading book:', error);
      setSubmitStatus('error');
      alert('Failed to upload book. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const isFormValid = formData.title && formData.category && formData.description && formData.pdfFile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sage-200/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex justify-center items-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-300 to-emerald-300 rounded-3xl blur-lg opacity-40 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-teal-400 to-emerald-400 p-6 rounded-3xl shadow-lg">
                  <Crown className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-slate-700 via-gray-600 to-slate-700 bg-clip-text text-transparent">
                Smart PDF
              </span>
              <br />
              <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-sage-500 bg-clip-text text-transparent">
                Publisher
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Advanced PDF processing with watermark removal, metadata extraction, and author detection
            </p>
          </div>

          {/* Upload Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-200/30 to-emerald-200/30 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-2xl rounded-3xl border border-teal-200/50 shadow-xl overflow-hidden">
              
              {/* Header Bar */}
              <div className="bg-gradient-to-r from-teal-400 via-emerald-400 to-sage-400 p-1">
                <div className="bg-white/90 backdrop-blur-sm px-8 py-6 rounded-t-3xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Sparkles className="h-8 w-8 text-teal-600" />
                      <div>
                        <h2 className="text-2xl font-bold text-slate-700">Enhanced PDF Processor</h2>
                        <p className="text-teal-600">Watermark removal • Author extraction • Smart metadata</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {watermarkDetected && (
                        <div className="flex items-center space-x-2 bg-orange-100 px-4 py-2 rounded-full">
                          <Eye className="h-4 w-4 text-orange-600" />
                          <span className="text-sm text-orange-700 font-medium">Watermarks Removed</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 bg-emerald-100 px-4 py-2 rounded-full">
                        <Shield className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-emerald-700 font-medium">Smart Processing</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-10">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                  
                  {/* Left Column - Cover Preview */}
                  <div className="xl:col-span-1 space-y-8">
                    <div>
                      <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center">
                        <Image className="h-5 w-5 mr-2 text-teal-500" />
                        Book Preview
                      </h3>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-300/30 to-emerald-300/30 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                        <div className="relative bg-gray-50/80 backdrop-blur-sm rounded-2xl p-8 border border-teal-200/50">
                          {imagePreview ? (
                            <div className="relative group">
                              <img
                                src={imagePreview}
                                alt="Cover preview"
                                className="w-full aspect-[3/4] object-cover rounded-xl shadow-lg"
                                onError={() => setImagePreview('')}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent rounded-xl"></div>
                              
                              {/* Cover Change Options */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                                <div className="flex flex-col space-y-2">
                                  {/* Regenerate with watermark removal */}
                                  {pdfFile && (
                                    <button
                                      onClick={regeneratePDFCover}
                                      disabled={extracting}
                                      className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center"
                                    >
                                      {extracting ? (
                                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                      )}
                                      Remove Watermarks
                                    </button>
                                  )}
                                  
                                  {/* Upload Custom Image */}
                                  <label className="cursor-pointer bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors flex items-center">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Custom Image
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file && file.type.startsWith('image/')) {
                                          const reader = new FileReader();
                                          reader.onload = (event) => {
                                            const imageDataUrl = event.target.result;
                                            setFormData(prev => ({
                                              ...prev,
                                              coverImage: imageDataUrl
                                            }));
                                            setImagePreview(imageDataUrl);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              </div>
                              
                              {/* Cover Type Badge */}
                              <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {watermarkDetected ? 'Cleaned' : 'PDF Page 1'}
                              </div>
                            </div>
                          ) : (
                            <div className="w-full aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                              <div className="text-center">
                                <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 text-lg font-medium">Book Cover</p>
                                <p className="text-gray-500 text-sm">Upload PDF for smart processing</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metadata Display */}
                    {pdfMetadata && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
                        <h4 className="text-slate-700 font-bold mb-4 flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-blue-500" />
                          Extracted Metadata
                        </h4>
                        <div className="space-y-2 text-sm">
                          {pdfMetadata.title && (
                            <div><span className="font-medium">Title:</span> {pdfMetadata.title}</div>
                          )}
                          {pdfMetadata.author && (
                            <div><span className="font-medium">Author:</span> {pdfMetadata.author}</div>
                          )}
                          {pdfMetadata.subject && (
                            <div><span className="font-medium">Subject:</span> {pdfMetadata.subject}</div>
                          )}
                          {pdfMetadata.creationDate && (
                            <div><span className="font-medium">Created:</span> {new Date(pdfMetadata.creationDate).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200/50">
                      <h4 className="text-slate-700 font-bold mb-4 flex items-center">
                        <Zap className="h-5 w-5 mr-2 text-emerald-500" />
                        Smart Features
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-gray-600 text-sm">Automatic watermark detection & removal</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-gray-600 text-sm">Extract author from PDF metadata</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-gray-600 text-sm">Clean filename processing</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-gray-600 text-sm">Smart title extraction</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Columns - Form Fields */}
                  <div className="xl:col-span-2 space-y-8">
                    
                    {/* File Upload Section */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-teal-200/30">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-700 flex items-center">
                          <Upload className="h-5 w-5 mr-2 text-teal-500" />
                          Smart PDF Upload
                        </h3>
                        <div className="text-sm text-teal-600 font-medium">
                          🧠 AI-powered processing
                        </div>
                      </div>
                      
                      <div
                        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                          extracting
                            ? 'border-teal-400 bg-teal-50'
                            : dragActive
                            ? 'border-teal-400 bg-teal-50 scale-105'
                            : 'border-teal-300 hover:border-teal-400 hover:bg-teal-50/50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={extracting}
                        />
                        <div className="space-y-6">
                          <div className={`mx-auto w-20 h-20 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg ${extracting ? 'animate-pulse' : ''}`}>
                            {extracting ? (
                              <Loader className="h-10 w-10 text-white animate-spin" />
                            ) : (
                              <Upload className="h-10 w-10 text-white" />
                            )}
                          </div>
                          
                          {extracting ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-center space-x-2">
                                <Wand2 className="h-6 w-6 text-teal-600 animate-pulse" />
                                <p className="text-teal-700 font-semibold text-lg">Processing PDF...</p>
                              </div>
                              {extractionProgress && (
                                <div className="bg-teal-50 rounded-lg p-4 max-w-md mx-auto border border-teal-200">
                                  <p className="text-slate-700 text-sm">
                                    ✨ {extractionProgress}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : formData.pdfFile ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-center space-x-2">
                                <Check className="h-6 w-6 text-emerald-500" />
                                <p className="text-emerald-600 font-semibold text-lg">PDF Processed Successfully!</p>
                              </div>
                              <div className="bg-emerald-50 rounded-lg p-4 max-w-md mx-auto border border-emerald-200">
                                <p className="text-slate-700 font-medium">{formData.pdfFile.split('/').pop()}</p>
                                <div className="flex items-center justify-center space-x-4 text-xs text-gray-600 mt-2">
                                  {watermarkDetected && <span>✅ Watermarks removed</span>}
                                  {formData.author && <span>✅ Author extracted</span>}
                                  <span>✅ Metadata processed</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-slate-700 font-semibold text-xl mb-2">Drop your PDF here</p>
                              <p className="text-gray-600 mb-4">Smart processing with watermark removal!</p>
                              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
                                <span>• Max size: 50MB</span>
                                <span>• PDF format only</span>
                                <span>• Smart processing</span>
                              </div>
                              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg p-3 border border-teal-200">
                                <p className="text-xs text-teal-700">
                                  🚀 <strong>Enhanced Upload:</strong> Automatic watermark removal, author extraction, and metadata processing!
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-teal-200/30">
                      <h3 className="text-2xl font-bold text-slate-700 mb-8 flex items-center">
                        <BookOpen className="h-6 w-6 mr-3 text-teal-500" />
                        Book Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div className="md:col-span-2">
                          <label className="flex items-center text-sm font-semibold text-gray-600 mb-3">
                            <FileText className="h-4 w-4 mr-2 text-teal-500" />
                            Book Title *
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter your book's title"
                            className="w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-teal-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-400/20 transition-all duration-200 text-slate-700 placeholder-gray-500 text-lg"
                            required
                          />
                        </div>

                        {/* Author */}
                        <div>
                          <label className="flex items-center text-sm font-semibold text-gray-600 mb-3">
                            <User className="h-4 w-4 mr-2 text-teal-500" />
                            Author Name {formData.author && <span className="text-green-600 ml-1">(Auto-detected)</span>}
                          </label>
                          <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleInputChange}
                            placeholder="Author name (optional)"
                            className="w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-teal-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-400/20 transition-all duration-200 text-slate-700 placeholder-gray-500"
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="flex items-center text-sm font-semibold text-gray-600 mb-3">
                            <Tag className="h-4 w-4 mr-2 text-teal-500" />
                            Category *
                          </label>
                          <div className="relative">
                            <select
                              name="category"
                              value={formData.category}
                              onChange={handleInputChange}
                              className="w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-teal-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-400/20 transition-all duration-200 text-slate-700 appearance-none cursor-pointer"
                              required
                            >
                              <option value="" className="bg-white">Select category</option>
                              {categories.map((category) => (
                                <option key={category} value={category} className="bg-white">
                                  {category}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                          </div>
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                          <label className="flex items-center text-sm font-semibold text-gray-600 mb-3">
                            <MessageSquare className="h-4 w-4 mr-2 text-teal-500" />
                            Book Description *
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe your book..."
                            rows="6"
                            className="w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-teal-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-400/20 transition-all duration-200 text-slate-700 placeholder-gray-500 resize-none"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmit}
                      disabled={!isFormValid || uploading || extracting}
                      className={`w-full py-6 px-8 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center justify-center space-x-4 relative overflow-hidden ${
                        !isFormValid || uploading || extracting
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : submitStatus === 'success'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                          : 'bg-gradient-to-r from-teal-500 via-emerald-500 to-sage-500 text-white hover:from-teal-600 hover:via-emerald-600 hover:to-sage-600 transform hover:scale-105 shadow-lg'
                      }`}
                    >
                      {extracting ? (
                        <>
                          <Wand2 className="h-8 w-8 animate-pulse" />
                          <span>Processing PDF...</span>
                        </>
                      ) : uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
                          <span>Publishing Book...</span>
                        </>
                      ) : submitStatus === 'success' ? (
                        <>
                          <Check className="h-8 w-8" />
                          <span>Successfully Published! ✨</span>
                        </>
                      ) : (
                        <>
                          <Crown className="h-8 w-8" />
                          <span>Publish Enhanced Book</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}