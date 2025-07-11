"use client";
import React, { useState } from 'react';
import { Upload, BookOpen, Image, FileText, User, Tag, MessageSquare, Check, AlertCircle, Star, Globe, Shield, Zap, Crown, Sparkles, ChevronDown, Loader, Wand2 } from 'lucide-react';

// Dynamic import for PDF.js to avoid SSR issues
let pdfjsLib = null;

// Initialize PDF.js only on client side
const initializePDFJS = async () => {
  if (typeof window !== 'undefined' && !pdfjsLib) {
    try {
      pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      console.log('PDF.js initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PDF.js:', error);
    }
  }
  return pdfjsLib;
};

const API_BASE_URL = 'http://localhost:5000/api';

export default function BookUploadPage() {
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [uploadedBook, setUploadedBook] = useState(null);

  // Check login status on component mount
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsLoggedIn(true);
      setUserInfo(JSON.parse(user));
      console.log('User is logged in:', JSON.parse(user));
    } else {
      setIsLoggedIn(false);
      console.log('User is not logged in');
    }
  }, []);

  const categories = [
    'Fiction', 'Non-Fiction', 'Science Fiction', 'Mystery & Thriller', 'Romance', 'Fantasy',
    'Biography', 'History', 'Science', 'Technology', 'Business', 'Self-Help', 'Arts & Culture',
    'Philosophy', 'Religion', 'Children\'s Books', 'Young Adult', 'Poetry', 'Drama', 'Reference'
  ];

  const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean'];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      alert('Please log in again to upload books');
      return null;
    }
    console.log('Using token for upload:', token.substring(0, 20) + '...');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Function to generate cover image from title
  const generateCoverImage = (title) => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Create gradient background with random colors
    const colors = [
      ['#3B82F6', '#1E40AF'], // Blue
      ['#10B981', '#047857'], // Green
      ['#F59E0B', '#D97706'], // Yellow
      ['#EF4444', '#DC2626'], // Red
      ['#8B5CF6', '#7C3AED'], // Purple
      ['#06B6D4', '#0891B2'], // Cyan
    ];
    const colorPair = colors[Math.floor(Math.random() * colors.length)];
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colorPair[0]);
    gradient.addColorStop(1, colorPair[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 400);
    
    // Add decorative elements
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(20, 20, 260, 360);
    ctx.fillRect(40, 40, 220, 320);
    
    // Add title text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    
    // Split title into lines
    const words = title.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 200 && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    
    // Draw title lines
    const startY = 180 - (lines.length * 15);
    lines.forEach((line, index) => {
      ctx.fillText(line, 150, startY + (index * 30));
    });
    
    // Add author placeholder
    ctx.font = '14px Arial';
    ctx.fillText('by Unknown Author', 150, startY + (lines.length * 30) + 40);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  // Function to extract cover page from PDF
  const extractCoverFromPDF = async (file) => {
    try {
      console.log('Extracting cover from PDF...');
      
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        console.log('Server-side rendering detected, skipping PDF cover extraction');
        return null;
      }
      
      // Initialize PDF.js dynamically
      const pdfjs = await initializePDFJS();
      if (!pdfjs) {
        console.log('PDF.js not available, skipping cover extraction');
        return null;
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ 
        data: arrayBuffer,
        // Disable canvas usage for PDF.js
        useSystemFonts: true,
        disableFontFace: false,
        isEvalSupported: false,
        isOffscreenCanvasSupported: false
      }).promise;
      
      // Get first page (cover page)
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2.0 });
      
      // Create canvas only in browser environment
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render page to canvas with error handling
      await page.render({
        canvasContext: context,
        viewport: viewport,
        // Add additional options to prevent canvas issues
        background: 'white',
        intent: 'display'
      }).promise;
      
      // Convert to image data URL
      const coverImageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      console.log('Cover extracted successfully from PDF');
      
      return coverImageDataUrl;
    } catch (error) {
      console.error('Error extracting cover from PDF:', error);
      console.log('Falling back to generated cover');
      return null;
    }
  };

  // Function to extract data from PDF
  const extractPDFData = async (file) => {
    try {
      setExtracting(true);
      console.log('Starting PDF extraction process...');
      
      // Extract title from filename
      const fileName = file.name.replace('.pdf', '').replace(/[-_]/g, ' ');
      let title = fileName.charAt(0).toUpperCase() + fileName.slice(1);
      
      // Try to extract cover from PDF first
      let coverImage = await extractCoverFromPDF(file);
      
      // If cover extraction fails, generate one
      if (!coverImage) {
        console.log('Cover extraction failed, generating cover image...');
        coverImage = generateCoverImage(title);
      } else {
        console.log('Cover extracted from PDF successfully!');
      }
      
      console.log('PDF extraction completed successfully');
      
      return {
        title: title,
        author: 'Unknown Author',
        category: 'Non-Fiction',
        description: `This is "${title}" - a comprehensive book that offers valuable insights and knowledge. Please update this description with more specific details about the content, themes, and what readers can expect to learn from this book.`,
        coverImage: coverImage,
        publishYear: new Date().getFullYear().toString()
      };
      
    } catch (error) {
      console.error('Error extracting PDF data:', error);
      const fileName = file.name.replace('.pdf', '');
      return {
        title: fileName || 'Untitled Book',
        author: 'Unknown Author',
        category: 'Non-Fiction',
        description: 'Please add a description for this book.',
        coverImage: generateCoverImage(fileName || 'Untitled Book'),
        publishYear: new Date().getFullYear().toString()
      };
    } finally {
      setExtracting(false);
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
      console.log('PDF file selected:', file.name, file.size);
      setPdfFile(file);
      
      // Create a blob URL for immediate preview
      const blobUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        pdfFile: blobUrl // Use blob URL for immediate access
      }));
      
      // Extract data from PDF automatically
      const extractedData = await extractPDFData(file);
      setFormData(prev => ({
        ...prev,
        ...extractedData,
        pdfFile: blobUrl // Keep blob URL
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
        console.log('PDF file dropped:', file.name, file.size);
        setPdfFile(file);
        
        // Create a blob URL for immediate preview
        const blobUrl = URL.createObjectURL(file);
        setFormData(prev => ({
          ...prev,
          pdfFile: blobUrl
        }));
        
        // Extract data from PDF automatically
        const extractedData = await extractPDFData(file);
        setFormData(prev => ({
          ...prev,
          ...extractedData,
          pdfFile: blobUrl
        }));
        setImagePreview(extractedData.coverImage);
      }
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setUploading(true);
    setSubmitStatus('loading');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setSubmitStatus('error');
        alert('Please log in again');
        return;
      }
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('coverImage', formData.coverImage);
      
      // Add the actual PDF file
      if (pdfFile) {
        formDataToSend.append('pdfFile', pdfFile);
      } else {
        alert('Please select a PDF file');
        setSubmitStatus('error');
        return;
      }

      console.log('Sending form data with file');
      console.log('PDF file:', pdfFile);
      console.log('API URL:', `${API_BASE_URL}/books/upload`);

      // Test server connectivity first
      try {
        const testResponse = await fetch(`${API_BASE_URL}/books`, {
          method: 'GET'
        });
        console.log('Server connectivity test - Status:', testResponse.status);
      } catch (connectError) {
        console.error('Server connectivity test failed:', connectError);
        alert('Cannot connect to server. Please make sure the backend is running on http://localhost:5000');
        setSubmitStatus('error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/books/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formDataToSend
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const newBook = await response.json();
        console.log('Book uploaded successfully:', newBook);
        setSubmitStatus('success');
        setUploadedBook(newBook);
        
        // Show success message with book preview info
        alert(`Book "${newBook.title}" uploaded successfully! You can now view it in your dashboard.`);
        
        // Redirect to dashboard after success to show the uploaded book
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 5000);
      } else {
        console.error('Response not ok. Status:', response.status, 'StatusText:', response.statusText);
        
        let error;
        try {
          const responseText = await response.text();
          console.log('Raw response text:', responseText);
          
          if (responseText) {
            try {
              error = JSON.parse(responseText);
            } catch (parseError) {
              console.error('Failed to parse error response as JSON:', parseError);
              error = { message: responseText || 'Unknown error occurred' };
            }
          } else {
            error = { message: `Server error: ${response.status} ${response.statusText}` };
          }
        } catch (textError) {
          console.error('Failed to read response text:', textError);
          error = { message: `Network error: ${response.status} ${response.statusText}` };
        }
        
        console.error('Upload error response:', error);
        setSubmitStatus('error');
        
        if (response.status === 401) {
          alert(`Authentication Error: ${error.message || 'Invalid token'}. Please log in again.`);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else if (response.status === 400) {
          alert(`Validation Error: ${error.message || 'Invalid book data'}`);
        } else if (response.status === 500) {
          alert(`Server Error: ${error.message || 'Internal server error'}`);
        } else {
          alert(`Error (${response.status}): ${error.message || 'Unknown error occurred'}`);
        }
      }
    } catch (error) {
      console.error('Error uploading book:', error);
      setSubmitStatus('error');
      alert('Failed to upload book. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const isFormValid = formData.title && formData.author && formData.category && formData.description && formData.pdfFile;

  // Show login prompt if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h2>
            <p className="text-gray-600">You need to be logged in to upload books.</p>
          </div>
          
          <div className="space-y-4">
            <a 
              href="/auth" 
              className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </a>
            <a 
              href="/" 
              className="block w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Show admin access required if user is not admin
  if (isLoggedIn && userInfo?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Access Required</h2>
            <p className="text-gray-600 mb-4">Only admin users can upload books to the library.</p>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-700">
                <strong>Current Role:</strong> {userInfo?.role || 'User'}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                You can read, rate, and download books from our library.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <a 
              href="/bookdetail" 
              className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Explore Books
            </a>
            <a 
              href="/dashboard" 
              className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              My Dashboard
            </a>
            <a 
              href="/" 
              className="block w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 relative overflow-hidden">
      {/* Soft Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sage-200/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* User Info Header */}
          {userInfo && (
            <div className="text-center mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-teal-200/50 max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Admin User</p>
                    <p className="font-semibold text-gray-800">{userInfo.name}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Peaceful Header */}
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
                Publish Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-sage-500 bg-clip-text text-transparent">
                Book
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Share your wisdom with a community of thoughtful readers. Create a lasting impact through our serene publishing platform.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-700 mb-2">2.5M+</div>
                <div className="text-gray-500 text-sm">Mindful Readers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-700 mb-2">150K+</div>
                <div className="text-gray-500 text-sm">Published Works</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-700 mb-2">4.9★</div>
                <div className="text-gray-500 text-sm">Author Rating</div>
              </div>
            </div>
          </div>

          {/* Rest of the upload form content remains the same */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-200/30 to-emerald-200/30 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-2xl rounded-3xl border border-teal-200/50 shadow-xl overflow-hidden">
              
              {/* Peaceful Header Bar */}
              <div className="bg-gradient-to-r from-teal-400 via-emerald-400 to-sage-400 p-1">
                <div className="bg-white/90 backdrop-blur-sm px-8 py-6 rounded-t-3xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Sparkles className="h-8 w-8 text-teal-600" />
                      <div>
                        <h2 className="text-2xl font-bold text-slate-700">Admin Publisher</h2>
                        <p className="text-teal-600">Upload books to the library</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-purple-100 px-4 py-2 rounded-full">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-purple-700 font-medium">Admin Access</span>
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
                              
                              {/* Cover Upload Overlay */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                                <label className="cursor-pointer bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">
                                  <Upload className="h-4 w-4 inline mr-2" />
                                  Change Cover
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
                          ) : (
                            <div className="w-full aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                              <div className="text-center">
                                <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 text-lg font-medium">Book Cover</p>
                                <p className="text-gray-500 text-sm">Upload PDF to auto-generate</p>
                                
                                {/* Upload Cover Button */}
                                <label className="mt-4 inline-block cursor-pointer bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors">
                                  <Upload className="h-4 w-4 inline mr-2" />
                                  Upload Cover
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
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Smart Features */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200/50">
                      <h4 className="text-slate-700 font-bold mb-4 flex items-center">
                        <Zap className="h-5 w-5 mr-2 text-emerald-500" />
                        Smart Features
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-gray-600 text-sm">Auto-extract title from filename</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-gray-600 text-sm">Extract real cover from PDF first page</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-gray-600 text-sm">Fallback to generated cover if needed</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-gray-600 text-sm">Upload custom cover option</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Columns - Form Fields */}
                  <div className="xl:col-span-2 space-y-8">
                    
                    {/* Essential Information */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-teal-200/30">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-slate-700 flex items-center">
                          <BookOpen className="h-6 w-6 mr-3 text-teal-500" />
                          Essential Information
                        </h3>
                        {extracting && (
                          <div className="flex items-center space-x-2 bg-teal-50 px-4 py-2 rounded-full">
                            <Loader className="h-4 w-4 text-teal-600 animate-spin" />
                            <span className="text-sm text-teal-700 font-medium">Processing PDF...</span>
                          </div>
                        )}
                        {formData.title && !extracting && (
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-full">
                              <Wand2 className="h-4 w-4 text-emerald-600" />
                              <span className="text-sm text-emerald-700 font-medium">Auto-filled from PDF</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
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
                            placeholder="Enter your book's meaningful title"
                            className="w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-teal-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-400/20 transition-all duration-200 text-slate-700 placeholder-gray-500 text-lg"
                            required
                          />
                        </div>

                        {/* Author */}
                        <div>
                          <label className="flex items-center text-sm font-semibold text-gray-600 mb-3">
                            <User className="h-4 w-4 mr-2 text-teal-500" />
                            Author Name *
                          </label>
                          <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleInputChange}
                            placeholder="Your name or pen name"
                            className="w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-teal-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-400/20 transition-all duration-200 text-slate-700 placeholder-gray-500"
                            required
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
                              <option value="" className="bg-white">Select primary category</option>
                              {categories.map((category) => (
                                <option key={category} value={category} className="bg-white">
                                  {category}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                          </div>
                        </div>

                        {/* Publication Year */}
                        <div>
                          <label className="flex items-center text-sm font-semibold text-gray-600 mb-3">
                            <Globe className="h-4 w-4 mr-2 text-teal-500" />
                            Publication Year
                          </label>
                          <input
                            type="number"
                            name="publishYear"
                            value={formData.publishYear}
                            onChange={handleInputChange}
                            placeholder="2024"
                            min="1900"
                            max="2024"
                            className="w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-teal-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-400/20 transition-all duration-200 text-slate-700 placeholder-gray-500"
                          />
                        </div>

                        {/* Cover Image URL */}
                        <div>
                          <label className="flex items-center text-sm font-semibold text-gray-600 mb-3">
                            <Image className="h-4 w-4 mr-2 text-teal-500" />
                            Cover Image URL (Optional)
                          </label>
                          <input
                            type="url"
                            name="coverImage"
                            value={formData.coverImage}
                            onChange={handleInputChange}
                            placeholder="https://example.com/cover.jpg"
                            className="w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-teal-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-400/20 transition-all duration-200 text-slate-700 placeholder-gray-500"
                          />
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
                            placeholder="Share the essence of your book. What wisdom, story, or journey will readers discover within these pages?"
                            rows="6"
                            className="w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-teal-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-400/20 transition-all duration-200 text-slate-700 placeholder-gray-500 resize-none"
                            required
                          />
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-sm text-gray-500">
                              {formData.description.length}/1000 characters
                            </div>
                            <div className="text-sm text-teal-600 font-medium">
                              Thoughtful descriptions inspire deeper connections
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* File Upload Section */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-teal-200/30">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-700 flex items-center">
                          <Upload className="h-5 w-5 mr-2 text-teal-500" />
                          Manuscript Upload
                        </h3>
                        <div className="text-sm text-teal-600 font-medium">
                          📚 Auto-fills form data
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
                              <div className="bg-teal-50 rounded-lg p-4 max-w-md mx-auto border border-teal-200">
                                <p className="text-slate-700 text-sm">
                                  ✨ Extracting title and generating cover
                                </p>
                              </div>
                            </div>
                          ) : formData.pdfFile ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-center space-x-2">
                                <Check className="h-6 w-6 text-emerald-500" />
                                <p className="text-emerald-600 font-semibold text-lg">PDF Processed Successfully!</p>
                              </div>
                              <div className="bg-emerald-50 rounded-lg p-4 max-w-md mx-auto border border-emerald-200">
                                <p className="text-slate-700 font-medium">{formData.pdfFile.split('/').pop()}</p>
                                <p className="text-gray-600 text-sm">✅ Form auto-filled & cover generated</p>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-slate-700 font-semibold text-xl mb-2">Drop your PDF manuscript here</p>
                              <p className="text-gray-600 mb-4">We'll automatically fill the form for you!</p>
                              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
                                <span>• Max size: 50MB</span>
                                <span>• PDF format only</span>
                                <span>• Auto-fill enabled</span>
                              </div>
                              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg p-3 border border-teal-200">
                                <p className="text-xs text-teal-700">
                                  🚀 <strong>Smart Upload:</strong> Title and cover will be automatically generated from your PDF!
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Messages */}
                    {!isFormValid && !extracting && (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="h-6 w-6 text-amber-600" />
                          <div>
                            <p className="text-amber-700 font-semibold">Ready to publish?</p>
                            <p className="text-amber-600">
                              {!formData.pdfFile 
                                ? "Please upload a PDF file to auto-fill book details" 
                                : "Please ensure all required fields are filled"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {extracting && (
                      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
                        <div className="flex items-center space-x-3">
                          <Loader className="h-6 w-6 text-teal-600 animate-spin" />
                          <div>
                            <p className="text-teal-700 font-semibold">Processing your PDF...</p>
                            <p className="text-teal-600">Extracting information and generating cover image</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Peaceful Submit Button */}
                    <button
                      onClick={handleSubmit}
                      disabled={!isFormValid || uploading || extracting}
                      className={`w-full py-6 px-8 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center justify-center space-x-4 relative overflow-hidden ${
                        !isFormValid || uploading || extracting
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : submitStatus === 'success'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                          : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 transform hover:scale-105 shadow-lg'
                      }`}
                    >
                      {!isFormValid || uploading || extracting ? null : (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      )}
                      {extracting ? (
                        <>
                          <Wand2 className="h-8 w-8 animate-pulse" />
                          <span>Processing PDF...</span>
                        </>
                      ) : uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
                          <span>Publishing Your Book...</span>
                        </>
                      ) : submitStatus === 'success' ? (
                        <>
                          <Check className="h-8 w-8" />
                          <span>Successfully Published! ✨</span>
                        </>
                      ) : submitStatus === 'error' ? (
                        <>
                          <AlertCircle className="h-8 w-8" />
                          <span>Upload Failed - Try Again</span>
                        </>
                      ) : (
                        <>
                          <Crown className="h-8 w-8" />
                          <span>Publish Book to Library</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(3)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                            ))}
                          </div>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Peaceful Benefits Footer */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-teal-200/30 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-3">Admin Upload</h3>
              <p className="text-gray-600">Upload books to the library with admin privileges and full control.</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-teal-200/30 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-3">Auto-Generate</h3>
              <p className="text-gray-600">Beautiful cover images and titles are automatically created from your PDF.</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-teal-200/30 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-3">Library Management</h3>
              <p className="text-gray-600">Manage the entire library collection with admin tools and controls.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}