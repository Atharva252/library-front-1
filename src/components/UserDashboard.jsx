"use client";
import React, { useState, useEffect } from 'react';
import { Download, BookOpen, User, Sparkles, Edit, Trash2, Star, Calendar, Upload, Camera } from 'lucide-react';
import EnhancedPDFReader from './EnhancedPDFReader';

const API_BASE_URL = 'http://localhost:5000/api';

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [uploadedBooks, setUploadedBooks] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editReviewData, setEditReviewData] = useState({});

  // Determine default tab based on user role
  const getDefaultTab = () => {
    if (user?.role === 'admin') return 'uploaded';
    return 'reviews';
  };

  const [tab, setTab] = useState('uploaded');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setTab(parsedUser.role === 'admin' ? 'uploaded' : 'reviews');
      fetchUserData();
    }
  }, []);

  // Refresh data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchUserData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      alert('Please log in again');
      return null;
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      
      if (!headers) {
        setLoading(false);
        return;
      }
      
      // Fetch user profile
      const profileResponse = await fetch(`${API_BASE_URL}/users/profile`, { headers });
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUser(profileData);
        localStorage.setItem('user', JSON.stringify(profileData));
      } else if (profileResponse.status === 401) {
        console.error('Token invalid for profile fetch');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Session expired. Please log in again.');
        return;
      }

      // Fetch user's uploaded books (for admin users)
      if (user?.role === 'admin') {
        const booksResponse = await fetch(`${API_BASE_URL}/books/my-books`, { headers });
        if (booksResponse.ok) {
          const booksData = await booksResponse.json();
          setUploadedBooks(booksData);
        }
      }

      // Fetch user reviews (for all users)
      const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/user/my-reviews`, { headers });
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setMyReviews(reviewsData);
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);
      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: user.name,
          email: user.email
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.user);
        localStorage.setItem('user', JSON.stringify(updatedUser.user));
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size should be less than 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please log in again');
        return;
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_BASE_URL}/users/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        const updatedUser = result.user;
        // Update avatar URL to include server base URL
        if (updatedUser.avatar && !updatedUser.avatar.startsWith('http')) {
          updatedUser.avatar = `http://localhost:5000${updatedUser.avatar}`;
        }
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert('Avatar updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error uploading avatar: ${error.message}`);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setEditReviewData({
      rating: review.rating,
      comment: review.comment
    });
  };

  const handleSaveReview = async () => {
    try {
      setUpdating(true);
      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/reviews/${editingReview._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(editReviewData)
      });

      if (response.ok) {
        const updatedReview = await response.json();
        setMyReviews(myReviews.map(review => 
          review._id === editingReview._id ? updatedReview.review : review
        ));
        setEditingReview(null);
        setEditReviewData({});
        alert('Review updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        setMyReviews(myReviews.filter(review => review._id !== reviewId));
        alert('Review deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setEditFormData({
      title: book.title,
      author: book.author || '',
      description: book.description || '',
      category: book.category || '',
      coverImage: book.coverImage || '',
      available: book.available,
      published: book.published
    });
  };

  const handleSaveEdit = async () => {
    try {
      setUpdating(true);
      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/books/${editingBook._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        const updatedBook = await response.json();
        setUploadedBooks(uploadedBooks.map(book => 
          book._id === editingBook._id ? updatedBook : book
        ));
        setEditingBook(null);
        setEditFormData({});
        alert('Book updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating book:', error);
      alert('Failed to update book');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingBook(null);
    setEditFormData({});
  };

  const handleDeleteBook = async (id) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        setUploadedBooks(uploadedBooks.filter(book => book._id !== id));
        alert('Book deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book');
    }
  };

  const handleReadBook = (book) => {
    console.log('Attempting to read book:', book);
    console.log('PDF file path:', book.pdfFile);
    
    if (book.pdfFile) {
      let pdfUrl = book.pdfFile;
      
      if (!pdfUrl.startsWith('http') && !pdfUrl.startsWith('blob:')) {
        const serverUrl = 'http://localhost:5000';
        pdfUrl = `${serverUrl}/${pdfUrl}`;
      }
      
      console.log('Final PDF URL:', pdfUrl);
      
      const bookWithProperUrl = {
        ...book,
        pdfFile: pdfUrl
      };
      
      setSelectedBook(bookWithProperUrl);
    } else {
      alert('PDF file not available for this book');
    }
  };

  const closePDFReader = () => {
    setSelectedBook(null);
  };

  const handleDownloadBook = async (book) => {
    if (!book.pdfFile) {
      alert('PDF file not available for download');
      return;
    }

    let filename = '';
    if (book.pdfFile.includes('/')) {
      filename = book.pdfFile.split('/').pop();
    } else {
      filename = book.pdfFile;
    }

    const downloadUrl = `http://localhost:5000/download/${filename}`;
    
    console.log('Downloading PDF from URL:', downloadUrl);
    console.log('Original PDF path:', book.pdfFile);
    console.log('Extracted filename:', filename);

    try {
      const headers = getAuthHeaders();
      if (headers) {
        await fetch(`${API_BASE_URL}/books/${book._id}/read`, {
          method: 'POST',
          headers
        });
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = book.author ? `${book.title} - ${book.author}.pdf` : `${book.title}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Download started successfully!');
    } catch (error) {
      console.error('Download error:', error);
      alert(`Download failed: ${error.message}. Please try opening the PDF in a new tab instead.`);
      
      const fallbackUrl = book.pdfFile.startsWith('http') 
        ? book.pdfFile 
        : `http://localhost:5000/${book.pdfFile}`;
      window.open(fallbackUrl, '_blank');
    }
  };

  // Show PDF Reader if a book is selected
  if (selectedBook) {
    return (
      <EnhancedPDFReader
        pdfUrl={selectedBook.pdfFile}
        bookTitle={selectedBook.title}
        onClose={closePDFReader}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Get available tabs based on user role
  const getAvailableTabs = () => {
    const baseTabs = [
      { key: 'profile', label: 'Profile', icon: User }
    ];

    if (user?.role === 'admin') {
      return [
        { key: 'uploaded', label: 'My Books', icon: Upload },
        ...baseTabs
      ];
    } else {
      return [
        { key: 'reviews', label: 'My Reviews', icon: Star },
        ...baseTabs
      ];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                user?.role === 'admin' 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}>
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  {user?.role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
                </h1>
                <p className="text-sm text-slate-600">
                  {user?.role === 'admin' ? 'Manage your book uploads' : 'Track your reading activity'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {user?.role === 'admin' ? 'Admin' : 'User'}
              </div>
              <img
                src={user?.avatar || 'https://i.pravatar.cc/80?img=8'}
                alt="avatar"
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
              />
              <span className="text-sm font-medium text-slate-700">{user?.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-slate-300/30 to-blue-400/30 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-indigo-500" />
                <h2 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name?.split(' ')[0]}!</h2>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed">
                {user?.role === 'admin' 
                  ? 'Manage your book uploads and track their performance. Upload new books to share with the community.'
                  : 'Discover amazing books, read, rate, and download your favorites. Track your reading journey here.'
                }
                <span className="block mt-2 text-sm text-slate-500">
                  {user?.role === 'admin' 
                    ? `${uploadedBooks.length} books uploaded`
                    : `${myReviews.length} reviews written`
                  }
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-sm border border-white/40">
            <div className="flex gap-2">
              {getAvailableTabs().map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    tab === key
                      ? 'bg-white shadow-lg text-indigo-700 transform scale-105'
                      : 'text-slate-600 hover:bg-white/50 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        {tab === 'uploaded' && user?.role === 'admin' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Upload className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-semibold text-slate-800">My Uploaded Books</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={fetchUserData}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50"
                >
                  <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <a
                  href="/bookupload"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload New Book
                </a>
              </div>
            </div>
            {uploadedBooks.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-white/50">
                <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-slate-800 mb-2">No Books Uploaded Yet</h4>
                <p className="text-slate-600 mb-6">Start sharing your knowledge by uploading your first book!</p>
                <a 
                  href="/bookupload"
                  className="inline-block bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 transition-all duration-200"
                >
                  Upload Your First Book
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {uploadedBooks.map((book) => (
                  <div
                    key={book._id}
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-white/50"
                  >
                    <div className="flex gap-4">
                      <img
                        src={book.coverImage || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=cover&w=200&q=80'}
                        alt={book.title}
                        className="w-20 h-28 object-cover rounded-lg shadow-md"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-lg text-slate-800">{book.title}</h4>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Published
                          </span>
                        </div>
                        {book.author && (
                          <p className="text-slate-600 text-sm mb-2">by {book.author}</p>
                        )}
                        <div className="text-slate-500 text-sm mb-3 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Uploaded: {new Date(book.createdAt).toLocaleDateString()}
                        </div>
                        
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleReadBook(book)}
                            disabled={!book.pdfFile}
                            className={`px-3 py-1.5 rounded-lg shadow text-sm font-medium transition-all duration-200 ${
                              book.pdfFile 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <BookOpen className="w-3 h-3 inline mr-1" />
                            {book.pdfFile ? 'Read' : 'No PDF'}
                          </button>
                          
                          {book.pdfFile && (
                            <button
                              onClick={() => handleDownloadBook(book)}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow hover:from-blue-600 hover:to-indigo-700 text-sm font-medium transition-all duration-200"
                            >
                              <Download className="w-3 h-3 inline mr-1" />
                              Download
                            </button>
                          )}
                          <button
                            onClick={() => handleEditBook(book)}
                            className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg shadow hover:from-amber-500 hover:to-orange-600 text-sm font-medium transition-all duration-200"
                          >
                            <Edit className="w-3 h-3 inline mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book._id)}
                            className="px-3 py-1.5 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-lg shadow hover:from-red-500 hover:to-red-700 text-sm font-medium transition-all duration-200"
                          >
                            <Trash2 className="w-3 h-3 inline mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'reviews' && user?.role === 'user' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-semibold text-slate-800">My Reviews</h3>
              </div>
              <button
                onClick={fetchUserData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            {myReviews.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-white/50">
                <Star className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-slate-800 mb-2">No Reviews Yet</h4>
                <p className="text-slate-600 mb-6">Start exploring books and share your thoughts! Your reviews help other readers discover great content.</p>
                <a 
                  href="/bookdetail"
                  className="inline-block bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 transition-all duration-200"
                >
                  Explore Books
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {myReviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-white/50"
                  >
                    <div className="flex gap-4">
                      <img
                        src={review.book?.coverImage || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=cover&w=200&q=80'}
                        alt={review.book?.title || 'Book cover'}
                        className="w-16 h-20 object-cover rounded-lg shadow-md"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-lg text-slate-800">{review.book?.title || 'Unknown Book'}</h4>
                            {review.book?.author && (
                              <p className="text-slate-600 text-sm">by {review.book.author}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {renderStars(review.rating)}
                            <span className="text-sm text-slate-600">({review.rating}/5)</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-slate-700 leading-relaxed">{review.comment || 'No comment provided'}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-slate-500 text-sm flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Reviewed: {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditReview(review)}
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg shadow hover:from-amber-500 hover:to-orange-600 text-sm font-medium transition-all duration-200"
                            >
                              <Edit className="w-3 h-3 inline mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              className="px-3 py-1.5 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-lg shadow hover:from-red-500 hover:to-red-700 text-sm font-medium transition-all duration-200"
                            >
                              <Trash2 className="w-3 h-3 inline mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-semibold text-slate-800">Edit Profile</h3>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 max-w-2xl border border-white/50">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <img
                    src={user?.avatar || 'https://i.pravatar.cc/80?img=8'}
                    alt="avatar"
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                  />
                  <label className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-200 cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </label>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-slate-800">{user?.name}</h4>
                  <p className="text-slate-600">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user?.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user?.role === 'admin' ? 'Admin User' : 'Regular User'}
                    </div>
                    <p className="text-xs text-slate-500">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-700 font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    onChange={e => setUser({ ...user, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    onChange={e => setUser({ ...user, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <button
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4">
          {user?.role === 'admin' ? (
            <>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-white/40 hover:bg-white/70 transition-all duration-200">
                <div className="text-2xl font-bold text-purple-600">{uploadedBooks.length}</div>
                <div className="text-sm text-slate-600">Books Uploaded</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-white/40 hover:bg-white/70 transition-all duration-200">
                <div className="text-2xl font-bold text-green-600">∞</div>
                <div className="text-sm text-slate-600">Admin Access</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-white/40 hover:bg-white/70 transition-all duration-200">
                <div className="text-2xl font-bold text-blue-600">📚</div>
                <div className="text-sm text-slate-600">Library Manager</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-white/40 hover:bg-white/70 transition-all duration-200">
                <div className="text-2xl font-bold text-amber-600">{myReviews.length}</div>
                <div className="text-sm text-slate-600">Reviews</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-white/40 hover:bg-white/70 transition-all duration-200">
                <div className="text-2xl font-bold text-blue-600">∞</div>
                <div className="text-sm text-slate-600">Books Access</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-white/40 hover:bg-white/70 transition-all duration-200">
                <div className="text-2xl font-bold text-green-600">📖</div>
                <div className="text-sm text-slate-600">Reader</div>
              </div>
            </>
          )}
        </div>

        {/* Edit Review Modal */}
        {editingReview && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-800">Edit Review</h3>
                  <button
                    onClick={() => setEditingReview(null)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-slate-700 font-medium mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setEditReviewData({...editReviewData, rating})}
                        className={`p-2 rounded-lg transition-colors ${
                          editReviewData.rating >= rating
                            ? 'text-amber-400'
                            : 'text-slate-300 hover:text-amber-300'
                        }`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2">Comment</label>
                  <textarea
                    value={editReviewData.comment}
                    onChange={(e) => setEditReviewData({...editReviewData, comment: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Share your thoughts about this book..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
                <button
                  onClick={() => setEditingReview(null)}
                  className="px-6 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReview}
                  disabled={updating || !editReviewData.rating}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}