"use client";
import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, User, MessageSquare, BookOpen, Star, CheckCircle } from 'lucide-react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      category: 'general'
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'support@mylibrary.com',
      description: 'Get in touch via email for detailed inquiries',
      color: 'from-amber-400 to-orange-400'
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+1 (555) 123-4567',
      description: 'Speak directly with our support team',
      color: 'from-rose-400 to-pink-400'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content: '123 Library Street, Digital City, DC 12345',
      description: 'Come visit our beautiful library space',
      color: 'from-emerald-400 to-teal-400'
    },
    {
      icon: Clock,
      title: 'Office Hours',
      content: 'Mon - Fri: 9AM - 6PM EST',
      description: 'We are here to help during business hours',
      color: 'from-violet-400 to-purple-400'
    }
  ];

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'feedback', label: 'Feedback & Suggestions' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200">
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 py-16">
        <div className="absolute inset-0 bg-opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full mb-6 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-400 bg-clip-text text-transparent mb-4">
            Get In Touch
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Have questions about SereneLib? We would love to hear from you. Our dedicated team is here to help you make the most of your digital reading experience.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Send Us a Message</h2>
              <p className="text-gray-600">Fill out the form below and we will get back to you within 24 hours.</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 bg-white/80"
                      placeholder="Your full name"
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 bg-white/80"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 bg-white/80"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 bg-white/80"
                  placeholder="Brief subject of your message"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 bg-white/80 resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitted}
                className="w-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 text-white font-semibold py-4 px-6 rounded-lg hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-900 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Message Sent Successfully!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Let's Connect</h2>
              <p className="text-gray-600 text-lg">
                Choose the best way to reach us. We are committed to providing exceptional support for your digital library journey.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <div
                    key={index}
                    className={`bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-emerald-100 hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer ${
                      hoveredCard === index ? 'ring-2 ring-emerald-300' : ''
                    }`}
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 bg-gradient-to-r ${info.color} rounded-lg shadow-md`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{info.title}</h3>
                        <p className="text-gray-900 font-medium mb-1">{info.content}</p>
                        <p className="text-sm text-gray-600">{info.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-6 rounded-xl border border-emerald-200">
              <div className="flex items-center space-x-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-700 italic mb-3">
                The MyLibrary support team is absolutely wonderful! They helped me organize my entire digital collection and were so patient with all my questions.
              </blockquote>
              <cite className="text-sm font-semibold text-gray-600">— Sarah M., Book Enthusiast</cite>
            </div>

            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-emerald-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Help</h3>
              <div className="space-y-2">
                {[
                  'How to upload books?',
                  'Organizing your library',
                  'Sharing and collaboration',
                  'Account settings'
                ].map((question, index) => (
                  <button
                    key={index}
                    className="block w-full text-left text-sm text-gray-600 hover:text-emerald-600 hover:translate-x-2 transition-all duration-300 py-1"
                  >
                    • {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isSubmitted && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-lg shadow-lg transform animate-pulse">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Message sent successfully! We will be in touch soon.</span>
          </div>
        </div>
      )}
    </div>
  );
}