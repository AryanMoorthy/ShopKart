import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getWishlistApi, removeFromWishlistApi } from '../services/api';
import WishlistCard from '../components/WishlistCard';
import {
  Heart,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWishlistApi();
      if (data.success && Array.isArray(data.wishlist)) {
        setWishlist(data.wishlist);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      setError(
        err.response?.data?.message || "We couldn't load your wishlist."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    if (removingId) return;
    setRemovingId(productId);
    setActionNotice(null);

    try {
      await removeFromWishlistApi(productId);
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
      setActionNotice({ type: 'success', text: 'Product removed from your wishlist' });
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error('Failed to remove product from wishlist:', err);
      setActionNotice({
        type: 'error',
        text: err.response?.data?.message || 'Unable to remove product. Please try again.',
      });
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-6 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-3 border border-rose-100">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>Saved Items</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl" id="wishlist-heading">
              My Wishlist
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-2xl">
              Keep track of items you love. Return whenever you're ready to make them yours.
            </p>
          </div>

          {/* Wishlist Counter Badge */}
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <span 
              id="wishlist-counter-badge"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs shadow-xs"
            >
              <Layers className="w-4 h-4 text-rose-500" />
              <span>
                {loading
                  ? 'Loading...'
                  : `${wishlist.length} ${wishlist.length === 1 ? 'product' : 'products'} saved`}
              </span>
            </span>
          </div>
        </div>

        {/* Global Action Notification Banner */}
        {actionNotice && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center justify-between animate-fade-in ${
              actionNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{actionNotice.text}</span>
            <button
              onClick={() => setActionNotice(null)}
              className="text-xs underline opacity-80 hover:opacity-100 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-center" id="wishlist-loading-state">
            <div className="relative w-16 h-16 mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-rose-100 border-t-rose-600 animate-spin"></div>
              <Heart className="w-6 h-6 text-rose-600 absolute inset-0 m-auto animate-pulse fill-rose-500" />
            </div>
            <p className="text-base font-bold text-slate-800" id="wishlist-loading-text">
              Loading your wishlist...
            </p>
            <p className="text-xs text-slate-400 mt-1">Retrieving your saved products</p>
          </div>
        )}

        {/* 2. Error State */}
        {!loading && error && (
          <div className="my-12 p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center max-w-md mx-auto shadow-xs" id="wishlist-error-state">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-rose-900 mb-2">
              Something went wrong.
            </h3>
            <p className="text-sm text-rose-600 mb-6" id="wishlist-error-text">
              {error}
            </p>
            <button
              id="wishlist-retry-button"
              onClick={fetchWishlist}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/25 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* 3. Empty Wishlist State */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="py-20 px-6 bg-white border border-slate-200/80 rounded-3xl text-center max-w-lg mx-auto shadow-sm" id="wishlist-empty-state">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Heart className="w-8 h-8 fill-rose-500 text-rose-500 animate-bounce" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2" id="wishlist-empty-title">
              Your wishlist is empty
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-sm mx-auto mb-8">
              Save products you love and find them here later.
            </p>
            <Link
              to="/products"
              id="wishlist-browse-button"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white gradient-brand hover:opacity-95 shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* 4. Populated Wishlist Grid */}
        {!loading && !error && wishlist.length > 0 && (
          <div
            id="wishlist-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemove}
                isRemoving={removingId === product._id}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Wishlist;
