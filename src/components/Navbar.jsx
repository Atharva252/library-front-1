"use client";
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-emerald-700">SereneLib</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-emerald-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </Link>
            <Link href="/bookupload" className="text-gray-700 hover:text-emerald-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Book Upload
            </Link>
            <Link href="/pdf-reader" className="text-gray-700 hover:text-emerald-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              PDF Reader
            </Link>
            <Link href="/bookdetail" className="text-gray-700 hover:text-emerald-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Book Details
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-emerald-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Dashboard
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-emerald-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Contact
            </Link>
            <Link href="/auth" className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Login/Register
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-emerald-700 focus:outline-none focus:text-emerald-700 p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <Link href="/" className="text-gray-700 hover:text-emerald-700 block px-3 py-2 rounded-md text-base font-medium transition-colors">
              Home
            </Link>
            <Link href="/bookupload" className="text-gray-700 hover:text-emerald-700 block px-3 py-2 rounded-md text-base font-medium transition-colors">
              Book Upload
            </Link>
            <Link href="/pdf-reader" className="text-gray-700 hover:text-emerald-700 block px-3 py-2 rounded-md text-base font-medium transition-colors">
              PDF Reader
            </Link>
            <Link href="/bookdetail" className="text-gray-700 hover:text-emerald-700 block px-3 py-2 rounded-md text-base font-medium transition-colors">
              Book Details
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-emerald-700 block px-3 py-2 rounded-md text-base font-medium transition-colors">
              Dashboard
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-emerald-700 block px-3 py-2 rounded-md text-base font-medium transition-colors">
              Contact
            </Link>
            <Link href="/auth" className="bg-emerald-600 text-white hover:bg-emerald-700 block px-3 py-2 rounded-md text-base font-medium transition-colors mt-2">
              Login/Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}