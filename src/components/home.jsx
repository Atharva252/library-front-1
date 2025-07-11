"use client";
import React, { useEffect, useState } from 'react';
import { Search, Book, User, Sparkles, Heart, Star, BookOpen, Upload, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import EnhancedPDFReader from './EnhancedPDFReader';

const API_BASE_URL = 'http://localhost:5000/api';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    // Always fetch books regardless of user login status
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/books`);
      if (response.ok) {
        const booksData = await response.json();
        setBooks(booksData);
      } else {
        // Fallback to dummy data if API fails
        setBooks([
          {
            _id: 1,
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop",
            description: "A classic American novel"
          },
          {
            _id: 2,
            title: "To Kill a Mockingbird",
            author: "Harper Lee",
            coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
            description: "A gripping tale of racial injustice"
          },
          {
            _id: 3,
            title: "1984",
            author: "George Orwell",
            coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop",
            description: "A dystopian social science fiction novel"
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      // Fallback to dummy data even on error
      setBooks([
        {
          _id: 1,
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop",
          description: "A classic American novel"
        },
        {
          _id: 2,
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
          description: "A gripping tale of racial injustice"
        },
        {
          _id: 3,
          title: "1984",
          author: "George Orwell",
          coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop",
          description: "A dystopian social science fiction novel"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReadBook = async (book) => {
    // Check if user is logged in for premium features
    if (!user) {
      alert('Please log in to read books. Create a free account to access our library!');
      router.push('/auth');
      return;
    }

    if (book.pdfFile) {
      // Track the book read
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
      
      // Create proper PDF URL - check if it's already a full URL or just a path
      let pdfUrl = book.pdfFile;
      
      // If it's just a path like "uploads/filename.pdf", convert to full URL
      if (!pdfUrl.startsWith('http') && !pdfUrl.startsWith('blob:')) {
        // Try different possible server URLs
        const serverUrl = 'http://localhost:5000';
        pdfUrl = `${serverUrl}/${pdfUrl}`;
      }
      
      console.log('Final PDF URL for home:', pdfUrl);
      
      // Create book object with proper PDF URL
      const bookWithProperUrl = {
        ...book,
        pdfFile: pdfUrl
      };
      
      setSelectedBook(bookWithProperUrl);
    } else {
      alert('PDF file not available for this book. Please contact support or try another book.');
    }
  };

  const closePDFReader = () => {
    setSelectedBook(null);
  };

  const handleDownloadBook = async (book) => {
    // Check if user is logged in
    if (!user) {
      alert('Please log in to download books. Create a free account to access our library!');
      router.push('/auth');
      return;
    }

    if (!book.pdfFile) {
      alert('PDF file not available for download');
      return;
    }

    try {
      // Track the book read/download
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
      console.log('Could not track book download:', error);
    }

    // Create proper PDF URL for download
    let pdfUrl = book.pdfFile;
    
    // If it's just a path like "uploads/filename.pdf", convert to full URL
    if (!pdfUrl.startsWith('http') && !pdfUrl.startsWith('blob:')) {
      const serverUrl = 'http://localhost:5000';
      pdfUrl = `${serverUrl}/${pdfUrl}`;
    }

    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${book.title} - ${book.author}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-amber-50">
      {/* Floating orbs for premium feel */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-emerald-200/20 to-stone-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-amber-100/20 to-stone-200/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-amber-200 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-4 rounded-full shadow-lg">
                <Book className="h-12 w-12 text-emerald-700" />
              </div>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-emerald-800 via-stone-700 to-emerald-600 bg-clip-text text-transparent">
              Serene
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-700 via-stone-600 to-emerald-700 bg-clip-text text-transparent">
              Reading
            </span>
          </h1>
          
          <p className="text-xl text-stone-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Immerse yourself in our curated collection of timeless literature and contemporary masterpieces, 
            designed for the discerning reader seeking tranquility and wisdom.
          </p>
          
          <div className="max-w-3xl mx-auto relative mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-amber-200 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-2">
                <div className="flex items-center">
                  <Search className="ml-6 h-6 w-6 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Discover your next peaceful read..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-6 py-5 text-lg bg-transparent border-none outline-none text-stone-700 placeholder-stone-400"
                  />
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-2xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mr-2"
                  >
                    {searchTerm ? 'Clear' : 'Search'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">10,000+</div>
              <div className="text-sm text-stone-600">Premium Books</div>
            </div>
            <div className="w-px bg-stone-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">50,000+</div>
              <div className="text-sm text-stone-600">Happy Readers</div>
            </div>
            <div className="w-px bg-stone-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">4.9★</div>
              <div className="text-sm text-stone-600">Reader Rating</div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-emerald-800 text-center mb-2">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'Featured Collection'}
          </h2>
          <p className="text-stone-600 text-center mb-8">
            {searchTerm ? `Found ${filteredBooks.length} books` : 'Handpicked classics for your reading pleasure'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <Book className="w-16 h-16 text-stone-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-stone-800 mb-2">
              {searchTerm ? 'No books found' : 'No books available'}
            </h3>
            <p className="text-stone-600">
              {searchTerm ? 'Try searching with different keywords' : 'Books will appear here once they are uploaded'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredBooks.map((book, index) => (
            <div
                key={book._id}
                className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 overflow-hidden border border-stone-200/50"
              >
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                    {book.uploadedBy ? 'User Published' : 'Premium'}
                  </div>
                  {book.readCount > 0 && (
                    <div className="bg-gradient-to-r from-green-400 to-green-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                      {book.readCount} reads
                    </div>
                  )}
                </div>
                
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 via-transparent to-transparent z-10"></div>
                  <img
                    src={book.coverImage || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop'}
                    alt={book.title}
                    className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-4 left-4 z-20">
                    <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                      <span className="text-sm font-medium text-stone-700">4.5</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-emerald-800 transition-colors duration-300">
                    {book.title}
                  </h3>
                  <p className="text-stone-600 mb-2">by {book.author}</p>
                  {book.uploadedBy && (
                    <p className="text-xs text-stone-500 mb-2">
                      Published by {book.uploadedBy.name}
                    </p>
                  )}
                  {book.publishedAt && (
                    <p className="text-xs text-stone-400 mb-4">
                      Published: {new Date(book.publishedAt).toLocaleDateString()}
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    {/* Read and Download buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReadBook(book)}
                        disabled={!book.pdfFile}
                        className={`flex-1 py-2.5 px-3 rounded-xl font-medium transform transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-sm ${
                          book.pdfFile 
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 hover:scale-105' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>{book.pdfFile ? (user ? 'Read' : 'Login') : 'N/A'}</span>
                      </button>
                      
                      {book.pdfFile && (
                        <button
                          onClick={() => handleDownloadBook(book)}
                          className="flex-1 py-2.5 px-3 rounded-xl font-medium transform transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-105"
                        >
                          <Download className="h-4 w-4" />
                          <span>{user ? 'Download' : 'Login'}</span>
                        </button>
                      )}
                      
                      <button className="p-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors duration-300 group">
                        <Heart className="h-4 w-4 text-stone-600 group-hover:text-red-500 transition-colors duration-300" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Reading Status Indicator */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${book.pdfFile ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span className={book.pdfFile ? 'text-green-600' : 'text-red-600'}>
                        {book.pdfFile ? 'Available to Read' : 'PDF Not Available'}
                      </span>
                    </div>
                    {!user && (
                      <span className="text-amber-600 font-medium">Login Required</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reading Access Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200/50 shadow-xl mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-800 mb-4">📚 Publishing & Reading Flow</h2>
            <p className="text-lg text-blue-600">How books get published and when you can read them</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-blue-200/50">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">1. Publisher Uploads</h3>
              <p className="text-gray-600 text-sm">Authors/Publishers upload books with PDF files through our platform</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-blue-200/50">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">2. Instant Publishing</h3>
              <p className="text-gray-600 text-sm">Books are published immediately and become available to all users</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-blue-200/50">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">3. User Login</h3>
              <p className="text-gray-600 text-sm">Readers must log in to access published books and reading features</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-blue-200/50">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">4. Start Reading</h3>
              <p className="text-gray-600 text-sm">Users can read any published book instantly with our built-in PDF reader</p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto">
              <h4 className="text-xl font-bold text-gray-800 mb-4">📖 Book Status & Reading Guide</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-green-600 font-medium">Published & Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-600 font-medium">User Published</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                  <span className="text-amber-600 font-medium">Login Required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-red-600 font-medium">PDF Not Available</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl">
                <p className="text-gray-700 font-medium">
                  ✨ <strong>Publishing Flow:</strong> Upload → Instant Publishing → User Login → Start Reading
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Books are available to read immediately after publishing. Reading is tracked for analytics.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-stone-50 rounded-3xl p-12 border border-stone-200/50 shadow-xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-emerald-800 mb-4">Why Choose SereneLib Premium?</h2>
            <p className="text-xl text-stone-600">Experience reading like never before</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-stone-200/50 hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-emerald-100 to-stone-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Book className="h-8 w-8 text-emerald-700" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">Curated Collection</h3>
                <p className="text-stone-600">Handpicked books by literary experts for the most enriching reading experience</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-stone-200/50 hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-amber-100 to-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">Premium Features</h3>
                <p className="text-stone-600">Advanced reading tools, personalized recommendations, and ad-free experience</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-stone-200/50 hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-stone-100 to-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">Peaceful Reading</h3>
                <p className="text-stone-600">Designed with tranquility in mind, creating the perfect reading sanctuary</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}