"use client";
import { useState } from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowUp } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSocialClick = (platform) => {
    console.log(`${platform} clicked - Add your social media link here`);
    // You can add your social media links here
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      console.log('Subscribing email:', email);
      alert('Thank you for subscribing! We will keep you updated.');
      setEmail('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 border-t border-emerald-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Company Info & Social Media */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
              SereneLib
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your premium digital library platform. Discover, organize, and share knowledge with our comprehensive collection management system.
            </p>
            <div className="flex space-x-3">
              <button 
                className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-full hover:from-emerald-600 hover:to-emerald-800 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={() => handleSocialClick('facebook')}
                title="Facebook"
              >
                <Facebook size={18} />
              </button>
              <button 
                className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-full hover:from-emerald-600 hover:to-emerald-800 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={() => handleSocialClick('twitter')}
                title="Twitter"
              >
                <Twitter size={18} />
              </button>
              <button 
                className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-full hover:from-emerald-600 hover:to-emerald-800 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={() => handleSocialClick('instagram')}
                title="Instagram"
              >
                <Instagram size={18} />
              </button>
              <button 
                className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-full hover:from-emerald-600 hover:to-emerald-800 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={() => handleSocialClick('linkedin')}
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors duration-300 hover:translate-x-1 transform inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/bookupload" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors duration-300 hover:translate-x-1 transform inline-block">
                  Book Upload
                </Link>
              </li>
              <li>
                <Link href="/bookdetail" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors duration-300 hover:translate-x-1 transform inline-block">
                  Book Details
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors duration-300 hover:translate-x-1 transform inline-block">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors duration-300 hover:translate-x-1 transform inline-block">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors duration-300 hover:translate-x-1 transform inline-block">
                  Login/Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Stay Updated</h4>
            <p className="text-gray-600 text-sm">
              Subscribe to get the latest updates about new books and features.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-sm bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Subscribe
              </button>
            </form>
            
            {/* Contact Info */}
            <div className="pt-4 space-y-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail size={14} />
                <span className="text-xs">support@serenelib.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone size={14} />
                <span className="text-xs">+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-sm text-gray-600">
              © 2025 SereneLib. All rights reserved. Made with ❤️ for book lovers.
            </p>
            <div className="flex items-center space-x-4">
              <Link href="/contact" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors duration-300">
                Contact Us
              </Link>
              <span className="text-gray-400">•</span>
              <button
                onClick={scrollToTop}
                className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-full hover:from-emerald-600 hover:to-emerald-800 transform hover:scale-110 transition-all duration-300 shadow-md hover:shadow-lg"
                title="Scroll to top"
              >
                <ArrowUp size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}