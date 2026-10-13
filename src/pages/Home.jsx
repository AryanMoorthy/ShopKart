import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfileApi, getWishlistApi, changePasswordApi } from '../services/api';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  Package, 
  Heart, 
  CreditCard, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  ShoppingBag, 
  ArrowUpRight, 
  Calendar, 
  Clock, 
  KeyRound,
  Loader2,
  Lock
} from 'lucide-react';

const Home = () => {
  const { user, setUser } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileData, setProfileData] = useState(user);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Change password modal & state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState({ error: '', success: '', loading: false });

  // Refresh profile and wishlist on mount
  useEffect(() => {
    const fetchLatestProfileAndWishlist = async () => {
      try {
        setLoadingProfile(true);
        const data = await getProfileApi();
        setProfileData(data);
        setUser(data);

        // Fetch live wishlist count
        const wishData = await getWishlistApi();
        if (wishData.success && Array.isArray(wishData.wishlist)) {
          setWishlistCount(wishData.wishlist.length);
        } else if (Array.isArray(data.wishlist)) {
          setWishlistCount(data.wishlist.length);
        }
      } catch (err) {
        console.error('Failed to fetch profile or wishlist:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchLatestProfileAndWishlist();
  }, [setUser]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordStatus({ error: '', success: '', loading: true });

    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setPasswordStatus({ error: 'Please fill in all fields', success: '', loading: false });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ error: 'New password must be at least 6 characters', success: '', loading: false });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ error: 'New passwords do not match', success: '', loading: false });
      return;
    }

    try {
      const res = await changePasswordApi({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });

      if (res.success) {
        setPasswordStatus({ error: '', success: 'Password changed successfully!', loading: false });
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordStatus({ error: '', success: '', loading: false });
        }, 1800);
      } else {
        setPasswordStatus({ error: res.message || 'Failed to change password', success: '', loading: false });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error changing password. Check your old password.';
      setPasswordStatus({ error: msg, success: '', loading: false });
    }
  };

  const customerName = profileData?.fullName || user?.fullName || 'Customer';
  const customerEmail = profileData?.email || user?.email || 'N/A';
  const customerPhone = profileData?.phone || user?.phone || 'N/A';
  const customerId = profileData?._id || user?._id || 'SK-882941';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl gradient-brand text-white p-6 sm:p-10 shadow-xl shadow-indigo-500/20">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 -mb-16 w-64 h-64 rounded-full bg-pink-500/20 blur-3xl"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100 border border-white/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Authenticated Customer Portal</span>
          </div>

          <h1 id="home-welcome-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Welcome back, <span className="text-yellow-300">{customerName}</span>!
          </h1>
          <p className="mt-2.5 text-indigo-100 text-sm sm:text-base leading-relaxed">
            Here is your ShopKart customer account summary. Your session is authenticated via secure HttpOnly cookies.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md text-xs font-semibold text-white border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Session: Active & Verified</span>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Customer Information & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Customer Details Card (Task 3 Core Requirement) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md shadow-slate-200/50 border border-slate-200/80">
            
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/25">
                  {customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 id="customer-name-display" className="text-lg font-bold text-slate-900 leading-tight">
                    {customerName}
                  </h2>
                  <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active Customer
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Fields List */}
            <div className="py-6 space-y-4">
              
              {/* Full Name */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</p>
                  <p id="profile-fullname" className="text-sm font-bold text-slate-800 mt-0.5 truncate">
                    {customerName}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
                  <p id="profile-email" className="text-sm font-bold text-slate-800 mt-0.5 truncate">
                    {customerEmail}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</p>
                  <p id="profile-phone" className="text-sm font-bold text-slate-800 mt-0.5">
                    {customerPhone}
                  </p>
                </div>
              </div>

              {/* Customer ID */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Key className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer ID</p>
                  <p id="profile-id" className="text-xs font-mono font-medium text-slate-600 mt-0.5 truncate">
                    {customerId}
                  </p>
                </div>
              </div>

            </div>

            {/* Profile footer / status info */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Data fetched from <code className="text-indigo-600 font-mono">/customers/me</code>
              </span>
            </div>

          </div>
        </div>

        {/* Right Column: E-commerce Account Overview & Quick Actions */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-indigo-600 mb-2">
                <Package className="w-5 h-5" />
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Live</span>
              </div>
              <p className="text-2xl font-black text-slate-900">0</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Active Orders</p>
            </div>

            <Link 
              to="/wishlist" 
              id="dashboard-wishlist-card"
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-rose-200 transition-all block group"
            >
              <div className="flex items-center justify-between text-rose-500 mb-2">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">Wishlist</span>
              </div>
              <p className="text-2xl font-black text-slate-900" id="dashboard-wishlist-count">{wishlistCount}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Saved Items</p>
            </Link>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-amber-500 mb-2">
                <CreditCard className="w-5 h-5" />
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Points</span>
              </div>
              <p className="text-2xl font-black text-slate-900">250</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">ShopKart Rewards</p>
            </div>

          </div>

          {/* Featured Shopping Catalog Preview */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md shadow-slate-200/50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recommended For You</h3>
                <p className="text-xs text-slate-500 mt-0.5">Special discounts for registered customers</p>
              </div>
              <a
                href="/products"
                id="home-explore-products-btn"
                className="text-xs font-bold text-white gradient-brand px-3.5 py-1.5 rounded-xl shadow-sm hover:opacity-95 transition-all flex items-center gap-1"
              >
                <span>Browse Catalog</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Product Card 1 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-indigo-200 transition-all hover:shadow-md group">
                <div className="h-32 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-slate-400 mb-3 group-hover:scale-[1.02] transition-transform">
                  <ShoppingBag className="w-10 h-10 text-indigo-400" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Wireless ANC Headphones</h4>
                    <p className="text-xs text-slate-500">Audio & Electronics</p>
                  </div>
                  <span className="text-sm font-extrabold text-indigo-600">$129.99</span>
                </div>
              </div>

              {/* Product Card 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-indigo-200 transition-all hover:shadow-md group">
                <div className="h-32 rounded-xl bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center text-slate-400 mb-3 group-hover:scale-[1.02] transition-transform">
                  <Sparkles className="w-10 h-10 text-violet-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Smart Fitness Tracker V2</h4>
                    <p className="text-xs text-slate-500">Wearables & Health</p>
                  </div>
                  <span className="text-sm font-extrabold text-indigo-600">$79.50</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-slide-up">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {passwordStatus.error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordStatus.error}</span>
              </div>
            )}

            {passwordStatus.success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordStatus.success}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Old Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  New Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordStatus.loading}
                  className="px-5 py-2 text-sm font-semibold text-white gradient-brand rounded-xl shadow-md hover:opacity-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {passwordStatus.loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
