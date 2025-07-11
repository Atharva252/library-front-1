'use client';
import React, { useState, useEffect } from 'react';
import { Search, Book, User, Star, BookOpen, Download, Heart, Calendar, MessageCircle } from 'lucide-react';
import EnhancedPDFReader from './EnhancedPDFReader';

const API_BASE_URL = 'http://localhost:5000/api';

export default function BookDetail() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showReader, setShowReader] = useState(false);
  const [reviews, setReviews] = useState({});
  const [newReviews, setNewReviews] = useState({});

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/books`);
      if (response.ok) {
        const booksData = await response.json();
        setBooks(booksData);
        
        // Fetch reviews for each book
        const reviewsData = {};
        for (const book of booksData) {
          try {
            const reviewResponse = await fetch(`${API_BASE_URL}/reviews?bookId=${book._id}`);
            if (reviewResponse.ok) {
              const bookReviews = await reviewResponse.json();
              reviewsData[book._id] = bookReviews.map(review => ({
                _id: review._id,
                avatar: review.user?.avatar || `https://i.pravatar.cc/40?img=${Math.floor(Math.random() * 70) + 1}`,
                name: review.user?.name || 'Anonymous',
                rating: review.rating,
                comment: review.comment,
                date: new Date(review.createdAt).toISOString().split('T')[0],
                createdAt: review.createdAt
              }));
            } else {
              reviewsData[book._id] = [];
            }
          } catch (reviewError) {
            console.error(`Error fetching reviews for book ${book._id}:`, reviewError);
            reviewsData[book._id] = [];
          }
        }
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const handleReviewChange = (bookId, field, value) => {
    setNewReviews(prev => ({
      ...prev,
      [bookId]: {
        ...prev[bookId],
        [field]: value
      }
    }));
  };

  const handleRating = (bookId, rating) => {
    setNewReviews(prev => ({
      ...prev,
      [bookId]: {
        ...prev[bookId],
        rating: rating
      }
    }));
  };

  const handleReviewSubmit = async (e, bookId) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to submit a review');
      return;
    }

    const review = newReviews[bookId];
    if (!review || !review.rating || !review.comment) {
      alert('Please provide both rating and comment');
      return;
    }

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        alert('Please log in to submit a review');
        return;
      }

      // Send review to backend API
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          book: bookId,
          rating: review.rating,
          comment: review.comment
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Review submitted successfully:', result);
        
        // Add the new review to local state for immediate display
        const newReview = {
          _id: result.review._id,
          avatar: user.avatar || `https://i.pravatar.cc/40?img=${Math.floor(Math.random() * 70) + 1}`,
          name: user.name || 'You',
          rating: review.rating,
          comment: review.comment,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        };

        setReviews(prev => ({
          ...prev,
          [bookId]: [newReview, ...(prev[bookId] || [])]
        }));

        // Clear the form
        setNewReviews(prev => ({
          ...prev,
          [bookId]: { rating: 0, comment: '' }
        }));

        alert('Review submitted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  const handleReadBook = async (book) => {
    if (!user) {
      alert('Please log in to read books');
      return;
    }

    if (book.pdfFile) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await fetch(`${API_BASE_URL}/books/${book._id}/read`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
      } catch (error) {
        console.log('Could not track book read:', error);
      }
      
      let pdfUrl = book.pdfFile;
      if (!pdfUrl.startsWith('http') && !pdfUrl.startsWith('blob:')) {
        const serverUrl = 'http://localhost:5000';
        pdfUrl = `${serverUrl}/${pdfUrl}`;
      }
      
      const bookWithProperUrl = {
        ...book,
        pdfFile: pdfUrl
      };
      
      setSelectedBook(bookWithProperUrl);
    } else {
      alert('PDF file not available for this book');
    }
  };

  const handleDownloadBook = async (book) => {
    if (!user) {
      alert('Please log in to download books');
      return;
    }

    if (!book.pdfFile) {
      alert('PDF file not available for download');
      return;
    }

    // Extract filename from pdfFile path
    let filename = '';
    if (book.pdfFile.includes('/')) {
      filename = book.pdfFile.split('/').pop();
    } else {
      filename = book.pdfFile;
    }

    // Create download URL using the new download endpoint
    const downloadUrl = `http://localhost:5000/download/${filename}`;
    
    console.log('Downloading PDF from URL:', downloadUrl);
    console.log('Original PDF path:', book.pdfFile);
    console.log('Extracted filename:', filename);

    try {
      // Track the download
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE_URL}/books/${book._id}/read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      // Create a direct download link
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
      
      // Fallback: open in new tab
      const fallbackUrl = book.pdfFile.startsWith('http') 
        ? book.pdfFile 
        : `http://localhost:5000/${book.pdfFile}`;
      window.open(fallbackUrl, '_blank');
    }
  };

  const closePDFReader = () => {
    setSelectedBook(null);
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderStars = (rating, interactive = false, bookId = null) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => handleRating(bookId, star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating 
                  ? 'text-amber-400 fill-amber-400' 
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
my website mob          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Book className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-slate-800">Book Details & Reviews</h1>
            </div>
            {user && (
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar || 'https://i.pravatar.cc/80?img=8'}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                />
                <span className="text-sm font-medium text-slate-700">{user?.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Search Section */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-6 h-6 text-indigo-500" />
              <h2 className="text-2xl font-bold text-slate-800">Explore & Rate Books</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search books by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <Book className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {searchTerm ? 'No books found' : 'No books available'}
            </h3>
            <p className="text-slate-600">
              {searchTerm ? 'Try searching with different keywords' : 'Books will appear here once they are uploaded'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredBooks.map((book) => (
              <div
                key={book._id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden"
              >
                {/* Book Header */}
                <div className="p-6 border-b border-slate-200/50">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <img
                      src={book.coverImage || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=cover&w=200&q=80'}
                      alt={book.title}
                      className="w-32 h-44 object-cover rounded-lg shadow-md mx-auto lg:mx-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-800 mb-2">{book.title}</h3>
                          {book.author && (
                            <p className="text-lg text-slate-600 mb-1">by {book.author}</p>
                          )}
                          {book.category && (
                            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                              {book.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {book.readCount > 0 && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                              {book.readCount} reads
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {book.description && (
                        <p className="text-slate-700 mb-4 leading-relaxed">{book.description}</p>
                      )}
                      
                      {book.uploadedBy && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                          <User className="w-4 h-4" />
                          <span>Published by {book.uploadedBy.name}</span>
                          {book.publishedAt && (
                            <>
                              <span>•</span>
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(book.publishedAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 flex-wrap">
                        <button
                          onClick={() => handleReadBook(book)}
                          disabled={!book.pdfFile}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            book.pdfFile 
                              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 hover:scale-105' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <BookOpen className="w-4 h-4" />
                          {book.pdfFile ? (user ? 'Read Now' : 'Login to Read') : 'Not Available'}
                        </button>
                        
                        {book.pdfFile && (
                          <button
                            onClick={() => handleDownloadBook(book)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105"
                          >
                            <Download className="w-4 h-4" />
                            {user ? 'Download' : 'Login to Download'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="p-6">
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Write Review */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <MessageCircle className="w-5 h-5 text-indigo-600" />
                        <h4 className="text-lg font-semibold text-slate-800">Write a Review</h4>
                      </div>
                      
                      {user ? (
                        <form
                          onSubmit={(e) => handleReviewSubmit(e, book._id)}
                          className="bg-slate-50 rounded-xl p-4 space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Your Rating</label>
                            {renderStars(newReviews[book._id]?.rating || 0, true, book._id)}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Your Review</label>
                            <textarea
                              value={newReviews[book._id]?.comment || ''}
                              onChange={(e) => handleReviewChange(book._id, 'comment', e.target.value)}
                              rows="3"
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                              placeholder="Share your thoughts about this book..."
                            />
                          </div>
                          
                          <button
                            type="submit"
                            disabled={!newReviews[book._id]?.rating || !newReviews[book._id]?.comment}
                            className="w-full py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Submit Review
                          </button>
                        </form>
                      ) : (
                        <div className="bg-slate-50 rounded-xl p-6 text-center">
                          <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                          <p className="text-slate-600 mb-4">Please log in to write a review</p>
                          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            Log In
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Existing Reviews */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-amber-500" />
                        <h4 className="text-lg font-semibold text-slate-800">
                          Reviews ({reviews[book._id]?.length || 0})
                        </h4>
                      </div>
                      
                      <div className="space-y-4 max-h-80 overflow-y-auto">
                        {reviews[book._id]?.length > 0 ? (
                          reviews[book._id].map((review, index) => (
                            <div
                              key={index}
                              className="bg-white rounded-lg p-4 shadow-sm border border-slate-200"
                            >
                              <div className="flex items-start gap-3">
                                <img
                                  src={review.avatar}
                                  alt={review.name}
                                  className="w-10 h-10 rounded-full border-2 border-slate-200"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-slate-800">{review.name}</span>
                                    <span className="text-xs text-slate-500">{review.date}</span>
                                  </div>
                                  {renderStars(review.rating)}
                                  <p className="text-slate-700 mt-2 text-sm leading-relaxed">{review.comment}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                            <p className="text-slate-500">No reviews yet. Be the first to review!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}