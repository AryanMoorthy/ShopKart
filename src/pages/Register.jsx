import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShoppingBag,
  ShieldCheck,
  Truck,
  Sparkles,
  Loader2
} from 'lucide-react';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Controlled form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to /home
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific validation error on user typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    if (serverError) setServerError('');
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (Backend requires >= 6 chars)
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Phone validation
    const cleanPhone = formData.phone.replace(/[\s-()]/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
      });

      if (result.success) {
        setSuccessMessage('Account created successfully! Redirecting to login...');
        // Clear form
        setFormData({ fullName: '', email: '', password: '', phone: '' });
        // Redirect to Login page after brief delay
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Registration successful! Please sign in with your new credentials.' }
          });
        }, 1500);
      } else {
        setServerError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setServerError('An unexpected error occurred. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden">
        
        {/* Left Brand Panel */}
        <div className="lg:col-span-5 gradient-brand p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative background blurs */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-purple-500/20 blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100 border border-white/20 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Join 500,000+ Happy Shoppers</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Create your ShopKart account today.
            </h2>
            <p className="mt-3 text-indigo-100/90 text-sm leading-relaxed">
              Unlock exclusive member deals, express checkout, order tracking, and personalized recommendations.
            </p>
          </div>

          <div className="relative z-10 my-8 space-y-4">
            <div className="flex items-center gap-3 text-sm text-indigo-100 bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
              <div className="p-2 rounded-lg bg-white/20 text-white">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Free Express Shipping</p>
                <p className="text-xs text-indigo-200">On all member orders over $35</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-indigo-100 bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
              <div className="p-2 rounded-lg bg-white/20 text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Secure HttpOnly Auth</p>
                <p className="text-xs text-indigo-200">Bank-grade encrypted sessions</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-indigo-200">
            <span>&copy; 2026 ShopKart Inc.</span>
            <span>All rights reserved.</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Register Customer Account
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Enter your details to create your customer profile.
              </p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div 
                id="register-server-error"
                className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-sm flex items-start gap-2.5 animate-shake"
              >
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Registration Failed</p>
                  <p className="text-xs text-rose-600 mt-0.5">{serverError}</p>
                </div>
              </div>
            )}

            {/* Success Alert */}
            {successMessage && (
              <div 
                id="register-success-alert"
                className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-sm flex items-center gap-2.5 animate-fade-in"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="font-medium text-xs sm:text-sm">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label 
                  htmlFor="fullName" 
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    disabled={isSubmitting}
                    className={`block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/70 rounded-xl border transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:outline-hidden ${
                      errors.fullName
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    disabled={isSubmitting}
                    className={`block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/70 rounded-xl border transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:outline-hidden ${
                      errors.email
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label 
                  htmlFor="phone" 
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    disabled={isSubmitting}
                    className={`block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/70 rounded-xl border transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:outline-hidden ${
                      errors.phone
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    disabled={isSubmitting}
                    className={`block w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/70 rounded-xl border transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:outline-hidden ${
                      errors.password
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.password}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Must be at least 6 characters long.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="register-submit-button"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm gradient-brand hover:opacity-95 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* Switch to Login */}
            <div className="mt-6 text-center pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  id="link-to-login"
                  className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1"
                >
                  Sign in here
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
