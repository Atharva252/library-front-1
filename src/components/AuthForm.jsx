'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const roles = ['user', 'admin'];

function PasswordInput({ label, name, value, onChange, error, show, setShow, placeholder, strength }) {
  return (
    <div className="mb-2">
      <label className="block text-gray-700 font-medium mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
            error ? 'border-red-400 focus:ring-red-200' : 'focus:ring-blue-200'
          }`}
          autoComplete={name}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
          tabIndex={-1}
        >
          {show ? (
            // Eye-off icon
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth="2" d="M3 3l18 18M10.7 10.7a3 3 0 104.6 4.6M9.53 9.53A5 5 0 0112 7c4.418 0 8 3.582 8 8 0 1.657-.672 3.157-1.757 4.243M6.343 6.343A7.963 7.963 0 004 15c0 1.657.672 3.157 1.757 4.243"/>
            </svg>
          ) : (
            // Eye icon
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
          )}
        </button>
      </div>
      {strength && (
        <div className="text-xs mt-1">
          <span
            className={`font-semibold ${
              strength === 'Strong'
                ? 'text-green-600'
                : strength === 'Medium'
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}
          >
            {strength} password
          </span>
        </div>
      )}
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
}

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Set mounted state
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (password.length > 8 && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)) return 'Strong';
    if (password.length >= 6) return 'Medium';
    return 'Weak';
  };

  const validate = () => {
    const errs = {};
    if (mode === 'register' && !form.name) errs.name = 'Full name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (mode === 'register') {
      if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
      else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
      if (!form.role) errs.role = 'Select a role';
    }
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', { mode, form });
    
    const errs = validate();
    setErrors(errs);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      role: true,
    });
    
    if (Object.keys(errs).length) {
      console.log('Validation errors:', errs);
      return;
    }
    
    setIsLoading(true);
    setErrors({}); // Clear previous errors

    try {
      console.log('Sending request to:', mode === 'login' ? 'login' : 'register');
      
      const res = await fetch(
        mode === 'login'
          ? 'http://localhost:5000/api/auth/login'
          : 'http://localhost:5000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      );
      
      console.log('Response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Auth response:', data);
        
        // Store both user and token
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log('User data stored');
        }
        if (data.token) {
          localStorage.setItem('token', data.token);
          console.log('Token stored successfully');
        }
        
        // Show success message
        setSubmitted(true);
        
        // Redirect after delay
        setTimeout(() => {
          console.log('Redirecting to home page...');
          window.location.href = '/'; // Use window.location instead of router.push
        }, 2000);
        
      } else {
        const errorData = await res.json();
        console.error('Auth error:', errorData);
        setErrors({ general: errorData.message || 'Authentication failed' });
      }
    } catch (error) {
      console.error('Network error:', error);
      setErrors({ general: 'Network error. Please check if the server is running.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 relative">
      {/* Book Icon Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <svg width="220" height="220" fill="none" viewBox="0 0 24 24">
          <path fill="#6366f1" d="M6 4v16c0 .55.45 1 1 1h11c.55 0 1-.45 1-1V4H6zm2 2h8v12H8V6zm-2 0V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v2H6z"/>
        </svg>
      </div>
      {/* Auth Card */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-6 transition-all duration-300"
      >
        <div className="flex flex-col items-center mb-2">
          {/* Book Icon */}
          <div className="bg-blue-100 rounded-full p-3 mb-2">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
              <path fill="#6366f1" d="M6 4v16c0 .55.45 1 1 1h11c.55 0 1-.45 1-1V4H6zm2 2h8v12H8V6zm-2 0V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v2H6z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'login' ? 'Library Login' : 'Register Account'}
          </h2>
        </div>
        {/* Register: Name */}
        {mode === 'register' && (
          <div className="transition-all duration-300">
            <label className="block text-gray-700 font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.name && touched.name ? 'border-red-400 focus:ring-red-200' : 'focus:ring-blue-200'
              }`}
              placeholder="Enter your full name"
              autoComplete="name"
            />
            {errors.name && touched.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
          </div>
        )}
        {/* Email */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
              errors.email && touched.email ? 'border-red-400 focus:ring-red-200' : 'focus:ring-blue-200'
            }`}
            placeholder="Enter your email"
            autoComplete="email"
          />
          {errors.email && touched.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
        </div>
        {/* Password */}
        <PasswordInput
          label="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password && touched.password ? errors.password : ''}
          show={showPassword}
          setShow={setShowPassword}
          placeholder="Enter your password"
          strength={mode === 'register' ? getPasswordStrength(form.password) : undefined}
        />
        {/* Register: Confirm Password */}
        {mode === 'register' && (
          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword && touched.confirmPassword ? errors.confirmPassword : ''}
            show={showConfirm}
            setShow={setShowConfirm}
            placeholder="Re-enter your password"
          />
        )}
        {/* Register: Role */}
        {mode === 'register' && (
          <div>
            <label className="block text-gray-700 font-medium mb-1">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.role && touched.role ? 'border-red-400 focus:ring-red-200' : 'focus:ring-blue-200'
              }`}
            >
              {roles.map((role) => (
                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
              ))}
            </select>
            {errors.role && touched.role && <div className="text-red-500 text-sm mt-1">{errors.role}</div>}
          </div>
        )}
        
        {/* General Error Message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.general}
          </div>
        )}
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 font-semibold rounded-lg shadow transition ${
            isLoading 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {mode === 'login' ? 'Logging in...' : 'Registering...'}
            </div>
          ) : (
            mode === 'login' ? 'Login' : 'Register'
          )}
        </button>
        {/* Toggle Link */}
        <div className="text-center text-gray-600 text-sm mt-2">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                className="text-blue-600 hover:underline font-medium"
                onClick={() => setMode('register')}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="text-blue-600 hover:underline font-medium"
                onClick={() => setMode('login')}
              >
                Login
              </button>
            </>
          )}
        </div>
        {/* Success Toast */}
        {submitted && !isLoading && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>{mode === 'login' ? 'Login successful! Redirecting...' : 'Registration successful! Redirecting...'}</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
