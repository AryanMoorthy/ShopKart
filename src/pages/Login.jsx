import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  LogIn, 
  ArrowRight, 
  ShoppingBag,
  Shield,
  Sparkles,
  Loader2,
  KeyRound
} from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Controlled form state
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Message passed from redirect (e.g., after successful registration)
  const [bannerMessage, setBannerMessage] = useState(location.state?.message || '');

  // If already authenticated, redirect to /home
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    if (loginError) setLoginError('');
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!credentials.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setBannerMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      });

      if (result.success) {
        // Successful login automatically stores HttpOnly cookie and fetches profile
        navigate('/home', { replace: true });
      } else {
        // Display backend error message or "Invalid Credentials"
        setLoginError(result.message || 'Invalid Credentials');
      }
    } catch (err) {
      setLoginError('Unable to connect to authentication service. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Card Header & Brand Icon */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to access your ShopKart account and shopping profile.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80">
          
          {/* Banner message from registration or logout */}
          {bannerMessage && (
            <div 
              id="login-banner-message"
              className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Success!</p>
                <p className="text-xs text-emerald-700 mt-0.5">{bannerMessage}</p>
              </div>
            </div>
          )}

          {/* Login Error Alert */}
          {loginError && (
            <div 
              id="login-error-alert"
              className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-shake"
            >
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Failed</p>
                <p className="text-xs text-rose-600 mt-0.5">{loginError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            
            {/* Email Address */}
            <div>
              <label 
                htmlFor="login-email" 
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  disabled={isSubmitting}
                  autoComplete="email"
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

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="login-password" 
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  autoComplete="current-password"
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
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="login-submit-button"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm gradient-brand hover:opacity-95 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Security Notice */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Protected by HttpOnly JWT Cookie Authentication</span>
          </div>

          {/* Switch to Register */}
          <div className="mt-6 text-center pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                id="link-to-register"
                className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1"
              >
                Create an account
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
